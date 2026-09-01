import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REAL_MONEY_KEY } from '../decorators/real-money.decorator';
import { RegulatoryConfigService } from '../../config/regulatory-config.service';

@Injectable()
export class RegulatoryModeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private regulatoryConfig: RegulatoryConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isRealMoney = this.reflector.get<boolean>(
      REAL_MONEY_KEY,
      context.getHandler(),
    );
    if (!isRealMoney) return true;

    const { mode } = this.regulatoryConfig.current();

    if (mode === 'PRODUCTION' && !this.regulatoryConfig.hasApprovedProvider()) {
      // Belt-and-braces: even if mode says PRODUCTION, refuse to move real
      // money until at least one payment provider is explicitly approved.
      throw new ForbiddenException(
        'No approved payment provider configured for PRODUCTION mode.',
      );
    }

    // DEMO and TEST always pass through to the handler, which is
    // responsible for routing to the simulated wallet/payment path.
    return true;
  }
}
