// src/features/bundle-checker/components/BundleChecker.tsx
'use client';

import { useState } from 'react';
import { useBundleAnalysis } from '../hooks/useBundleAnalysis';

export function BundleChecker() {
  const [mintAddress, setMintAddress] = useState('');
  const { bundles, loading, error, analyzeMint } = useBundleAnalysis();

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6 bg-white shadow rounded-lg">
      <div className="space-y-4">
        {/* Input Field */}
        <input
          type="text"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="Enter mint address"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Analyze Button */}
        <button
          onClick={() => analyzeMint(mintAddress)}
          disabled={loading || !mintAddress.trim()}
          className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Analyzing...' : 'Analyze Bundles'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Bundles Display */}
      {bundles.length > 0 && (
        <div className="space-y-4">
          {bundles.map((bundle, i) => (
            <div
              key={i}
              className="p-4 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Bundle {i + 1}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-semibold">Unique Wallets:</span>{' '}
                  {bundle.stats.uniqueWallets}
                </p>
                <p>
                  <span className="font-semibold">SOL Spent:</span>{' '}
                  {bundle.stats.solSpent}
                </p>
                <p>
                  <span className="font-semibold">Supply %:</span>{' '}
                  {bundle.stats.percentageSupply}%
                </p>
                <p>
                  <span className="font-semibold">Current Holdings:</span>{' '}
                  {bundle.stats.currentHoldings}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Bundles Message */}
      {!loading && bundles.length === 0 && (
        <div className="text-gray-500 text-center">
          No bundles to display. Enter a mint address and analyze.
        </div>
      )}
    </div>
  );
}
