export interface Token {
  chainId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRawInteger: string;
  balanceFormatted: string;
  balanceUsd: string;
  price: string;
  priceChange24h: string;
  logo: string | null;
  thumbnail: string | null;
  isNative: boolean;
  isSpam: boolean;
  isVerified: boolean;
  portfolioPercentage: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  blockTimestamp: string;
  blockNumber: string;
  fromLabel: string | null;
  toLabel: string | null;
  transactionFee: string;
  input: string;           // Raw input data for token transfers
  contractAddress: string | null;  // Contract address if token transfer
}

export interface TokenTransfer {
  hash: string;
  blockNumber: string;
  blockTimestamp: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string | null;
  tokenDecimals: number;
  from: string;
  fromLabel: string | null;
  fromEntityLogo: string | null;
  to: string;
  toLabel: string | null;
  toEntityLogo: string | null;
  value: string;
  valueFormatted: string;
  isSpam: boolean;
  isVerified: boolean;
  securityScore: number | null;
}

export interface DataProvider {
  getWalletTokens(address: string, chainId: string): Promise<Token[]>;
  getWalletTransactions(address: string, chainId: string): Promise<TokenTransfer[]>;
  getTokenPrice(tokenAddress: string, chainId: string): Promise<number>;
}

export abstract class BaseDataProvider implements DataProvider {
  abstract getWalletTokens(address: string, chainId: string): Promise<Token[]>;
  abstract getWalletTransactions(address: string, chainId: string): Promise<TokenTransfer[]>;
  abstract getTokenPrice(tokenAddress: string, chainId: string): Promise<number>;
}
