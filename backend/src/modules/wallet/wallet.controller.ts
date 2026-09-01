import { Controller, Get, Post, Body, Headers, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { RealMoney } from '../../common/decorators/real-money.decorator';
import { RegulatoryModeGuard } from '../../common/guards/regulatory-mode.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegulatoryConfigService } from '../../config/regulatory-config.service';
import { Pool } from 'pg';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(AuthGuard, RegulatoryModeGuard)
export class WalletController {
  constructor(
    private readonly wallet: WalletService,
    private readonly regulatoryConfig: RegulatoryConfigService,
    private readonly pool: Pool,
  ) {}

  @Get('balance')
  async balance(@CurrentUser() userId: string) {
    const { mode } = this.regulatoryConfig.current();
    return {
      currencyCode: 'PGK',
      balance: await this.wallet.getBalance(userId),
      regulatoryMode: mode,
    };
  }

  @Post('deposit')
  @RealMoney()
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  async deposit(
    @CurrentUser() userId: string,
    @Body() body: { amount: string },
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required.');
    }
    if (!this.regulatoryConfig.isDemo()) {
      // TEST/PRODUCTION route through PaymentProviderInterface adapters
      // (Phase 3) instead of crediting the wallet directly.
      throw new BadRequestException(
        'Direct wallet credit is only permitted in DEMO mode. Use a payment provider in TEST/PRODUCTION.',
      );
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const walletRow = await this.wallet.lockWallet(client, userId);
      const txnId = await this.wallet.recordTransaction({
        client,
        userId,
        walletId: walletRow.id,
        type: 'DEPOSIT',
        amount: Number(body.amount).toFixed(2),
        reference: 'demo-deposit',
        idempotencyKey,
      });
      await client.query(
        `INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, after_state)
         VALUES ($1, 'USER', 'DEMO_DEPOSIT', 'wallet_transactions', $2, $3)`,
        [userId, txnId, JSON.stringify({ amount: body.amount })],
      );
      await client.query('COMMIT');
      return { transactionId: txnId, status: 'COMPLETED' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
