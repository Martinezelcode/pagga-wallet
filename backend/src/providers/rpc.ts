import { BaseDataProvider, Token, TokenTransfer } from './interface';
import { ethers } from 'ethers';
import { CONFIG } from '../config';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

const TRANSFER_EVENT_INTERFACE = new ethers.Interface([
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  ]);
  

export class RpcDataProvider extends BaseDataProvider {
  private providers: Record<number, ethers.JsonRpcProvider> = {};

  constructor() {
    super();
    this.initializeProviders();
  }

  private initializeProviders() {
    Object.entries(CONFIG.RPC_URLS).forEach(([chainId, url]) => {
      this.providers[Number(chainId)] = new ethers.JsonRpcProvider(url);
    });
  }

  async getWalletTokens(address: string, chainId: string): Promise<Token[]> {
    const chainIdNum = Number(chainId);
    const provider = this.providers[chainIdNum];
    if (!provider) {
      throw new Error(`No RPC provider configured for chain ${chainId}`);
    }

    const tokens: Token[] = [];
    
    // Get native token balance
    const balance = await provider.getBalance(address);
    const balanceFormatted = ethers.formatEther(balance);
    
    const nativeToken: Token = {
      chainId,
      contractAddress: "0x0000000000000000000000000000000000000000",
      symbol: this.getNativeTokenSymbol(chainIdNum),
      name: this.getNativeTokenName(chainIdNum),
      balance: balance.toString(), // Convert BigInt to string
      decimals: 18,
      balanceRawInteger: balance.toString(),
      balanceFormatted,
      balanceUsd: "0",
      price: "0",
      priceChange24h: "0",
      logo: null,
      thumbnail: null,
      isNative: true,
      isSpam: false,
      isVerified: true,
      portfolioPercentage: "0"
    };
    tokens.push(nativeToken);

    const tokenList = CONFIG.CHAIN_TOKENS[chainIdNum] || [];
    
    for (const tokenAddress of tokenList) {
      try {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ERC20_ABI,
          provider
        );

        const [balanceBig, decimals, symbol, name] = await Promise.all([
          tokenContract.balanceOf(address),
          tokenContract.decimals(),
          tokenContract.symbol(),
          tokenContract.name()
        ]);

        // Convert BigInt values to strings immediately
        const balance = balanceBig.toString();
        const balanceFormatted = ethers.formatUnits(balance, decimals);

        tokens.push({
          chainId,
          contractAddress: tokenAddress,
          symbol,
          name,
          balance,
          balanceRawInteger: balance,
          balanceFormatted,
          balanceUsd: "0",
          price: "0",
          priceChange24h: "0",
          decimals: decimals.toString(),
          logo: null,
          thumbnail: null,
          isNative: false,
          isSpam: false,
          isVerified: true,
          portfolioPercentage: "0"
        });
      } catch (error) {
        console.error(`Error fetching token ${tokenAddress}:`, error);
      }
    }

    return tokens;
  }


  async getWalletTransactions(address: string, chainId: string): Promise<TokenTransfer[]> {
    const chainIdNum = Number(chainId);
    const provider = this.providers[chainIdNum];
    if (!provider) {
      throw new Error(`No RPC provider configured for chain ${chainId}`);
    }

    const transfers: TokenTransfer[] = [];
    const currentBlock = await provider.getBlockNumber();
    const BLOCK_RANGE = 20000;
    const CHUNK_SIZE = 2000;
    const fromBlock = currentBlock - BLOCK_RANGE;
    
    const tokenList = CONFIG.CHAIN_TOKENS[chainIdNum] || [];
    
    for (const tokenAddress of tokenList) {
      try {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ERC20_ABI,
          provider
        );

        // Get token metadata
        const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.decimals()
        ]);

        // Process in chunks
        for (let startBlock = fromBlock; startBlock < currentBlock; startBlock += CHUNK_SIZE) {
          const endBlock = Math.min(startBlock + CHUNK_SIZE, currentBlock);
          const TRANSFER_TOPIC = TRANSFER_EVENT_INTERFACE.getEvent('Transfer')!.topicHash;
          // Create filters for sent and received transfers
          const sentFilter = {
            address: tokenAddress,
            topics: [
              TRANSFER_TOPIC,
              ethers.zeroPadValue(address.toLowerCase(), 32),
              null
            ]
          };

          const receivedFilter = {
            address: tokenAddress,
            topics: [
              TRANSFER_TOPIC,
              null,
              ethers.zeroPadValue(address.toLowerCase(), 32)
            ]
          };

          // Get logs in parallel
          const [sentLogs, receivedLogs] = await Promise.all([
            provider.getLogs({
              ...sentFilter,
              fromBlock: startBlock,
              toBlock: endBlock
            }),
            provider.getLogs({
              ...receivedFilter,
              fromBlock: startBlock,
              toBlock: endBlock
            })
          ]);

          const allLogs = [...sentLogs, ...receivedLogs];
          
          // Process logs in batches
          const BATCH_SIZE = 100;
          for (let i = 0; i < allLogs.length; i += BATCH_SIZE) {
            const batch = allLogs.slice(i, i + BATCH_SIZE);
            
            // Get blocks in parallel for the batch
            const blocks = await Promise.all(
              batch.map(log => provider.getBlock(log.blockNumber))
            );

            batch.forEach((log, index) => {
              const block = blocks[index];
              if (!block) return;

              // Parse the transfer event
              const parsedLog = TRANSFER_EVENT_INTERFACE.parseLog({
                topics: log.topics as string[],
                data: log.data
              });

              if (!parsedLog) return;

              const [from, to, value] = parsedLog.args;

              transfers.push({
                hash: log.transactionHash,
                blockNumber: log.blockNumber.toString(),
                blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
                tokenAddress,
                tokenName,
                tokenSymbol,
                tokenLogo: null,
                tokenDecimals: tokenDecimals.toString(),
                from,
                fromLabel: null,
                fromEntityLogo: null,
                to,
                toLabel: null,
                toEntityLogo: null,
                value: value.toString(),
                valueFormatted: ethers.formatUnits(value, tokenDecimals),
                isSpam: false,
                isVerified: true,
                securityScore: null
              });
            });
          }
          
          // Add delay between chunks to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error fetching transfers for token ${tokenAddress}:`, error);
      }
    }

    // Sort all transfers by block timestamp descending
    transfers.sort((a, b) => 
      new Date(b.blockTimestamp).getTime() - new Date(a.blockTimestamp).getTime()
    );

    return transfers;
  }


  async getTokenPrice(tokenAddress: string, chainId: string): Promise<number> {
    // Implement price fetching logic here
    return 0;
  }

  private getNativeTokenSymbol(chainId: number): string {
    const symbols: Record<number, string> = {
      1: 'ETH',
      80084: 'BERA',
    };
    return symbols[chainId] || 'UNKNOWN';
  }

  private getNativeTokenName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum',
      80084: 'Berachain',
    };
    return names[chainId] || 'Unknown Chain';
  }
}
