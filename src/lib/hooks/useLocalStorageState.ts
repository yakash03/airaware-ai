// AirAware AI V2 — SSR-Safe LocalStorage Hook using React 19 useSyncExternalStore
// Avoids synchronous setState inside useEffect and caches snapshot references for stability.

'use client';

import { useCallback, useSyncExternalStore } from 'react';

const LOCAL_CHANGE_EVENT = 'airaware-local-storage-change';

interface CachedSnapshot<T> {
  raw: string | null;
  value: T;
}

/**
 * Subscribe to browser localStorage changes across both current-tab updates
 * and cross-tab storage events, parsing and validating JSON safely.
 */
export function useLocalStorageState<T>(
  storageKey: string,
  defaultValue: T,
  validate: (parsed: unknown) => T | null
): [T, (nextValue: T) => void] {
  const snapshotCache = getCacheMap().get(storageKey) as CachedSnapshot<T> | undefined;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const handleCustom = (e: Event) => {
        const detail = (e as CustomEvent<{ key: string }>).detail;
        if (!detail || detail.key === storageKey) {
          onStoreChange();
        }
      };
      const handleStorage = (e: StorageEvent) => {
        if (e.key === null || e.key === storageKey) {
          onStoreChange();
        }
      };
      window.addEventListener(LOCAL_CHANGE_EVENT, handleCustom);
      window.addEventListener('storage', handleStorage);
      return () => {
        window.removeEventListener(LOCAL_CHANGE_EVENT, handleCustom);
        window.removeEventListener('storage', handleStorage);
      };
    },
    [storageKey]
  );

  const getSnapshot = useCallback((): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = window.localStorage.getItem(storageKey);
      const cached = getCacheMap().get(storageKey) as CachedSnapshot<T> | undefined;
      if (cached && cached.raw === raw) {
        return cached.value;
      }

      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        const validated = validate(parsed);
        if (validated !== null) {
          getCacheMap().set(storageKey, { raw, value: validated });
          return validated;
        }
      }
      getCacheMap().set(storageKey, { raw, value: defaultValue });
      return defaultValue;
    } catch {
      return snapshotCache?.value ?? defaultValue;
    }
  }, [storageKey, defaultValue, validate, snapshotCache]);

  const getServerSnapshot = useCallback((): T => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (nextValue: T) => {
      if (typeof window === 'undefined') return;
      try {
        const serialized = JSON.stringify(nextValue);
        window.localStorage.setItem(storageKey, serialized);
        getCacheMap().set(storageKey, { raw: serialized, value: nextValue });
        window.dispatchEvent(
          new CustomEvent(LOCAL_CHANGE_EVENT, { detail: { key: storageKey } })
        );
      } catch {
        // Ignore storage quota or private browsing errors
      }
    },
    [storageKey]
  );

  return [value, setValue];
}

const cacheRegistry = new Map<string, CachedSnapshot<unknown>>();
function getCacheMap(): Map<string, CachedSnapshot<unknown>> {
  return cacheRegistry;
}
