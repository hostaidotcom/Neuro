'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  type ConnectedSolanaWallet,
  WalletWithMetadata,
} from '@privy-io/react-auth';
import { useDelegatedActions } from '@privy-io/react-auth';
import { useFundWallet, useSolanaWallets } from '@privy-io/react-auth/solana';
import {
  ArrowRightFromLine,
  ArrowUpDown,
  Banknote,
  HelpCircle,
  Loader2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import useSWR from 'swr';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { CopyableText } from '@/components/ui/copyable-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RPC_URL } from '@/lib/constants';
import { SolanaUtils } from '@/lib/solana';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

/**
 * WalletCard component for displaying and managing a Solana wallet
 * Features:
 * - Display wallet public key and balance
 * - Fund wallet functionality
 * - Send SOL to other addresses
 * - Transaction status handling
 */
export function PrivyWalletCard({ wallet }: { wallet: WalletWithMetadata }) {
  const { fundWallet } = useFundWallet();
  const { exportWallet } = useSolanaWallets();
  const { delegateWallet, revokeWallets } = useDelegatedActions();
  const [isLoading, setIsLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch SOL balance with auto-refresh every 30 seconds
  const { data: balance = 0, isLoading: isBalanceLoading } = useSWR(
    ['solana-balance', wallet.address],
    () => SolanaUtils.getBalance(wallet.address),
    { refreshInterval: 60000 },
  );

  /**
   * Handles sending SOL to another address
   * Includes validation, transaction processing, and error handling
   */
  const handleSendSol = async () => {
    try {
      setSendStatus('processing');
      setIsLoading(true);
      setErrorMessage(null);
    } catch (error) {
      setSendStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(errorMsg);
      toast.error('Transaction Failed', {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDelegate = async () => {
    if (!wallet || wallet.delegated) return; // Button is disabled to prevent this case
    await delegateWallet({
      address: wallet.address,
      chainType: 'solana',
    });
  };

  const onRevoke = async () => {
    if (!wallet.delegated) return; // Button is disabled to prevent this case
    await revokeWallets();
  };

  return (
    <>
      <Card className="bg-sidebar">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Wallet Public Key Display */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Public Key
              </Label>
              <div className="mt-1 font-mono text-xs">
                <div className="w-full">
                  <CopyableText text={wallet.address} showSolscan={true} />
                </div>
              </div>
            </div>

            {/* SOL Balance Display */}
            <div>
              <Label className="text-xs text-muted-foreground">Balance</Label>
              <div className="mt-1 text-lg font-medium">
                {isBalanceLoading ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : (
                  <span>{balance.toFixed(4)} SOL</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Fund Wallet Button */}
              <Button
                onClick={() =>
                  fundWallet(wallet.address, {
                    amount: '1.0',
                  })
                }
              >
                <Banknote className="mr-2 h-4 w-4" />
                <span>Fund</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => exportWallet({ address: wallet.address })}
              >
                <ArrowRightFromLine className="mr-2 h-4 w-4" />
                <span>Export</span>
              </Button>

              {/* Delegate Button */}
              {!wallet.delegated && (
                <Button
                  variant="outline"
                  disabled={wallet.delegated}
                  onClick={onDelegate}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Delegate</span>
                </Button>
              )}

              {wallet.delegated && (
                <Button
                  variant="outline"
                  disabled={!wallet.delegated}
                  onClick={onRevoke}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Revoke Delegation</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
