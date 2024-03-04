import { StargateClient } from "@cosmjs/stargate";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { IBCData } from "@/data/ibc_data";

// Connects to Stargate and CosmWasm clients
export async function getClients(rpcUrl: string) {
  const stargateClient = await StargateClient.connect(rpcUrl);
  const cosmwasmClient = await CosmWasmClient.connect(rpcUrl);
  return { stargateClient, cosmwasmClient };
}

// Queries balance for a specific address
export async function queryBalance(client: StargateClient, address: string) {
  try {
    const balanceResponse = await client.getAllBalances(address);
    return balanceResponse;
  } catch (error) {
    console.error("Error querying balance:", error);
  }
}

// Queries total balance for multiple addresses
export async function queryTotalBalance(
  client: StargateClient,
  addresses: readonly string[]
) {
  const denomAmountMap: Record<string, number> = {};
  try {
    const balancePromises = addresses.map((address) =>
      queryBalance(client, address)
    );
    const balances = await Promise.all(balancePromises);
    balances.forEach((balance) => {
      balance?.forEach(({ denom, amount }) => {
        denomAmountMap[denom] =
          (denomAmountMap[denom] || 0) + parseFloat(amount);
      });
    });
  } catch (error) {
    console.error("Error querying total balance:", error);
  }
  return denomAmountMap;
}

// Fetches addresses associated with a given code ID
export async function getWallets(client: CosmWasmClient, codeId: number) {
  const addresses = await client.getContracts(codeId);
  return addresses;
}

// Fetches the current price of ARCH token in USD
export async function getTokenPrice(chain: string) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=" +
        chain +
        "&vs_currencies=usd"
    );
    const data = await response.json();
    return data[chain]?.usd || 0;
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

export function getDenom(ibcDenom: string): string {
  const key = ibcDenom + "__archway";
  const ibcData = IBCData[key];
  if (ibcData) {
    return ibcData.denom;
  }
  return ibcDenom;
}

export function getChain(ibcDenom: string): string {
  if (ibcDenom === "aarch") {
    return "archway";
  }
  const key = ibcDenom + "__archway";
  const ibcData = IBCData[key];
  if (ibcData) {
    return ibcData.chain;
  }
  return ibcDenom;
}
