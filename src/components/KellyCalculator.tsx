import React, { useState, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(...registerables);

export default function KellyCalculator() {
  const [capital, setCapital] = useState(1000);
  const [rr, setRr] = useState(1.5);
  const [winRate, setWinRate] = useState(0.5);
  const [leverage, setLeverage] = useState(20);
  const [symbol, setSymbol] = useState("ETHUSDT");
  const [entryPrice, setEntryPrice] = useState(2000);
  const [swingPct, setSwingPct] = useState<number | null>(null);
  const [halfKelly, setHalfKelly] = useState(true);
  const [isLong, setIsLong] = useState(true); // true=多, false=空
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function fetchSwing() {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=50`
        );
        const data = await res.json();
        let maxSwing = 0;
        for (const k of data) {
          const high = parseFloat(k[2]);
          const low = parseFloat(k[3]);
          const swing = (high - low) / low;
          if (swing > maxSwing) maxSwing = swing;
        }
        setSwingPct(maxSwing);
      } catch (err) {
        console.error("Failed to fetch swing", err);
      }
    }
    fetchSwing();
  }, [symbol]);

  useEffect(() => {
    if (swingPct != null) {
      let f = (rr * winRate - (1 - winRate)) / rr;
      f = Math.max(0, f);
      if (halfKelly) f /= 2;

      const riskAmount = capital * f;
      const stopLossPct = swingPct;
      const positionNominal = riskAmount / stopLossPct;
      const positionMargin = positionNominal / leverage;

      // 根据多空方向计算止损和止盈价格
      let stopLossPrice, breakEvenPrice, targetPrice;
      breakEvenPrice = entryPrice;
      if (isLong) {
        stopLossPrice = entryPrice * (1 - stopLossPct);
        targetPrice = entryPrice * (1 + stopLossPct * rr);
      } else {
        stopLossPrice = entryPrice * (1 + stopLossPct);
        targetPrice = entryPrice * (1 - stopLossPct * rr);
      }

      setResult({
        fraction: f,
        riskAmount,
        stopLossPct,
        positionNominal,
        positionMargin,
        stopLossPrice,
        breakEvenPrice,
        targetPrice
      });
    }
  }, [capital, rr, winRate, swingPct, leverage, halfKelly, entryPrice, isLong]);

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Kelly Calculator</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Capital (USDT)</label>
          <input type="number" value={capital} onChange={(e) => setCapital(parseFloat(e.target.value))} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Risk/Reward (b)</label>
          <input type="number" step="0.1" value={rr} onChange={(e) => setRr(parseFloat(e.target.value))} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Win Rate (0-1)</label>
          <input type="number" step="0.01" value={winRate} onChange={(e) => setWinRate(parseFloat(e.target.value))} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Leverage</label>
          <input type="number" value={leverage} onChange={(e) => setLeverage(parseFloat(e.target.value))} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Symbol</label>
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Entry Price</label>
          <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(parseFloat(e.target.value))} className="w-full border p-2 rounded" />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input id="halfKelly" type="checkbox" checked={halfKelly} onChange={(e) => setHalfKelly(e.target.checked)} className="h-4 w-4" />
          <label htmlFor="halfKelly" className="text-sm text-gray-700">Half Kelly</label>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700">Position Type</label>
          <select value={isLong ? "long" : "short"} onChange={(e) => setIsLong(e.target.value === "long")} className="w-full border p-2 rounded">
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-4 space-y-1">
          <p>Kelly Fraction: {(result.fraction * 100).toFixed(2)}%</p>
          <p>Risk Amount: {result.riskAmount.toFixed(2)} USDT</p>
          <p>Stop Loss: {(result.stopLossPct * 100).toFixed(2)}%</p>
          <p>Nominal Position: {result.positionNominal.toFixed(2)} USDT</p>
          <p>Margin Used: {result.positionMargin.toFixed(2)} USDT</p>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <Line
            data={{
              labels: ["Stop Loss", "Break Even", "Target"],
              datasets: [
                {
                  label: "风险分布 (USDT)",
                  data: [-result.riskAmount, 0, result.riskAmount * rr],
                  borderColor: "rgb(75, 192, 192)",
                  backgroundColor: ["#f87171", "#60a5fa", "#34d399"],
                  pointBackgroundColor: ["#f87171", "#60a5fa", "#34d399"],
                  pointBorderColor: ["#f87171", "#60a5fa", "#34d399"],
                  pointRadius: 6,
                  fill: false,
                  tension: 0.3
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function (context:any) {
                      const labelMap = ["Stop Loss", "Break Even", "Target"];
                      const index = context.dataIndex;
                      let price = result.breakEvenPrice;
                      if (index === 0) price = result.stopLossPrice;
                      else if (index === 2) price = result.targetPrice;
                      return `${labelMap[index]}: ${context.raw.toFixed(2)} USDT / ETH: ${price.toFixed(2)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  title: { display: true, text: "USDT" },
                  beginAtZero: true
                },
                x: { title: { display: true, text: "Status" } }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
