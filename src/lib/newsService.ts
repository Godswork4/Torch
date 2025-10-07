export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  content: string;
  category: string;
}

const HEDERA_NEWS_SOURCES = [
  'hedera.com/blog',
  'coindesk.com',
  'cointelegraph.com',
  'decrypt.co',
];

export async function fetchHederaNews(): Promise<NewsArticle[]> {
  const searchTerms = ['Hedera', 'HBAR', 'Hedera Hashgraph', 'Hedera DeFi'];

  const mockNews: NewsArticle[] = [
    {
      title: 'Hedera Network Processes Record Number of Transactions',
      url: 'https://hedera.com/blog/record-transactions',
      source: 'Hedera Blog',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      content: 'The Hedera network has achieved a new milestone, processing over 1 billion transactions with unprecedented efficiency and low fees. This marks a significant achievement for enterprise blockchain adoption.',
      category: 'Network',
    },
    {
      title: 'Major DeFi Protocol Launches on Hedera Mainnet',
      url: 'https://coindesk.com/hedera-defi',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      content: 'A leading decentralized finance protocol has announced its official launch on Hedera, bringing advanced trading capabilities and yield farming opportunities to the ecosystem.',
      category: 'DeFi',
    },
    {
      title: 'Hedera Council Expands with New Fortune 500 Member',
      url: 'https://hedera.com/blog/new-council-member',
      source: 'Hedera',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      content: 'The Hedera Governing Council welcomes a new Fortune 500 member, strengthening the network\'s commitment to decentralized governance and enterprise adoption.',
      category: 'Governance',
    },
    {
      title: 'HBAR Price Surges Following Major Partnership Announcement',
      url: 'https://decrypt.co/hbar-price-surge',
      source: 'Decrypt',
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      content: 'HBAR token sees significant price movement after Hedera announces strategic partnership with global technology leader, expanding use cases for the network.',
      category: 'Markets',
    },
    {
      title: 'Hedera NFT Marketplace Reaches 1 Million Minted Assets',
      url: 'https://cointelegraph.com/hedera-nft-milestone',
      source: 'Cointelegraph',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      content: 'The Hedera ecosystem celebrates a major NFT milestone as the combined marketplaces surpass 1 million minted non-fungible tokens, showcasing growing creator adoption.',
      category: 'NFTs',
    },
  ];

  return mockNews;
}

export function formatNewsForSummary(articles: NewsArticle[]): string {
  return articles.map((article, index) =>
    `${index + 1}. ${article.title}\n   Source: ${article.source}\n   ${article.content.slice(0, 150)}...\n`
  ).join('\n');
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
