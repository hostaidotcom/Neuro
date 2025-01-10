// src/features/bundle-checker/types/index.ts
export interface BundleStats {
    percentageSupply: number;
    solSpent: number;
    uniqueWallets: number;
    currentHoldings: number;
    timestamp: number;
  }
  
  export interface Bundle {
    transactions: string[];
    stats: BundleStats;
    wallets: string[];
  }