// config.ts
import dotenv from 'dotenv';

dotenv.config();

interface ChainConfig {
  RPC_URLS: Record<number, string>;
  CHAIN_TOKENS: Record<number, string[]>;
  PORT: number | string;
  MORALIS_API_KEY: string;
  REDIS_URL: string;
  CACHE_EXPIRATION: number;
  DEFAULT_CHAIN_IDS: string[];
  ONEINCH_API_KEY: string;
  // ... other config properties
}

export const CONFIG: ChainConfig = {
  RPC_URLS: {
    80084: 'https://berachain-bartio.g.alchemy.com/v2/vxBOXEbfA6HLZQoik3prSWUfGzREmLQU',
    //80084: 'https://cool-evocative-cloud.bera-bartio.quiknode.pro/537c6860fb837d42df228489bfc56b33549fdbfc',
    // Add other chain RPC URLs as needed
  },
  CHAIN_TOKENS: {
    80084: [
      // Add known token addresses for Berachain
      '0xaC0d56E871DbeecE3e576A4B64183eCd9a479195',
      '0x7507c1dc16935B82698e4C63f2746A2fCf994dF8',
      // etc
    ],
    // Add other chains as needed
  },

  PORT: process.env.PORT || 3000,
  MORALIS_API_KEY: process.env.MORALIS_API_KEY || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  ONEINCH_API_KEY: process.env.ONEINCH_API_KEY || '',
  CACHE_EXPIRATION: 300, // 5 minutes in seconds
  DEFAULT_CHAIN_IDS: ['1', '11155111'], // Ethereum mainnet and Sepolia testnet
};

// Validate required environment variables
if (!CONFIG.MORALIS_API_KEY) {
  throw new Error('MORALIS_API_KEY is not set in the environment variables');
}
