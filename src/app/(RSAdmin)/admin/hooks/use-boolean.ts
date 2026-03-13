'use client';

import { useCallback, useState } from 'react';

// ----------------------------------------------------------------------

export interface UseBooleanReturn {
  value: boolean;
  onTrue: () => void;
  onFalse: () => void;
  onToggle: () => void;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useBoolean(defaultValue?: boolean): UseBooleanReturn {
  const [value, setValue] = useState<boolean>(!!defaultValue);

  const onTrue = useCallback((): void => {
    setValue(true);
  }, []);

  const onFalse = useCallback((): void => {
    setValue(false);
  }, []);

  const onToggle = useCallback((): void => {
    setValue((prev) => !prev);
  }, []);

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setValue,
  };
}
