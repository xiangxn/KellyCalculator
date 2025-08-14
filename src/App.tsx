import React, { useState } from "react";
import KellyCalculator from "./components/KellyCalculator";
import ProfitRiskRatioCalculator from "./components/ProfitRiskRatioCalculator";
import KellyPositionCalculator from "./components/KellyPositionCalculator";

export default function App() {
  const [activeTab, setActiveTab] = useState<"kelly" | "position">("kelly");
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gray-50">
      <div className="w-full max-w-lg">
        {/* Tab 标签 */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "kelly"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("kelly")}
          >
            凯利计算器
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "position"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("position")}
          >
            仓位计算器
          </button>
        </div>

        {/* 根据 Tab 显示不同内容 */}
        {activeTab === "kelly" ? (
          <>
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
          </>
        ) : (
          <KellyPositionCalculator />
        )}
      </div>
    </div>
  );
}
