"use client";
import { useEffect, useState } from "react";
import {
  getArchPrice,
  getClients,
  getWallets,
  queryTotalBalance,
} from "./utils";
import { IBCData } from "./../data/ibc_data";

export default function Home() {
  const [rpcURL, setRpcURL] = useState<string>(
    "https://rpc.mainnet.archway.io:443"
  );
  const [codeId, setCodeId] = useState<number>(223);
  const [aum, setAum] = useState<Record<string, number>>({});
  const [archUSDValue, setArchUSDValue] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [archPrice, setArchPrice] = useState<number>(0);

  useEffect(() => {
    const getArchValue = async () => {
      const aarchTokens = aum["aarch"];
      if (aum["aarch"]) {
        const archTokens = aarchTokens / 10 ** 18; // Assuming 18 decimals for ARCH token
        setArchUSDValue(Math.round(archTokens * archPrice));
      }
    };
    getArchValue();
  }, [aum, archPrice]);

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

  function getDenom(ibcDenom: string): string {
    const key = ibcDenom + "__archway";
    const ibcData = IBCData[key];
    if (ibcData) {
      return ibcData.denom;
    }
    return ibcDenom;
  }

  async function queryAssetHandler() {
    setLoading(true);
    setAum({});
    setArchUSDValue(0);
    setArchPrice(await getArchPrice());

    const { stargateClient, cosmwasmClient } = await getClients(rpcURL);
    const addresses = await getWallets(cosmwasmClient, codeId);

    const batchSize = 10;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const end = Math.min(i + batchSize, addresses.length);
      const batchAddresses = addresses.slice(i, end);
      const response = await queryTotalBalance(stargateClient, batchAddresses);

      Object.entries(response).forEach(([denom, amount]) => {
        if (denom.startsWith("ibc/")) {
          denom = getDenom(denom);
        }
        setAum((prev) => ({ ...prev, [denom]: (prev[denom] || 0) + amount }));
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
              {Object.entries(aum).map(([denom, amount]) => (
                <tr key={denom}>
                  <td>{denom}</td>
                  <td>{amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {archUSDValue > 0 && (
        <div>
          <hr />
          <h1>ARCH value(USD): {archUSDValue}</h1>
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
