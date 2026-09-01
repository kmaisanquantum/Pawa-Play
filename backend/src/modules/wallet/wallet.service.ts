import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

export type WalletTransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'BET'
  | 'WIN'
  | 'REFUND'
  | 'BONUS'
  | 'ADJUSTMENT'
  | 'COMMISSION';

interface RecordTransactionInput {
  userId: string;
  walletId: string;
  type: WalletTransactionType;
  amount: string; // signed decimal string, e.g. "-20.00" or "37.00"
  reference: string;
  idempotencyKey: string;
  client: PoolClient; // caller manages the transaction boundary
}

/**
 * Ledger-style wallet service. Balance is never stored/updated directly by
 * this service in a way that can drift from the transaction log — it is
 * always SUM(wallet_transactions.amount) for the wallet. cached_balance on
 * the wallets table is a read-optimization only, refreshed inside the same
 * DB transaction as each write, and is reconcilable at any time by replaying
 * wallet_transactions.
 */
@Injectable()
export class WalletService {
  constructor(private readonly pool: Pool) {}

  async getBalance(userId: string): Promise<string> {
    const { rows } = await this.pool.query(
      `SELECT COALESCE(SUM(amount), 0)::text AS balance
       FROM wallet_transactions wt
       JOIN wallets w ON w.id = wt.wallet_id
       WHERE w.user_id = $1 AND wt.status = 'COMPLETED'`,
      [userId],
    );
    return rows[0].balance;
  }

  /**
   * Records a transaction and refreshes cached_balance, all inside the
   * caller's open transaction (client). Enforces idempotency via the unique
   * constraint on wallet_transactions.idempotency_key — a repeat call with
   * the same key throws ConflictException rather than double-applying.
   *
   * Caller is responsible for locking the wallet row (SELECT ... FOR UPDATE)
   * before calling this when a balance check must be atomic with the write
   * (see BettingService.placeBet for the canonical example).
   */
  async recordTransaction(input: RecordTransactionInput): Promise<string> {
    const { client, walletId, userId, type, amount, reference, idempotencyKey } = input;

    const existing = await client.query(
      `SELECT id FROM wallet_transactions WHERE idempotency_key = $1`,
      [idempotencyKey],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException('Duplicate transaction (idempotency key already used).');
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount === 0) {
      throw new BadRequestException('Invalid transaction amount.');
    }

    const insert = await client.query(
      `INSERT INTO wallet_transactions
         (wallet_id, user_id, type, amount, currency_code, status, reference, idempotency_key)
       VALUES ($1, $2, $3, $4, 'PGK', 'COMPLETED', $5, $6)
       RETURNING id`,
      [walletId, userId, type, amount, reference, idempotencyKey],
    );

    await client.query(
      `UPDATE wallets
       SET cached_balance = cached_balance + $1, updated_at = now()
       WHERE id = $2`,
      [amount, walletId],
    );

    return insert.rows[0].id;
  }

  /** Locks the wallet row for the duration of the caller's transaction. */
  async lockWallet(client: PoolClient, userId: string) {
    const { rows } = await client.query(
      `SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE`,
      [userId],
    );
    if (rows.length === 0) {
      throw new BadRequestException('Wallet not found for user.');
    }
    return rows[0];
  }
}
