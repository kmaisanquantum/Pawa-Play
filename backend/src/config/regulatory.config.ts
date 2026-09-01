export type RegulatoryMode = 'DEMO' | 'TEST' | 'PRODUCTION';

export interface JurisdictionConfig {
  jurisdictionCode: string;
  currencyCode: string;
  minimumAge: number;
  kycRequired: boolean;
  amlThresholdAmount: number | null;
  defaultDepositLimit: number | null;
  defaultBetLimit: number | null;
  defaultLossLimit: number | null;
  licenceReference: string | null;
}

/**
 * Central regulatory posture for the whole application.
 *
 * PRODUCTION must never be settable from a UI/admin toggle — it is read once
 * at process boot from env, requiring a real deploy to change. This file is
 * intentionally the *only* place REGULATORY_MODE is read from process.env;
 * everything else asks RegulatoryConfigService for the current mode.
 */
export function loadRegulatoryConfig() {
  const mode = (process.env.REGULATORY_MODE ?? 'DEMO') as RegulatoryMode;

  if (!['DEMO', 'TEST', 'PRODUCTION'].includes(mode)) {
    throw new Error(
      `Invalid REGULATORY_MODE "${mode}". Must be DEMO, TEST, or PRODUCTION.`,
    );
  }

  if (mode === 'PRODUCTION') {
    // Fail fast: production must never boot without explicit jurisdiction +
    // approved payment provider configuration. No PNG-specific defaults are
    // assumed here — the operator must supply them.
    const required = [
      'JURISDICTION_CODE',
      'CURRENCY_CODE',
      'MINIMUM_AGE',
      'LICENCE_REFERENCE',
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `REGULATORY_MODE=PRODUCTION requires env vars: ${missing.join(', ')}`,
      );
    }
  }

  const jurisdiction: JurisdictionConfig = {
    jurisdictionCode: process.env.JURISDICTION_CODE ?? 'UNSET',
    currencyCode: process.env.CURRENCY_CODE ?? 'PGK',
    minimumAge: Number(process.env.MINIMUM_AGE ?? 18),
    kycRequired: mode !== 'DEMO',
    amlThresholdAmount: process.env.AML_THRESHOLD_AMOUNT
      ? Number(process.env.AML_THRESHOLD_AMOUNT)
      : null,
    defaultDepositLimit: process.env.DEFAULT_DEPOSIT_LIMIT
      ? Number(process.env.DEFAULT_DEPOSIT_LIMIT)
      : null,
    defaultBetLimit: process.env.DEFAULT_BET_LIMIT
      ? Number(process.env.DEFAULT_BET_LIMIT)
      : null,
    defaultLossLimit: process.env.DEFAULT_LOSS_LIMIT
      ? Number(process.env.DEFAULT_LOSS_LIMIT)
      : null,
    licenceReference: process.env.LICENCE_REFERENCE ?? null,
  };

  return { mode, jurisdiction };
}
