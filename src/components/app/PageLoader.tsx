import { memo } from 'react';

const PageLoader = memo(function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    </div>
  );
});

export default PageLoader;
