import { useState, useEffect } from "react";

/**
 * Debounces a value by the given delay (ms).
 * Returns the debounced value — the consumer can use it as a dependency
 * to trigger backend searches only after the user stops typing.
 *
 * Also returns `isPending` which is true while the user is still typing
 * (i.e. the raw value differs from the debounced value), useful for
 * showing a "searching…" indicator on the input.
 */
export function useDebounce<T>(value: T, delay: number): { debounced: T; isPending: boolean } {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Mark as pending immediately when value changes
    setIsPending(true);

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  // Not pending if value already matches (e.g. on mount)
  const actuallyPending = isPending && value !== debouncedValue;

  return { debounced: debouncedValue, isPending: actuallyPending };
}
