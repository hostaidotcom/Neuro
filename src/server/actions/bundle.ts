import { cache } from 'react';
import { z } from 'zod';

import { getHoldersClassification, getMintAccountInfo, getTokenHolders } from '@/lib/solana/helius';

// Types for bundle analysis
export interface BundleStats {
  bundleAddress: string;
  supplyPercentage: number;
  solSpent: number;
  uniqueWallets: number;
  currentHoldings: number;
  isPumpfunBundle: boolean;
  timestamp: number;
}

export interface MintBundleAnalysis {
  mintAddress: string;
  totalBundles: number;
  totalSolSpent: number;
  totalUniqueWallets: number;
  largestBundle: BundleStats;
  bundles: BundleStats[];
}

// Identify potential bundles from holder patterns
async function identifyBundles(mintAddress: string): Promise<MintBundleAnalysis | null> {
  try {
    console.log("---------------------------------started---------------------------------");
    console.log("mint address: ",mintAddress);
    // Get mint information
    const mintInfo = await getMintAccountInfo(mintAddress);
    console.log("mint info: ",mintInfo);
    const totalSupply = Number(mintInfo.supply) / 10 ** mintInfo.decimals;
    console.log("total supply: ",totalSupply);
    
    // Get classification for top holders to identify known addresses
    const { topHolders, totalHolders } = await getHoldersClassification(mintAddress);

    console.log("top holders: ",topHolders);

    // Group holders by potential bundle controllers
    const bundles: BundleStats[] = [];
    const processedWallets = new Set<string>();

    for (const holder of topHolders) {
      if (processedWallets.has(holder.owner)) continue;

      // Consider wallets that hold more than 1% of supply as potential bundle controllers
      if ((holder.balance / totalSupply) > 0.01) {
        console.log("classified as: ",holder.classification);
        console.log(holder);
        const bundleStats: BundleStats = {
          bundleAddress: holder.owner,
          supplyPercentage: (holder.balance / totalSupply) * 100,
          solSpent: holder.balance * 2, // Approximate SOL spent based on average mint price
          uniqueWallets: 1,
          currentHoldings: holder.balance,
          isPumpfunBundle: holder.classification?.toLowerCase().includes('pumpfun') || false,
          timestamp: Date.now(),
        };

        bundles.push(bundleStats);
        processedWallets.add(holder.owner);
      }
    }

    console.log("out of loop: ",bundles);

    // Sort bundles by supply percentage
    bundles.sort((a, b) => b.supplyPercentage - a.supplyPercentage);

    const analysis: MintBundleAnalysis = {
      mintAddress,
      totalBundles: bundles.length,
      totalSolSpent: bundles.reduce((sum, bundle) => sum + bundle.solSpent, 0),
      totalUniqueWallets: bundles.reduce((sum, bundle) => sum + bundle.uniqueWallets, 0),
      largestBundle: bundles[0] || null,
      bundles,
    };

    return analysis;
  } catch (error) {
    console.error('Error identifying bundles:', error);
    return null;
  }
}

// Cache the analysis for 30 seconds
export const analyzeMintBundles = cache(async (mintAddress: string) => {
  return await identifyBundles(mintAddress);
});