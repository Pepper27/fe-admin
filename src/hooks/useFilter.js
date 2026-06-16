import { useCallback, useEffect, useMemo, useState } from 'react';

// Minimal useFilter hook
export default function useFilter({ defaultValues = {}, onApply = () => {}, debounce = 300, normalize } = {}) {
  const [values, setValues] = useState(defaultValues);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setValues(defaultValues);
  }, [JSON.stringify(defaultValues)]);

  // apply debounced
  useEffect(() => {
    const t = setTimeout(() => {
      // when trigger increments, call onApply with normalized values
      if (trigger > 0) {
        const payload = typeof normalize === 'function' ? normalize(values) : values;
        onApply(payload);
      }
    }, debounce);
    return () => clearTimeout(t);
  }, [trigger]);

  const set = useCallback((next) => {
    setValues((prev) => {
      const merged = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      return merged;
    });
  }, []);

  const handleChange = useCallback((next) => {
    set(next);
    // reset page is the responsibility of page; we just signal change
    setTrigger((v) => v + 1);
  }, [set]);

  const reset = useCallback(() => {
    setValues(defaultValues || {});
    onApply(typeof normalize === 'function' ? normalize(defaultValues || {}) : (defaultValues || {}));
  }, [JSON.stringify(defaultValues)]);

  return {
    values,
    setValue: (name, value) => set((prev) => ({ ...prev, [name]: value })),
    setValues: set,
    handleChange,
    reset,
  };
}
