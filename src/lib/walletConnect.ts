export interface HederaWallet {
  name: string;
  icon: string;
  connect: () => Promise<string>;
}

declare global {
  interface Window {
    hashconnect?: any;
  }
}

export const detectWallets = (): HederaWallet[] => {
  const wallets: HederaWallet[] = [];

  if (window.hashconnect) {
    wallets.push({
      name: 'HashPack',
      icon: '🔐',
      connect: async () => {
        const hashconnect = window.hashconnect;
        const appMetadata = {
          name: 'Torch AI',
          description: 'AI-powered personal assistant for Web3',
          icon: window.location.origin + '/favicon.ico',
        };

        await hashconnect.init(appMetadata, 'mainnet', false);
        const state = await hashconnect.connect();

        if (state.pairingData && state.pairingData.accountIds.length > 0) {
          return state.pairingData.accountIds[0];
        }

        throw new Error('No account connected');
      },
    });
  }

  wallets.push({
    name: 'Manual Entry',
    icon: '✍️',
    connect: async () => {
      const accountId = prompt('Enter your Hedera account ID (e.g., 0.0.12345):');
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      if (!/^0\.0\.\d+$/.test(accountId)) {
        throw new Error('Invalid account ID format. Use format: 0.0.12345');
      }

      return accountId;
    },
  });

  return wallets;
};

export async function verifyHederaAccount(accountId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId}`
    );
    return response.ok;
  } catch (error) {
    console.error('Error verifying account:', error);
    return false;
  }
}
