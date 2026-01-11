'use client';

import { useEffect } from 'react';
import { useQuizStore } from '@/lib/store';

export const StoreInitializer = () => {
  const initializeStore = useQuizStore((state) => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return null;
};
