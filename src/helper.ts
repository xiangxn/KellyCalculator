import { useState, useCallback } from "react";
export function useSafeState<T>(initialValue: T) {
    const [state, setState] = useState<T>(initialValue);

    const safeSetState = useCallback((value: T) => {
        // 过滤 NaN（仅当类型是 number 时才检查）
        if (typeof value === "number" && Number.isNaN(value)) {
            return;
        }
        setState(value);
    }, []);

    return [state, safeSetState] as const;
}