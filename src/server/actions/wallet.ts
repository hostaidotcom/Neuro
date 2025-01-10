'use server';

import { z } from 'zod';

import prisma from '@/lib/prisma';
import { ActionResponse, actionClient } from '@/lib/safe-action';
import { EmbeddedWallet } from '@/types/db';

import { verifyUser } from './user';

export const listEmbeddedWallets = actionClient.action<
  ActionResponse<EmbeddedWallet[]>
>(async () => {
  const authResult = await verifyUser();
  const userId = authResult?.data?.data?.id;

  if (!userId) {
    return {
      success: false,
      error: 'Authentication failed',
    };
  }

  const wallets = await prisma.wallet.findMany({
    where: { ownerId: userId },
  });

  return {
    success: true,
    data: wallets,
  };
});

export const getActiveWallet = actionClient.action<
  ActionResponse<EmbeddedWallet>
>(async () => {
  const authResult = await verifyUser();
  const userId = authResult?.data?.data?.id;

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const wallet = await prisma.wallet.findFirst({
    where: {
      ownerId: userId,
      active: true,
    },
  });

  if (!wallet) {
    return { success: false, error: 'Wallet not found' };
  }

  return {
    success: true,
    data: wallet,
  };
});

export const setActiveWallet = actionClient
  .schema(z.object({ publicKey: z.string() }))
  .action(async ({ parsedInput: { publicKey } }) => {
    const authResult = await verifyUser();
    const userId = authResult?.data?.data?.id;

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const wallet = await prisma.wallet.findFirst({
      where: {
        ownerId: userId,
        publicKey,
      },
    });

    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    const existingWallet = await prisma.wallet.findFirst({
      where: {
        ownerId: userId,
        active: true,
      },
    });

    if (existingWallet) {
      await prisma.wallet.update({
        where: {
          ownerId_publicKey: {
            ownerId: userId,
            publicKey: existingWallet.publicKey,
          },
        },
        data: {
          active: false,
        },
      });
    }

    await prisma.wallet.update({
      where: {
        ownerId_publicKey: {
          ownerId: userId,
          publicKey,
        },
      },
      data: {
        active: true,
      },
    });

    return {
      success: true,
    };
  });
