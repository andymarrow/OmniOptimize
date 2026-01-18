"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Sync a value with URL query param (priority) then localStorage fallback.
 * Returns [value, setValue, ready].
 */
export function useUrlOrLocalStorageState(paramKey, storageKey, defaultValue) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [ready, setReady] = useState(false);

  // Read initial value: URL > localStorage > default
  useEffect(() => {
    let initial = defaultValue;
    const urlVal = searchParams?.get(paramKey);
    if (urlVal !== null && urlVal !== undefined) {
      initial = urlVal;
    } else if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored !== null) {
          initial = JSON.parse(stored);
        }
      } catch (e) {
        console.warn(`Failed to read localStorage for ${storageKey}`, e);
      }
    }
    setValue(initial);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, storageKey, searchParams]);

  const updateUrl = useCallback(
    (nextVal) => {
      if (!router || !searchParams) return;
      const params = new URLSearchParams(searchParams.toString());
      if (nextVal === null || nextVal === undefined || nextVal === "") {
        params.delete(paramKey);
      } else {
        params.set(paramKey, nextVal);
      }
      router.replace(`?${params.toString()}`);
    },
    [paramKey, router, searchParams],
  );

  const setSyncedValue = useCallback(
    (next) => {
      const nextVal = typeof next === "function" ? next(value) : next;
      setValue(nextVal);

      // persist to localStorage
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(nextVal));
        } catch (e) {
          console.warn(`Failed to write localStorage for ${storageKey}`, e);
        }
      }

      // sync to URL
      updateUrl(nextVal);
    },
    [storageKey, updateUrl, value],
  );

  return [value, setSyncedValue, ready];
}
