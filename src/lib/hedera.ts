const HEDERA_MIRROR_NODE = 'https://mainnet-public.mirrornode.hedera.com';

export interface HederaAccount {
  accountId: string;
  balance: number;
  tokens: Array<{
    tokenId: string;
    balance: number;
    symbol?: string;
    name?: string;
  }>;
  nfts: Array<{
    tokenId: string;
    serialNumber: number;
  }>;
}

export interface HederaTransaction {
  consensusTimestamp: string;
  transactionId: string;
  type: string;
  result: string;
  transfers: Array<{
    account: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    token_id: string;
    account: string;
    amount: number;
  }>;
}

export interface WalletAnalysis {
  totalBalance: number;
  balanceChange24h: number;
  transactionCount: number;
  uniqueInteractions: number;
  topTokens: Array<{
    symbol: string;
    balance: number;
    value: number;
  }>;
  recentActivity: Array<{
    type: string;
    timestamp: string;
    description: string;
    amount: number;
  }>;
  riskScore: number;
  insights: string[];
}

export async function getAccountInfo(accountId: string): Promise<HederaAccount | null> {
  try {
    const response = await fetch(`${HEDERA_MIRROR_NODE}/api/v1/accounts/${accountId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch account info');
    }

    const data = await response.json();

    const tokensResponse = await fetch(`${HEDERA_MIRROR_NODE}/api/v1/accounts/${accountId}/tokens`);
    const tokensData = tokensResponse.ok ? await tokensResponse.json() : { tokens: [] };

    const nftsResponse = await fetch(`${HEDERA_MIRROR_NODE}/api/v1/accounts/${accountId}/nfts`);
    const nftsData = nftsResponse.ok ? await nftsResponse.json() : { nfts: [] };

    return {
      accountId: data.account,
      balance: data.balance?.balance || 0,
      tokens: tokensData.tokens?.map((t: any) => ({
        tokenId: t.token_id,
        balance: t.balance,
        symbol: t.symbol,
        name: t.name,
      })) || [],
      nfts: nftsData.nfts?.map((nft: any) => ({
        tokenId: nft.token_id,
        serialNumber: nft.serial_number,
      })) || [],
    };
  } catch (error) {
    console.error('Error fetching Hedera account:', error);
    return null;
  }
}

export async function getAccountTransactions(
  accountId: string,
  limit: number = 50
): Promise<HederaTransaction[]> {
  try {
    const response = await fetch(
      `${HEDERA_MIRROR_NODE}/api/v1/transactions?account.id=${accountId}&limit=${limit}&order=desc`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const data = await response.json();

    return data.transactions?.map((tx: any) => ({
      consensusTimestamp: tx.consensus_timestamp,
      transactionId: tx.transaction_id,
      type: tx.name,
      result: tx.result,
      transfers: tx.transfers || [],
      tokenTransfers: tx.token_transfers,
    })) || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function analyzeWallet(accountId: string): Promise<WalletAnalysis> {
  const account = await getAccountInfo(accountId);
  const transactions = await getAccountTransactions(accountId, 100);

  if (!account) {
    return {
      totalBalance: 0,
      balanceChange24h: 0,
      transactionCount: 0,
      uniqueInteractions: 0,
      topTokens: [],
      recentActivity: [],
      riskScore: 0,
      insights: ['Unable to analyze wallet. Please check the account ID.'],
    };
  }

  const hbarBalance = account.balance / 100000000;

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const recentTxs = transactions.filter(tx => {
    const txTime = parseHederaTimestamp(tx.consensusTimestamp);
    return txTime > oneDayAgo;
  });

  let balanceChange = 0;
  recentTxs.forEach(tx => {
    tx.transfers.forEach(transfer => {
      if (transfer.account === accountId) {
        balanceChange += transfer.amount / 100000000;
      }
    });
  });

  const uniqueAccounts = new Set<string>();
  transactions.forEach(tx => {
    tx.transfers.forEach(transfer => {
      if (transfer.account !== accountId) {
        uniqueAccounts.add(transfer.account);
      }
    });
  });

  const topTokens = account.tokens
    .slice(0, 5)
    .map(token => ({
      symbol: token.symbol || token.tokenId,
      balance: token.balance,
      value: 0,
    }));

  const recentActivity = recentTxs.slice(0, 10).map(tx => ({
    type: tx.type,
    timestamp: tx.consensusTimestamp,
    description: formatTransactionDescription(tx, accountId),
    amount: calculateTransactionAmount(tx, accountId),
  }));

  const riskScore = calculateRiskScore(transactions, account);

  const insights = generateInsights(account, transactions, balanceChange);

  return {
    totalBalance: hbarBalance,
    balanceChange24h: balanceChange,
    transactionCount: transactions.length,
    uniqueInteractions: uniqueAccounts.size,
    topTokens,
    recentActivity,
    riskScore,
    insights,
  };
}

function parseHederaTimestamp(timestamp: string): number {
  const [seconds, nanos] = timestamp.split('.');
  return parseInt(seconds) * 1000 + parseInt(nanos) / 1000000;
}

function formatTransactionDescription(tx: HederaTransaction, accountId: string): string {
  const transfer = tx.transfers.find(t => t.account === accountId);
  if (!transfer) return tx.type;

  const amount = Math.abs(transfer.amount / 100000000);
  const direction = transfer.amount > 0 ? 'Received' : 'Sent';

  return `${direction} ${amount.toFixed(2)} HBAR`;
}

function calculateTransactionAmount(tx: HederaTransaction, accountId: string): number {
  const transfer = tx.transfers.find(t => t.account === accountId);
  return transfer ? transfer.amount / 100000000 : 0;
}

function calculateRiskScore(transactions: HederaTransaction[], account: HederaAccount): number {
  let score = 0;

  if (transactions.length < 10) score += 20;

  const failedTxs = transactions.filter(tx => tx.result !== 'SUCCESS').length;
  const failureRate = failedTxs / transactions.length;
  if (failureRate > 0.1) score += 30;

  const avgAmount = transactions.reduce((sum, tx) => {
    const amount = tx.transfers.reduce((s, t) => s + Math.abs(t.amount), 0);
    return sum + amount;
  }, 0) / transactions.length / 100000000;

  if (avgAmount > 1000) score += 20;

  if (account.tokens.length > 20) score += 15;

  return Math.min(100, Math.max(0, score));
}

function generateInsights(
  account: HederaAccount,
  transactions: HederaTransaction[],
  balanceChange: number
): string[] {
  const insights: string[] = [];

  if (balanceChange > 0) {
    insights.push(`Wallet grew by ${balanceChange.toFixed(2)} HBAR in the last 24 hours`);
  } else if (balanceChange < 0) {
    insights.push(`Wallet decreased by ${Math.abs(balanceChange).toFixed(2)} HBAR in the last 24 hours`);
  }

  if (transactions.length > 50) {
    insights.push('High transaction volume detected - active wallet');
  }

  if (account.tokens.length > 10) {
    insights.push(`Holds ${account.tokens.length} different tokens - diversified portfolio`);
  }

  if (account.nfts.length > 0) {
    insights.push(`Owns ${account.nfts.length} NFTs`);
  }

  const successRate = transactions.filter(tx => tx.result === 'SUCCESS').length / transactions.length;
  if (successRate < 0.9) {
    insights.push(`${((1 - successRate) * 100).toFixed(1)}% transaction failure rate - potential issues`);
  }

  return insights;
}

export async function getTokenInfo(tokenId: string) {
  try {
    const response = await fetch(`${HEDERA_MIRROR_NODE}/api/v1/tokens/${tokenId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}
