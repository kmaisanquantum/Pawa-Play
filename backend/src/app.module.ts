import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { Pool } from 'pg';
import { RegulatoryConfigService } from './config/regulatory-config.service';
import { WalletService } from './modules/wallet/wallet.service';
import { BettingService } from './modules/betting/betting.service';
import { HealthController } from './common/health.controller';
import { BettingController } from './modules/betting/betting.controller';
import { WalletController } from './modules/wallet/wallet.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [HealthController, BettingController, WalletController],
  providers: [
    RegulatoryConfigService,
    WalletService,
    BettingService,
    {
      provide: Pool,
      useFactory: () =>
        new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        }),
    },
  ],
})
export class AppModule {}
