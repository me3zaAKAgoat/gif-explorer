import { useEffect, useState } from 'react';

export const useDebounce = (value: string | number, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState<any>(value);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [value, delay]);

	return debouncedValue;
};