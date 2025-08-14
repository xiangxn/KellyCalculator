import React, { useState } from "react";

interface Props {
  defaultEntryPrice?: number;
  defaultStopLossPrice?: number;
  defaultTargetPrice?: number;
  defaultIsLong?: boolean;
}

export default function ProfitRiskRatioCalculator({
  defaultEntryPrice = 2000,
  defaultStopLossPrice = 1900,
  defaultTargetPrice = 2150,
  defaultIsLong = true,
}: Props) {
  const [entryPrice, setEntryPrice] = useState(defaultEntryPrice);
  const [stopLossPrice, setStopLossPrice] = useState(defaultStopLossPrice);
  const [targetPrice, setTargetPrice] = useState(defaultTargetPrice);
  const [isLong, setIsLong] = useState(defaultIsLong);

  let b: number | null = null;
  if (entryPrice && stopLossPrice && targetPrice) {
    if (isLong) {
      const stopLossPct = entryPrice - stopLossPrice;
      const targetPct = targetPrice - entryPrice;
      b = stopLossPct > 0 ? targetPct / stopLossPct : null;
    } else {
      const stopLossPct = stopLossPrice - entryPrice;
      const targetPct = entryPrice - targetPrice;
      b = stopLossPct > 0 ? targetPct / stopLossPct : null;
    }
  }

  return (
    <div className="bg-white shadow rounded p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Risk/Reward Calculator</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Entry Price</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stop Loss</label>
          <input
            type="number"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(parseFloat(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target</label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Position Type</label>
          <select
            value={isLong ? "long" : "short"}
            onChange={(e) => setIsLong(e.target.value === "long")}
            className="w-full border p-2 rounded"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
      </div>

      {b !== null && (
        <p
          className={`mt-3 font-bold text-lg ${
            b >= 1.5 ? "text-green-600" : "text-red-600"
          }`}
        >
          Risk/Reward b = {b.toFixed(2)}
        </p>
      )}
    </div>
  );
}
