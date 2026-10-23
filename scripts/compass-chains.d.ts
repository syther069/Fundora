declare module '@circlefin/compass-chains' {
  export interface CompassChainDef {
    name: string;
    explorerUrl?: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    [key: string]: unknown;
  }
  export function getChain(params: Record<string, unknown> | number | string): CompassChainDef;
}
