import axios from 'axios';
import { BaseDataProvider, Token, TokenTransfer } from './interface';
import { CONFIG } from '../config';

const MORALIS_API_BASE = 'https://deep-index.moralis.io/api/v2.2';

export class MoralisDataProvider extends BaseDataProvider {
  private readonly headers: Record<string, string>;

  constructor() {
    super();
    this.headers = {
      'accept': 'application/json',
      'X-API-Key': CONFIG.MORALIS_API_KEY
    };
  }

  async getWalletTokens(address: string, chainId: string): Promise<Token[]> {
    try {
      const response = await axios.get(
        `${MORALIS_API_BASE}/wallets/${address}/tokens`, {
        headers: this.headers,
        params: {
          chain: this.getChainName(chainId)
        }
      });

      return response.data.result.map((token: any) => ({
        chainId,
        contractAddress: token.token_address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals ? parseInt(token.decimals) : 18, // Default to 18 for native tokens
        balance: token.balance,
        balanceRawInteger: token.balance,
        balanceFormatted: token.balance_formatted,
        balanceUsd: token.usd_value?.toString() || '0',
        price: token.usd_price?.toString() || '0',
        priceChange24h: token.usd_price_24hr_percent_change?.toString() || '0',
        logo: token.logo || null,
        thumbnail: token.thumbnail || null,
        isNative: token.native_token || false,
        isSpam: token.possible_spam || false,
        isVerified: token.verified_contract || false,
        portfolioPercentage: token.portfolio_percentage?.toString() || '0'
      }));
    } catch (error) {
      console.error('Error fetching wallet tokens:', error);
      throw error;
    }
  }

  async getWalletTransactions(address: string, chainId: string): Promise<TokenTransfer[]> {
    try {
      const response = await axios.get(
        `${MORALIS_API_BASE}/${address}/erc20/transfers`, {
        headers: this.headers,
        params: {
          chain: this.getChainName(chainId),
          order: 'DESC',
          limit: 10
        }
      });

      return response.data.result.map((transfer: any) => ({
        hash: transfer.transaction_hash,
        blockNumber: transfer.block_number,
        blockTimestamp: transfer.block_timestamp,
        tokenAddress: transfer.address,
        tokenName: transfer.token_name,
        tokenSymbol: transfer.token_symbol,
        tokenLogo: transfer.token_logo,
        tokenDecimals: parseInt(transfer.token_decimals || '18'),
        from: transfer.from_address,
        fromLabel: transfer.from_address_label,
        fromEntityLogo: transfer.from_address_entity_logo,
        to: transfer.to_address,
        toLabel: transfer.to_address_label,
        toEntityLogo: transfer.to_address_entity_logo,
        value: transfer.value,
        valueFormatted: transfer.value_decimal,
        isSpam: transfer.possible_spam || false,
        isVerified: transfer.verified_contract || false,
        securityScore: transfer.security_score
      }));
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      throw error;
    }
  }

  private getChainName(chainId: string): string {
    const chainMap: Record<string, string> = {
      '1': 'eth',
      '10': 'optimism',
      '11155111': 'sepolia',
      '56': 'bsc',
      '137': 'polygon',
      '42161': 'arbitrum',
      '43114': 'avalanche',
      '8453': 'base',
      '100': 'gnosis',
    };
    return chainMap[chainId] || chainId;
  }

  // We don't need getTokenPrice anymore since the API returns prices
  async getTokenPrice(tokenAddress: string, chainId: string): Promise<number> {
    try {
      const response = await axios.get(
        `${MORALIS_API_BASE}/erc20/${tokenAddress}/price`, {
        headers: this.headers,
        params: {
          chain: this.getChainName(chainId)
        }
      });
      return response.data.usdPrice;
    } catch (error) {
      console.error(`Error fetching price for token ${tokenAddress}:`, error);
      return 0;
    }
  }
}
