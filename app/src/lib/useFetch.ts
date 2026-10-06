import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';

type State<T> = { key: string | null; data: T | null; error: string | null };

const message = (e: unknown) => (e instanceof Error ? e.message : 'Algo deu errado');

/**
 * Busca dados e recarrega silenciosamente sempre que a tela volta a ficar em foco,
 * assim progresso/salvos ficam atualizados entre as abas.
 */
export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });
  const [refreshing, setRefreshing] = useState(false);
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  const focusedOnce = useRef(false);

  useEffect(() => {
    fnRef.current = fn;
  });

  const load = useCallback(
    () =>
      fnRef.current().then(
        (data) => setState({ key, data, error: null }),
        (e) => setState((s) => ({ key, data: s.data, error: message(e) })),
      ),
    [key],
  );

  useEffect(() => {
    load();
  }, [load, nonce]);

  useFocusEffect(
    useCallback(() => {
      if (!focusedOnce.current) {
        focusedOnce.current = true;
        return;
      }
      load();
    }, [load]),
  );

  const setData = useCallback((update: SetStateAction<T | null>) => {
    setState((s) => ({
      ...s,
      data: typeof update === 'function' ? (update as (prev: T | null) => T | null)(s.data) : update,
    }));
  }, []);

  return {
    data: state.data,
    setData,
    error: state.error,
    loading: state.key !== key,
    refreshing,
    reload: () => {
      setState((s) => ({ ...s, key: null }));
      setNonce((n) => n + 1);
    },
    refresh: async () => {
      setRefreshing(true);
      await load();
      setRefreshing(false);
    },
  };
}
