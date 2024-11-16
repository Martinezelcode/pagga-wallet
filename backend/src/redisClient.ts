import { createClient } from 'redis';
import { CONFIG } from './config';
import { Token, TokenTransfer } from './providers/interface';

let client: ReturnType<typeof createClient>;

// Cache key prefixes
const CACHE_KEYS = {
  TOKEN_PRICE: 'price',
  WALLET_TOKENS: 'tokens',
  WALLET_TRANSACTIONS: 'txs',
} as const;

// Cache durations in seconds
const CACHE_DURATION = {
  TOKEN_PRICE: 300,      // 5 minutes
  WALLET_TOKENS: 900,    // 15 minutes
  WALLET_TRANSACTIONS: 600,  // 10 minutes
} as const;

export const initRedis = async () => {
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('error', (err) => {
    console.error('Redis client error', err);
  });

  await client.connect();
  console.log('Connected to Redis');
};

// Generic cache helpers
function buildKey(prefix: string, ...parts: string[]): string {
  return [prefix, ...parts].join(':');
}

async function getFromCache<T>(key: string): Promise<T | null> {
  if (!client) throw new Error('Redis client is not initialized');
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

async function setToCache(key: string, value: any, duration: number): Promise<void> {
  if (!client) throw new Error('Redis client is not initialized');
  await client.set(key, JSON.stringify(value), { EX: duration });
}

// Token price cache functions
export async function getCachedTokenPrice(chainId: string, tokenAddress: string): Promise<number | null> {
  const key = buildKey(CACHE_KEYS.TOKEN_PRICE, chainId, tokenAddress);
  const price = await getFromCache<number>(key);
  return price;
}

export async function setCachedTokenPrice(chainId: string, tokenAddress: string, price: number): Promise<void> {
  const key = buildKey(CACHE_KEYS.TOKEN_PRICE, chainId, tokenAddress);
  await setToCache(key, price, CACHE_DURATION.TOKEN_PRICE);
}

// Wallet tokens cache functions
export async function getCachedWalletTokens(walletId: string, chainId: string): Promise<Token[] | null> {
  const key = buildKey(CACHE_KEYS.WALLET_TOKENS, chainId, walletId);
  const tokens = await getFromCache<Token[]>(key);
  return tokens;
}

export async function setCachedWalletTokens(walletId: string, chainId: string, tokens: Token[]): Promise<void> {
  const key = buildKey(CACHE_KEYS.WALLET_TOKENS, chainId, walletId);
  await setToCache(key, tokens, CACHE_DURATION.WALLET_TOKENS);
}

// Wallet transactions cache functions
export async function getCachedWalletTransactions(walletId: string, chainId: string): Promise<TokenTransfer[] | null> {
  const key = buildKey(CACHE_KEYS.WALLET_TRANSACTIONS, chainId, walletId);
  const transactions = await getFromCache<TokenTransfer[]>(key);
  return transactions;
}

export async function setCachedWalletTransactions(
  walletId: string, 
  chainId: string, 
  transactions: TokenTransfer[],
  limit: number = 10
): Promise<void> {
  const key = buildKey(CACHE_KEYS.WALLET_TRANSACTIONS, chainId, walletId);
  const limitedTransactions = transactions.slice(0, limit);
  await setToCache(key, limitedTransactions, CACHE_DURATION.WALLET_TRANSACTIONS);
}

export const closeRedis = async (): Promise<void> => {
  if (!client) throw new Error('Redis client is not initialized');
  await client.quit();
  console.log('Redis client disconnected');
};
