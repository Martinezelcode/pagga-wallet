import { BaseDataProvider, Token, TokenTransfer } from './interface';
import { CONFIG } from '../config';
import axios from 'axios';
import { ethers } from 'ethers';
import { RpcDataProvider } from './rpc';

interface TokenDetails {
  chain_id: number | null;
  contract_address: string;
  amount: number;
  price_to_usd: number;
  value_usd: number;
  abs_profit_usd: number | null;
  roi: number | null;
  status: number;
}

interface PortfolioResponse {
  result: TokenDetails[];
  meta: {
    system: {
      click_time: number;
      node_time: number;
      microservices_time: number;
      redis_time: number;
      total_time: number;
    };
  };
}

export class OneInchDataProvider extends BaseDataProvider {
  private readonly headers: Record<string, string>;
  private readonly balanceBaseURL: string = 'https://api.1inch.dev/balance/v1.2';
  private readonly portfolioBaseURL: string = 'https://api.1inch.dev/portfolio/portfolio/v4';

  constructor() {
    super();
    this.headers = {
      'Authorization': `Bearer ${CONFIG.ONEINCH_API_KEY}`
    };
  }

  async getWalletTokens(address: string, chainId: string): Promise<Token[]> {
    try {
      // Get balances
      const balanceResponse = await axios.get(
        `${this.balanceBaseURL}/${chainId}/balances/${address}`,
        { headers: this.headers }
      );

      // Get token details from portfolio API
      const portfolioResponse = await axios.get<PortfolioResponse>(
        `${this.portfolioBaseURL}/overview/erc20/details`,
        {
          headers: this.headers,
          params: {
            addresses: [address],
            chain_id: chainId,
            timerange: '1week',
            closed: true,
            closed_threshold: 1
          }
        }
      );

      const tokens: Token[] = [];
      const tokenDetails = new Map(
        portfolioResponse.data.result.map(detail => [
          detail.contract_address.toLowerCase(),
          detail
        ])
      );

      // Process each token balance
      for (const [tokenAddress, balance] of Object.entries(balanceResponse.data)) {
        const details = tokenDetails.get(tokenAddress.toLowerCase());
        const isNative = tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

        tokens.push({
          chainId,
          contractAddress: tokenAddress,
          name: isNative ? this.getNativeTokenName(Number(chainId)) : '', // You might want to fetch this separately
          symbol: isNative ? this.getNativeTokenSymbol(Number(chainId)) : '', // You might want to fetch this separately
          decimals: isNative ? 18 : 18, // You might want to fetch this separately
          balance: balance.toString(),
          balanceRawInteger: balance.toString(),
          balanceFormatted: details?.amount.toString() || '0',
          balanceUsd: details?.value_usd.toString() || '0',
          price: details?.price_to_usd.toString() || '0',
          priceChange24h: '0', // Not available in current endpoints
          logo: null,
          thumbnail: null,
          isNative,
          isSpam: false,
          isVerified: true,
          portfolioPercentage: details?.roi ? (details.roi * 100).toString() : '0'
        });
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching wallet tokens:', error);
      throw error;
    }
  }

  async getTokenPrice(tokenAddress: string, chainId: string): Promise<number> {
    try {
      const response = await axios.get<PortfolioResponse>(
        `${this.portfolioBaseURL}/overview/erc20/details`,
        {
          headers: this.headers,
          params: {
            addresses: [tokenAddress],
            chain_id: chainId,
            timerange: '1week'
          }
        }
      );

      const tokenDetail = response.data.result.find(
        detail => detail.contract_address.toLowerCase() === tokenAddress.toLowerCase()
      );

      return tokenDetail?.price_to_usd || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  async getWalletTransactions(address: string, chainId: string): Promise<TokenTransfer[]> {
    // The Portfolio API doesn't provide transaction history
    // Fallback to RPC implementation
    const rpcProvider = new RpcDataProvider();
    return rpcProvider.getWalletTransactions(address, chainId);
  }

  private getNativeTokenSymbol(chainId: number): string {
    const symbols: Record<number, string> = {
      1: 'ETH',
      10: 'ETH', // Optimism
      56: 'BNB',
      137: 'MATIC',
      42161: 'ETH', // Arbitrum
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
    };
    return names[chainId] || 'Unknown Chain';
  }
}
