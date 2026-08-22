import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs an async fetcher on mount (and whenever `deps` change), tracking
 * loading/error/data state consistently across pages.
 *
 * @param {() => Promise<any>} fetcher
 * @param {Array<any>} deps
 * @param {{ enabled?: boolean }} options
 */
export function useAsync(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    if (!enabled) return Promise.resolve();
    setLoading(true);
    setError(null);
    return fetcherRef
      .current()
      .then((result) => {
        setData(result);
        return result;
      })
      .catch((err) => {
        setError(err);
        throw err;
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { data, error, loading, refetch: run, setData };
}

/**
 * Wraps an async action (form submit, button click) with a `pending` flag
 * and normalized error handling, without auto-running on mount.
 */
export function useAction(action) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const actionRef = useRef(action);
  actionRef.current = action;

  const run = useCallback(async (...args) => {
    setPending(true);
    setError(null);
    try {
      return await actionRef.current(...args);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setPending(false);
    }
  }, []);

  return { run, pending, error, setError };
}
