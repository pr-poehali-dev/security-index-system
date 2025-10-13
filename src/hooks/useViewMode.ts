import { useState } from 'react';

type ViewMode = 'table' | 'cards';

export function useViewMode(storageKey: string, defaultMode: ViewMode = 'table') {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(storageKey);
    return (saved as ViewMode) || defaultMode;
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(storageKey, mode);
  };

  return { viewMode, setViewMode: handleViewModeChange };
}
