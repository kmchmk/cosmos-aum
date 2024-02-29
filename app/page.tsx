"use client";
import { useEffect, useState } from "react";
import { getUSDValue, queryAUM } from "./utils";

export default function Home() {
  const [rpcURL, setRpcURL] = useState<string>("https://rpc.mainnet.archway.io:443");
  const [codeId, setCodeId] = useState<number>(223);
  const [aum, setAum] = useState<Record<string, number>>({});
  const [archUSDValue, setArchUSDValue] = useState<number>(0);

  useEffect(() => {
    const getArchValue = async () => {
      if (aum["aarch"] !== undefined) {
        const usdValue = await getUSDValue(aum["aarch"]);
        setArchUSDValue(usdValue);
      }
    };
    getArchValue();
  }, [aum]);

  useEffect(() => {
    queryAssetHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function queryAssetHandler() {
    const response = await queryAUM(rpcURL, codeId);
    setAum(response);
  }

  return (
    <div>
      <div>
        <h2 key="aum-heading">RPC URL And Code ID</h2>
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
        <button onClick={queryAssetHandler}>Refetch Assets</button>
      </div>
      {Object.entries(aum).length > 0 && (
        <div>
          <hr />
          <h2 key="aum-heading">Assets Under Management</h2>
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
    </div>
  );
}
