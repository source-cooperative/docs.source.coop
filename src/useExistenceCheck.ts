import {useEffect, useState} from 'react';
import {existenceCheckUrl} from './policies';

export type ExistenceCheck = 'unchecked' | 'checking' | 'found' | 'missing';

/**
 * Debounced check that an `account` or `account/product` prefix exists on
 * Source Cooperative. Advisory only — callers must still generate policies
 * when the result is `missing`.
 */
export function useExistenceCheck(prefix: string, delayMs = 500): ExistenceCheck {
  const [state, setState] = useState<ExistenceCheck>('unchecked');

  useEffect(() => {
    const url = existenceCheckUrl(prefix);
    if (!url) {
      setState('unchecked');
      return;
    }
    setState('checking');
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(url, {signal: controller.signal});
        // Only 404 means "no such thing". A private product answers 401, which
        // still tells us it exists.
        if (!cancelled) setState(res.status === 404 ? 'missing' : 'found');
      } catch {
        // Offline, blocked by CORS, or superseded: stay quiet rather than cry wolf.
        if (!cancelled) setState('unchecked');
      }
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [prefix, delayMs]);

  return state;
}
