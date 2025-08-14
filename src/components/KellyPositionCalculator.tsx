// src/components/KellyPositionCalculator.tsx
import React, { useMemo, useState } from "react";

function fmt(n: number, d = 2) {
    if (!Number.isFinite(n)) return "-";
    return n.toFixed(d);
}

export default function KellyPositionCalculator() {
    const [capital, setCapital] = useState<number>(1000);
    const [entryPrice, setEntryPrice] = useState<number>(4770);
    const [stopPrice, setStopPrice] = useState<number>(4820);
    const [targetPrice, setTargetPrice] = useState<number>(4650);
    const [winRate, setWinRate] = useState<number>(0.5);
    const [leverage, setLeverage] = useState<number>(75);
    const [useHalfKelly, setUseHalfKelly] = useState<boolean>(false);

    // 自动判断多空方向
    const direction = useMemo<"long" | "short" | null>(() => {
        if (stopPrice < entryPrice && targetPrice > entryPrice) return "long";
        if (stopPrice > entryPrice && targetPrice < entryPrice) return "short";
        return null;
    }, [entryPrice, stopPrice, targetPrice]);

    const directionError = useMemo(() => {
        if (direction === null) {
            return "价格组合不符合多/空逻辑，请检查止损和止盈相对于入场价的位置。";
        }
        return "";
    }, [direction]);

    // 核心计算
    const deriv = useMemo(() => {
        const stopDiff = Math.abs(stopPrice - entryPrice);
        const targetDiff = Math.abs(entryPrice - targetPrice);

        const stopLossPct = entryPrice > 0 ? stopDiff / entryPrice : NaN;
        const b = stopDiff > 0 ? targetDiff / stopDiff : NaN; // 盈亏比

        let f = Number.NaN;
        if (Number.isFinite(b) && b > 0) {
            const p = Math.max(0, Math.min(1, winRate));
            const q = 1 - p;
            f = (b * p - q) / b;
            if (useHalfKelly) f = f / 2;
            f = Math.max(0, f);
        } else {
            f = 0;
        }

        const riskAmount = capital * f;
        const nominalPosition = stopLossPct > 0 ? riskAmount / stopLossPct : 0;
        const qty = entryPrice > 0 ? nominalPosition / entryPrice : 0;
        const margin = leverage > 0 ? nominalPosition / leverage : NaN;

        const lossAmount = qty * stopDiff;
        const profitAmount = qty * targetDiff;

        return {
            b,
            f,
            riskAmount,
            stopLossPct,
            nominalPosition,
            qty,
            margin,
            lossAmount,
            profitAmount,
            stopDiff,
            targetDiff,
        };
    }, [capital, entryPrice, stopPrice, targetPrice, winRate, leverage, useHalfKelly]);

    return (
        <div className="bg-white p-6 rounded-xl shadow max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Kelly Position Calculator</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium">本金 (USDT)</label>
                    <input
                        type="number"
                        value={capital}
                        onChange={(e) => setCapital(parseFloat(e.target.value || "0"))}
                        className="mt-1 w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">杠杆倍数</label>
                    <input
                        type="number"
                        value={leverage}
                        onChange={(e) => setLeverage(parseInt(e.target.value || "1", 10))}
                        className="mt-1 w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">入场价</label>
                    <input
                        type="number"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(parseFloat(e.target.value || "0"))}
                        className="mt-1 w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">止损价</label>
                    <input
                        type="number"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(parseFloat(e.target.value || "0"))}
                        className="mt-1 w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">止盈价</label>
                    <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(parseFloat(e.target.value || "0"))}
                        className="mt-1 w-full border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">胜率 p (0-1)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={winRate}
                        onChange={(e) => setWinRate(parseFloat(e.target.value || "0"))}
                        className="mt-1 w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">半凯利 (更保守)</label>
                    <div className="mt-1">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={useHalfKelly}
                                onChange={(e) => setUseHalfKelly(e.target.checked)}
                                className="mr-2"
                            />
                            使用半凯利
                        </label>
                    </div>
                </div>


            </div>

            {/* direction validation */}
            {directionError ? (
                <div className="mt-3 text-red-600 font-medium">{directionError}</div>
            ) : (
                <div className="mt-3 text-gray-600 text-sm">
                    自动识别方向：<span className="font-semibold">{direction === "long" ? "做多" : "做空"}</span>
                </div>
            )}

            {/* results */}
            <div className="mt-4 bg-gray-50 p-4 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <div className="text-sm text-gray-500">盈亏比 (b)</div>
                        <div
                            className={`font-semibold text-lg ${deriv.b >= 1.5 ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {Number.isFinite(deriv.b) ? fmt(deriv.b, 2) : "-"}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">凯利比例 f</div>
                        <div className="font-semibold text-lg">{fmt(deriv.f * 100, 2)}%</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">风险金额 (USDT)</div>
                        <div className="font-semibold">{fmt(deriv.riskAmount, 2)} USDT</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">止损百分比</div>
                        <div className="font-semibold">{fmt(deriv.stopLossPct * 100, 3)}%</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">名义仓位 (USDT)</div>
                        <div className="font-semibold">{fmt(deriv.nominalPosition, 2)} USDT</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">保证金 (USDT)</div>
                        <div className="font-semibold">{fmt(deriv.margin, 2)} USDT</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">开仓张数</div>
                        <div className="font-semibold">{fmt(deriv.qty, 4)} 张</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">价格差 StopDiff / TargetDiff</div>
                        <div className="font-semibold">{fmt(deriv.stopDiff, 2)} / {fmt(deriv.targetDiff, 2)} USDT</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">止损亏损金额 (USDT)</div>
                        <div className="text-red-600 font-semibold">{fmt(deriv.lossAmount, 2)} USDT</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">止盈盈利金额 (USDT)</div>
                        <div className="text-green-600 font-semibold">{fmt(deriv.profitAmount, 2)} USDT</div>
                    </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    说明：<br/>
                    1. 止损亏损金额 = ETH 数量 x 价格差；若结果看起来不合理，请检查止损/止盈相对于入场价的方向（多/空）。<br/>
                    2. 当盈亏比高于2.0时建议使用半凯利系数(half Kelly),它将凯利系数减半。此为保守策略，用于限制风险。<br/>
                </div>
            </div>
        </div>
    );
}
