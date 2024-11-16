import express, { Request, Response } from 'express';
import { CONFIG } from './config';
import cors from 'cors';
import {
  initRedis,
  getCachedTokenPrice,
  setCachedTokenPrice,
  getCachedWalletTokens,
  setCachedWalletTokens,
  getCachedWalletTransactions,
  setCachedWalletTransactions,
  closeRedis
} from './redisClient';
import { DataProviderFactory, ProviderType } from './providers/factory';
import { Token, TokenTransfer } from './providers/interface';

const app = express();
app.use(cors());
const moralisProvider = DataProviderFactory.createProvider(ProviderType.MORALIS);
const rpcProvider = DataProviderFactory.createProvider(ProviderType.RPC);

function getProviderForChain(chainId: string) {
  if (chainId === '80084') {
    return rpcProvider;
  }
  return moralisProvider;
}

// GET wallet/token_list - Single chain tokens
app.get('/wallet/token_list', async (req: Request, res: Response) => {
  const { id, chain_id } = req.query;
  
  if (!id || !chain_id || chain_id.toString().includes(',')) {
    res.status(400).json({ 
      error: 'Invalid parameters. Requires single chain_id and wallet id' 
    });
    return
  }

  try {
    let tokens = await getCachedWalletTokens(id as string, chain_id as string);
    
    if (!tokens || tokens.length == 0) {
      const provider = getProviderForChain(chain_id as string);
      tokens = await provider.getWalletTokens(id as string, chain_id as string);
      await setCachedWalletTokens(id as string, chain_id as string, tokens);
    }
    res.json({ tokens });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET wallet/all_token_list - Multi-chain tokens
app.get('/wallet/all_token_list', async (req: Request, res: Response) => {
  const { id, chain_ids } = req.query;
  
  if (!id) {
    res.status(400).json({ error: 'Missing required parameter: id' });
    return
  }

  const chainIds = chain_ids ? 
    (chain_ids as string).split(',') : 
    CONFIG.DEFAULT_CHAIN_IDS;

  try {
    const tokensPerChain: Record<string, Token[]> = {};
    
    await Promise.all(
      chainIds.map(async (chainId) => {
        let tokens = await getCachedWalletTokens(id as string, chainId);
        
        if (!tokens || tokens.length == 0) {
          const provider = getProviderForChain(chainId);
          tokens = await provider.getWalletTokens(id as string, chainId);
          await setCachedWalletTokens(id as string, chainId, tokens);
        }
        
        tokensPerChain[chainId] = tokens;
      })
    );

    res.json({ tokens: tokensPerChain });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET wallet/history_list - Single chain transactions
app.get('/wallet/history_list', async (req: Request, res: Response) => {
  const { id, chain_id } = req.query;

  if (!id || !chain_id || chain_id.toString().includes(',')) {
    res.status(400).json({ 
      error: 'Invalid parameters. Requires single chain_id and wallet id' 
    });
    return
  }

  try {
    let transfers = await getCachedWalletTransactions(id as string, chain_id.toString());
    
    if (!transfers || transfers.length == 0) {
      const provider = getProviderForChain(chain_id as string);
      transfers = await provider.getWalletTransactions(id as string, chain_id.toString());
      await setCachedWalletTransactions(id as string, chain_id.toString(), transfers);
    }
    
    res.json({ transfers });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET wallet/all_history_list - Multi-chain transactions
app.get('/wallet/all_history_list', async (req: Request, res: Response) => {
  const { id, chain_ids } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Missing required parameter: id' });
    return
  }

  const chainIds = chain_ids ? 
    (chain_ids as string).split(',') : 
    CONFIG.DEFAULT_CHAIN_IDS;

  try {
    const transfersPerChain: Record<string, TokenTransfer[]> = {};
    
    await Promise.all(
      chainIds.map(async (chainId) => {
        let transfers = await getCachedWalletTransactions(id as string, chainId);
        
        if (!transfers || transfers.length == 0) {
          const provider = getProviderForChain(chainId);
          transfers = await provider.getWalletTransactions(id as string, chainId);
          await setCachedWalletTransactions(id as string, chainId, transfers);
        }
        
        transfersPerChain[chainId] = transfers;
      })
    );

    res.json({ transfers: transfersPerChain });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Server startup
async function startServer() {
  try {
    await initRedis();
    app.listen(CONFIG.PORT, () => {
      console.log(`Server is running on port ${CONFIG.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});
