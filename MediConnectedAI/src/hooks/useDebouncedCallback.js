import {useRef, useCallback} from 'react';

export function useDebouncedCallback(fn, ms) {
  const t = useRef();
  return useCallback(
    (...args) => {
      clearTimeout(t.current);
      t.current = setTimeout(() => fn(...args), ms);
    },
    [fn, ms],
  );
}
