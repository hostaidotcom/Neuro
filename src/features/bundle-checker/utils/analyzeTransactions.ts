// src/features/bundle-checker/utils/analyzeTransactions.ts
import { Connection, PublicKey } from '@solana/web3.js';
import type { Bundle } from '../types';

export async function analyzeTransactions(
  mintAddress: string,
  connection: Connection
): Promise<Bundle[]> {
  const mint = new PublicKey(mintAddress);
  const signatures = await connection.getSignaturesForAddress(mint);
  
  // Group transactions that occurred within a small time window
  const timeWindow = 1000; // 1 second window
  let currentBundle: string[] = [];
  let bundles: string[][] = [];
  
  for (let i = 0; i < signatures.length - 1; i++) {
    const currentTx = signatures[i];
    const nextTx = signatures[i + 1];
    
    if (!currentTx.blockTime || !nextTx.blockTime) continue;
    
    currentBundle.push(currentTx.signature);
    
    if (Math.abs(currentTx.blockTime - nextTx.blockTime) > timeWindow) {
      if (currentBundle.length > 1) {
        bundles.push([...currentBundle]);
      }
      currentBundle = [];
    }
  }
  
  // Analyze each bundle
  const analyzedBundles: Bundle[] = await Promise.all(
    bundles.map(async (bundleTxs) => {
      const txData = await Promise.all(
        bundleTxs.map(sig => connection.getTransaction(sig))
      );
      
      const wallets = new Set<string>();
      let solSpent = 0;
      
      txData.forEach(tx => {
        if (!tx) return;
        wallets.add(tx.transaction.message.accountKeys[0].toString());
        // Add SOL spent calculation here
      });
      
      return {
        transactions: bundleTxs,
        stats: {
          percentageSupply: 0, // Calculate based on mint info
          solSpent,
          uniqueWallets: wallets.size,
          currentHoldings: 0, // Need to fetch current token accounts
          timestamp: txData[0]?.blockTime || 0
        },
        wallets: Array.from(wallets)
      };
    })
  );
  
  return analyzedBundles;
}