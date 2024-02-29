import { StargateClient } from '@cosmjs/stargate';
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

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
export async function queryTotalBalance(client: StargateClient, addresses: readonly string[]) {
    try {
        const balancePromises = addresses.map(address => queryBalance(client, address));
        const balances = await Promise.all(balancePromises);
        const denomAmountMap: Record<string, number> = {};
        balances.forEach(balance => {
            balance?.forEach(({ denom, amount }) => {
                denomAmountMap[denom] = (denomAmountMap[denom] || 0) + parseFloat(amount);
            });
        });
        return denomAmountMap;
    }
    catch (error) {
        console.error("Error querying total balance:", error);
    }
}

// Fetches addresses associated with a given code ID
async function getWallets(client: CosmWasmClient, codeId: number) {
    const addresses = await client.getContracts(codeId);
    return addresses;
}

// Queries Asset Under Management (AUM)
export async function queryAUM(rpcUrl: string, codeId: number) {
    const { stargateClient, cosmwasmClient } = await getClients(rpcUrl);
    const addresses = await getWallets(cosmwasmClient, codeId);
    const aum = await queryTotalBalance(stargateClient, addresses);
    console.log("AUM:", aum);
    return aum || {};
}

// Fetches the current price of ARCH token in USD
export async function getArchPrice() {
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=archway&vs_currencies=usd");
        const data = await response.json();
        return data.archway.usd;
    } catch (error) {
        console.error("Error fetching ARCH price:", error);
    }
}

// Calculates the USD value of ARCH tokens
export async function getUSDValue(aarchTokens: number) {
    try {
        const archPrice = await getArchPrice();
        const archTokens = aarchTokens / (10 ** 18); // Assuming 18 decimals for ARCH token
        return Math.round(archTokens * archPrice);
    } catch (error) {
        console.error("Error calculating USD value:", error);
        return 0;
    }
}
