import { useEffect, useState } from 'react';

/**
 * Retourne la valeur passée après un délai de debounce.
 * @param value La valeur à "ralentir"
 * @param delay Durée en ms
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}