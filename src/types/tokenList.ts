export type ChainId = number | string;

export interface TokenListItem {
  symbol: string;
  name: string;
  address: string;
  chainId: ChainId;
  logoUrl: string;
  type?: string;
  decimals: number;
}

export interface ChainTokenGroup {
  chainId: ChainId;
  chainName: string;
  tokens: TokenListItem[];
}

export type TokenList = ChainTokenGroup[];
