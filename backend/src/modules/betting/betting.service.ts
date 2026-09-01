import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { v4 as uuid } from 'uuid';
import { WalletService } from '../wallet/wallet.service';
import { RegulatoryConfigService } from '../../config/regulatory-config.service';

interface PlaceBetInput {
  userId: string;
  selectionIds: string[];
  stake: string;
  idempotencyKey: string;
}

/**
 * Implements brief section 8's 12-step bet placement flow. Everything here
 * runs server-side inside a single DB transaction; nothing from the client
 * (odds, potential return, balance) is trusted — it is only used to look up
 * which selections/stake were requested.
 */
@Injectable()
export class BettingService {
  constructor(
    private readonly pool: Pool,
    private readonly wallet: WalletService,
    private readonly regulatoryConfig: RegulatoryConfigService,
  ) {}

  async placeBet(input: PlaceBetInput) {
    const { userId, selectionIds, stake, idempotencyKey } = input;
    const stakeAmount = Number(stake);

    if (!selectionIds?.length) {
      throw new BadRequestException('At least one selection is required.');
    }
    if (Number.isNaN(stakeAmount) || stakeAmount <= 0) {
      throw new BadRequestException('Stake must be a positive amount.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Authenticated user resolved by caller (controller) from JWT.

      // 2. KYC eligibility — DEMO mode allows NOT_STARTED so the vertical
      //    slice is testable end to end without a real KYC provider wired up.
      const kyc = await client.query(
        `SELECT status FROM kyc_profiles WHERE user_id = $1`,
        [userId],
      );
      const kycStatus = kyc.rows[0]?.status ?? 'NOT_STARTED';
      const kycOk =
        this.regulatoryConfig.isDemo() || kycStatus === 'VERIFIED';
      if (!kycOk) {
        throw new ForbiddenException('KYC verification required before betting.');
      }

      // 3. Self-exclusion check.
      const exclusion = await client.query(
        `SELECT id FROM self_exclusions
         WHERE user_id = $1 AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())`,
        [userId],
      );
      if (exclusion.rows.length > 0) {
        throw new ForbiddenException('Account is self-excluded from wagering.');
      }

      // 4. Responsible-gambling bet limit check.
      const betLimit = await client.query(
        `SELECT amount FROM responsible_gambling_limits
         WHERE user_id = $1 AND limit_type = 'BET' ORDER BY effective_from DESC LIMIT 1`,
        [userId],
      );
      if (betLimit.rows[0]?.amount && stakeAmount > Number(betLimit.rows[0].amount)) {
        throw new UnprocessableEntityException('Stake exceeds your configured bet limit.');
      }

      // 5. Lock wallet, recompute balance from ledger, check sufficiency.
      const walletRow = await this.wallet.lockWallet(client, userId);
      const balanceRes = await client.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS balance
         FROM wallet_transactions WHERE wallet_id = $1 AND status = 'COMPLETED'`,
        [walletRow.id],
      );
      const balance = Number(balanceRes.rows[0].balance);
      if (balance < stakeAmount) {
        throw new UnprocessableEntityException('Insufficient wallet balance.');
      }

      // 6 & 7. Re-fetch each selection's live odds/market/event status
      //    server-side; ignore any odds the client may have sent.
      const selections = await client.query(
        `SELECT s.id AS selection_id, o.decimal_odds, m.status AS market_status, e.status AS event_status
         FROM selections s
         JOIN markets m ON m.id = s.market_id
         JOIN events e ON e.id = m.event_id
         JOIN odds o ON o.selection_id = s.id AND o.is_active = true
         WHERE s.id = ANY($1::uuid[])`,
        [selectionIds],
      );
      if (selections.rows.length !== selectionIds.length) {
        throw new UnprocessableEntityException('One or more selections are unavailable.');
      }
      for (const row of selections.rows) {
        if (row.market_status !== 'OPEN' || row.event_status === 'FINISHED' || row.event_status === 'CANCELLED') {
          throw new UnprocessableEntityException('One or more markets are no longer open.');
        }
      }

      const totalOdds = selections.rows.reduce(
        (acc, row) => acc * Number(row.decimal_odds),
        1,
      );
      const potentialReturn = (stakeAmount * totalOdds).toFixed(2);

      // 8. Insert bet + bet_items with odds snapshot.
      const betInsert = await client.query(
        `INSERT INTO bets (user_id, stake, total_odds, potential_return, status, idempotency_key)
         VALUES ($1, $2, $3, $4, 'OPEN', $5) RETURNING id`,
        [userId, stakeAmount.toFixed(2), totalOdds.toFixed(3), potentialReturn, idempotencyKey],
      );
      const betId = betInsert.rows[0].id;

      for (const row of selections.rows) {
        await client.query(
          `INSERT INTO bet_items (bet_id, selection_id, odds_at_placement, result)
           VALUES ($1, $2, $3, 'PENDING')`,
          [betId, row.selection_id, row.decimal_odds],
        );
      }

      // 9. Debit wallet via the ledger (negative amount), same transaction.
      await this.wallet.recordTransaction({
        client,
        userId,
        walletId: walletRow.id,
        type: 'BET',
        amount: (-stakeAmount).toFixed(2),
        reference: `bet:${betId}`,
        idempotencyKey: `${idempotencyKey}:debit`,
      });

      // 10. Audit record.
      await client.query(
        `INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, after_state)
         VALUES ($1, 'USER', 'BET_PLACED', 'bets', $2, $3)`,
        [userId, betId, JSON.stringify({ stake: stakeAmount, totalOdds, potentialReturn })],
      );

      // 11. Commit.
      await client.query('COMMIT');

      // 12. Return transaction/bet ID.
      return { betId, status: 'OPEN', potentialReturn };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
