import { DataProvider } from './interface';
import { MoralisDataProvider } from './moralis';
import { RpcDataProvider } from './rpc';

export enum ProviderType {
  MORALIS = 'moralis',
  RPC = 'rpc'
  // Add other providers here in the future
}

export class DataProviderFactory {
  static createProvider(type: ProviderType): DataProvider {
    switch (type) {
      case ProviderType.MORALIS:
        return new MoralisDataProvider();
      case ProviderType.RPC:
          return new RpcDataProvider();
      // Add cases for other providers here
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }
}
