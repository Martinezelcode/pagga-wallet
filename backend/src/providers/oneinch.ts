import { BaseDataProvider, Token, TokenTransfer } from './interface';
import { CONFIG } from '../config';
import axios from 'axios';
import { ethers } from 'ethers';
import { RpcDataProvider } from './rpc';

export class OneInchDataProvider extends BaseDataProvider {
  private readonly headers: Record<string, string>;
  private readonly baseURL: string = 'https://api.1inch.dev/balance/v1.2';
  private providers: Record<number, ethers.JsonRpcProvider> = {};

  constructor() {
    super();
    this.headers = {
      'Authorization': `Bearer ${CONFIG.ONEINCH_API_KEY}`
    };
    this.initializeProviders();
  }

  private initializeProviders() {
    Object.entries(CONFIG.RPC_URLS).forEach(([chainId, url]) => {
      this.providers[Number(chainId)] = new ethers.JsonRpcProvider(url);
    });
  }

  async getWalletTokens(address: string, chainId: string): Promise<Token[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${chainId}/balances/${address}`,
        { headers: this.headers }
      );

      const tokens: Token[] = [];
      
      // Process each token balance
      for (const [tokenAddress, balance] of Object.entries(response.data)) {
        try {
          // For native token (0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee)
          const isNative = tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
          const decimals = isNative ? 18 : await this.getTokenDecimals(tokenAddress, chainId);
          
          tokens.push({
            chainId,
            contractAddress: tokenAddress,
            name: isNative ? this.getNativeTokenName(Number(chainId)) : await this.getTokenName(tokenAddress, chainId),
            symbol: isNative ? this.getNativeTokenSymbol(Number(chainId)) : await this.getTokenSymbol(tokenAddress, chainId),
            decimals,
            balance: balance.toString(),
            balanceRawInteger: balance.toString(),
            balanceFormatted: ethers.formatUnits(balance, decimals),
            balanceUsd: '0',
            price: '0',
            priceChange24h: '0',
            logo: null,
            thumbnail: null,
            isNative,
            isSpam: false,
            isVerified: true,
            portfolioPercentage: '0'
          });
        } catch (error) {
          console.error(`Error processing token ${tokenAddress}:`, error);
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching wallet tokens:', error);
      throw error;
    }
  }

  private async getTokenDecimals(tokenAddress: string, chainId: string): Promise<number> {
    const provider = this.providers[Number(chainId)];
    if (!provider) {
      throw new Error(`No provider for chain ${chainId}`);
    }
    
    const contract = new ethers.Contract(
      tokenAddress,
      ['function decimals() view returns (uint8)'],
      provider
    );
    
    return await contract.decimals();
  }

  private async getTokenName(tokenAddress: string, chainId: string): Promise<string> {
    const provider = this.providers[Number(chainId)];
    if (!provider) {
      throw new Error(`No provider for chain ${chainId}`);
    }
    
    const contract = new ethers.Contract(
      tokenAddress,
      ['function name() view returns (string)'],
      provider
    );
    
    return await contract.name();
  }

  private async getTokenSymbol(tokenAddress: string, chainId: string): Promise<string> {
    const provider = this.providers[Number(chainId)];
    if (!provider) {
      throw new Error(`No provider for chain ${chainId}`);
    }
    
    const contract = new ethers.Contract(
      tokenAddress,
      ['function symbol() view returns (string)'],
      provider
    );
    
    return await contract.symbol();
  }

  async getWalletTransactions(address: string, chainId: string): Promise<TokenTransfer[]> {
    // Fallback to RPC implementation as 1inch doesn't provide transaction history
    const rpcProvider = new RpcDataProvider();
    return rpcProvider.getWalletTransactions(address, chainId);
  }

  async getTokenPrice(tokenAddress: string, chainId: string): Promise<number> {
    try {
      // Get token price from 1inch API
      const response = await axios.get(
        `${this.baseURL}/${chainId}/quote`, {
        headers: this.headers,
        params: {
          fromTokenAddress: tokenAddress,
          toTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native token
          amount: '1000000000000000000' // 1 token in wei
        }
      });

      return Number(response.data.toTokenAmount) / 1e18; // Convert to decimal
    } catch (error) {
      console.error(`Error fetching price for token ${tokenAddress}:`, error);
      return 0;
    }
  }

  private getNativeTokenSymbol(chainId: number): string {
    const symbols: Record<number, string> = {
      1: 'ETH',
      10: 'ETH', // Optimism
      56: 'BNB',
      137: 'MATIC',
      42161: 'ETH', // Arbitrum
      // Add more chains as needed
    };
    return symbols[chainId] || 'UNKNOWN';
  }

  private getNativeTokenName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum',
      10: 'Optimism Ethereum',
      56: 'Binance Coin',
      137: 'Polygon',
      42161: 'Arbitrum Ethereum',
      // Add more chains as needed
    };
    return names[chainId] || 'Unknown Chain';
  }
}
