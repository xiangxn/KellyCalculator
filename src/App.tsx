import React, { useState } from "react";
import KellyCalculator from "./components/KellyCalculator";
import ProfitRiskRatioCalculator from "./components/ProfitRiskRatioCalculator";

export default function App() {
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gray-50">
      <div className="w-full max-w-lg">
        {/* 切换按钮 */}
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
          onClick={() => setShowProfitCalculator(!showProfitCalculator)}
        >
          {showProfitCalculator ? "Hide Risk/Reward" : "Show Risk/Reward"}
        </button>

        {/* 盈亏比计算器 */}
        {showProfitCalculator && <ProfitRiskRatioCalculator />}

        {/* 原 Kelly 计算器 */}
        <KellyCalculator />
      </div>
    </div>
  );
}
