import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useThemeInitialization() {
  const theme = useUIStore((state) => state.theme);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
}
