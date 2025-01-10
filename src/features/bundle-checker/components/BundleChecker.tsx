// src/features/bundle-checker/components/BundleChecker.tsx
'use client';

import { useState } from 'react';
import { useBundleAnalysis } from '../hooks/useBundleAnalysis';

export function BundleChecker() {
  const [mintAddress, setMintAddress] = useState('');
  const { bundles, loading, error, analyzeMint } = useBundleAnalysis();
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="Enter mint address"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={() => analyzeMint(mintAddress)}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Bundles'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      {bundles.map((bundle, i) => (
        <div key={i} className="mb-4 p-4 border rounded">
          <h3 className="font-bold">Bundle {i + 1}</h3>
          <div>Unique Wallets: {bundle.stats.uniqueWallets}</div>
          <div>SOL Spent: {bundle.stats.solSpent}</div>
          <div>Supply %: {bundle.stats.percentageSupply}%</div>
          <div>Current Holdings: {bundle.stats.currentHoldings}</div>
        </div>
      ))}
    </div>
  );
}
