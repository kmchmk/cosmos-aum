export const denoms: { [key: string]: { chain: string; decimals: number } } = {
  aarch: {
    chain: "archway",
    decimals: 18,
  },
  uosmo: {
    chain: "osmosis",
    decimals: 6,
  },
  uatom: {
    chain: "cosmos",
    decimals: 6,
  },
  untrn: {
    chain: "neutron",
    decimals: 6,
  },
  uusdc: {
    chain: "usd-coin",
    decimals: 6,
  },
  "weth-wei": {
    chain: "weth",
    decimals: 18,
  },
  "wbtc-satoshi": {
    chain: "wrapped-bitcoin",
    decimals: 8,
  },
  uaxl: {
    chain: "axelar",
    decimals: 6,
  },
  unibi: {
    chain: "nibiru",
    decimals: 6,
  },
};
