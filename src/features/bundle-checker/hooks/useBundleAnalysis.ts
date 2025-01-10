// src/features/bundle-checker/hooks/useBundleAnalysis.ts
'use client';

import { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { analyzeTransactions } from '../utils/analyzeTransactions';
import type { Bundle } from '../types';

export function useBundleAnalysis() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function analyzeMint(mintAddress: string) {
    try {
      setLoading(true);
      setError(null);
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const results = await analyzeTransactions(mintAddress, connection);
      setBundles(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }
  
  return { bundles, loading, error, analyzeMint };
}