import { ConflictException } from '@nestjs/common';
import { WalletService } from '../../src/modules/wallet/wallet.service';

function mockClient(existingIdempotencyRows: any[] = []) {
  return {
    query: jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('SELECT id FROM wallet_transactions WHERE idempotency_key')) {
        return { rows: existingIdempotencyRows };
      }
      if (sql.includes('INSERT INTO wallet_transactions')) {
        return { rows: [{ id: 'txn-1' }] };
      }
      return { rows: [] };
    }),
  };
}

describe('WalletService', () => {
  it('rejects a duplicate idempotency key without writing a second transaction', async () => {
    const pool = {} as any;
    const service = new WalletService(pool);
    const client = mockClient([{ id: 'existing-txn' }]);

    await expect(
      service.recordTransaction({
        client: client as any,
        userId: 'user-1',
        walletId: 'wallet-1',
        type: 'DEPOSIT',
        amount: '20.00',
        reference: 'test',
        idempotencyKey: 'dup-key',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    // Only the idempotency check ran — no INSERT was attempted.
    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it('records a valid transaction and updates cached_balance in the same call', async () => {
    const pool = {} as any;
    const service = new WalletService(pool);
    const client = mockClient([]);

    const id = await service.recordTransaction({
      client: client as any,
      userId: 'user-1',
      walletId: 'wallet-1',
      type: 'BET',
      amount: '-20.00',
      reference: 'bet:1',
      idempotencyKey: 'unique-key',
    });

    expect(id).toBe('txn-1');
    const calls = client.query.mock.calls.map((c: any[]) => c[0]);
    expect(calls.some((sql: string) => sql.includes('INSERT INTO wallet_transactions'))).toBe(true);
    expect(calls.some((sql: string) => sql.includes('UPDATE wallets'))).toBe(true);
  });
});
