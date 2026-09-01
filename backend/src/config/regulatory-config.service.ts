import { Injectable } from '@nestjs/common';
import { loadRegulatoryConfig, RegulatoryMode, JurisdictionConfig } from './regulatory.config';

@Injectable()
export class RegulatoryConfigService {
  private readonly config = loadRegulatoryConfig();

  // In PRODUCTION this should be backed by the payment_providers table
  // (is_approved = true rows). Stubbed here for Phase 0.
  private approvedProviderPresent = false;

  current(): { mode: RegulatoryMode; jurisdiction: JurisdictionConfig } {
    return this.config;
  }

  hasApprovedProvider(): boolean {
    return this.approvedProviderPresent;
  }

  isDemo(): boolean {
    return this.config.mode === 'DEMO';
  }
}
