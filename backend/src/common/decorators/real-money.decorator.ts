import { SetMetadata } from '@nestjs/common';

export const REAL_MONEY_KEY = 'isRealMoney';

/**
 * Marks a controller method as one that moves real money. Combined with
 * RegulatoryModeGuard, this ensures such endpoints only execute against
 * live funds when REGULATORY_MODE=PRODUCTION and the relevant payment
 * provider/jurisdiction config rows are approved. In DEMO/TEST mode these
 * endpoints still run, but against simulated balances only.
 */
export const RealMoney = () => SetMetadata(REAL_MONEY_KEY, true);
