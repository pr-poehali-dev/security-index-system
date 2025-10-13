import { memo, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useThemeInitialization } from '@/hooks/useThemeInitialization';
import AppProviders from '@/components/app/AppProviders';
import AppRoutes from '@/components/app/AppRoutes';
import PageLoader from '@/components/app/PageLoader';

const App = memo(function App() {
  useThemeInitialization();
  
  return (
    <AppProviders>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
});

export default App;
