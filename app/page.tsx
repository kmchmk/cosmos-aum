"use client";
import { useEffect, useState } from "react";
import {
  getTokenPrice,
  getClients,
  getWallets,
  queryTotalBalance,
  getDenom,
} from "./utils";
import { denoms } from "./constants";

export default function Home() {
  const [rpcURL, setRpcURL] = useState<string>(
    "https://rpc.mainnet.archway.io:443"
  );
  const [codeId, setCodeId] = useState<number>(223);
  const [aum, setAum] = useState<Record<string, number>>({});
  const [usdValue, setUsdValue] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenPrice, setTokenPrice] = useState<Record<string, number>>({});

  useEffect(() => {
    let totalUsdValue = 0;
    for (const [ibcDenom, amount] of Object.entries(aum)) {
      const denom = getDenom(ibcDenom);
      const decimals = denoms[denom]?.decimals || 0;
      const tokens = amount / 10 ** decimals;
      const price = tokenPrice[denom] || 0;
      totalUsdValue += tokens * price;
    }
    setUsdValue(Math.round(totalUsdValue));
  }, [aum, tokenPrice]);

  useEffect(() => {
    queryAssetHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, [progress]);

  async function updateTokenPrices() {
    for (const [denom, config] of Object.entries(denoms)) {
      const price = await getTokenPrice(config.chain);
      setTokenPrice((prev) => ({ ...prev, [denom]: price }));
    }
  }

  async function queryAssetHandler() {
    setLoading(true);
    setAum({});
    updateTokenPrices();

    const { stargateClient, cosmwasmClient } = await getClients(rpcURL);
    const addresses = await getWallets(cosmwasmClient, codeId);

    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const end = Math.min(i + batchSize, addresses.length);
      const batchAddresses = addresses.slice(i, end);
      const response = await queryTotalBalance(stargateClient, batchAddresses);

      Object.entries(response).forEach(([ibcDenom, amount]) => {
        setAum((prev) => ({
          ...prev,
          [ibcDenom]: (prev[ibcDenom] || 0) + amount,
        }));
      });

      setProgress(Math.round((end * 100) / addresses.length));
    }
    setLoading(false);
  }

  return (
    <div>
      <div>
        <h2>RPC URL And Code ID</h2>
        <input
          type="text"
          value={rpcURL}
          onChange={(e) => setRpcURL(e.target.value)}
          placeholder="Enter RPC URL here..."
        />
        <input
          type="number"
          value={codeId}
          onChange={(e) => setCodeId(e.target.valueAsNumber)}
          placeholder="Enter code ID here..."
        />
        <button onClick={queryAssetHandler} disabled={loading}>
          {loading ? "Fetching..." : "Refetch Assets"}
        </button>
      </div>
      {Object.entries(aum).length > 0 && (
        <div>
          <hr />
          <h2>Assets Under Management</h2>
          <table>
            <thead>
              <tr>
                <th>Denom</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(aum).map(([ibcDenom, amount]) => (
                <tr key={ibcDenom}>
                  <td>
                    {getDenom(ibcDenom)}
                    {tokenPrice[getDenom(ibcDenom)] ? (
                      <div>({tokenPrice[getDenom(ibcDenom)]} USD/Token)</div>
                    ) : (
                      <div>{"(fetching price...)"}</div>
                    )}
                  </td>
                  <td>{amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {usdValue > 0 && (
        <div>
          <hr />
          <h1>Total value(USD): {usdValue}</h1>
        </div>
      )}
      {loading && (
        <div>
          <progress value={progress} max={100} />
          <p>Progress: {progress}%</p>
        </div>
      )}
    </div>
  );
}
