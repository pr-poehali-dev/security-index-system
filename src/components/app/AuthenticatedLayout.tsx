import { memo } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/layout/Sidebar';
import { useNotificationHooks } from '@/hooks/useNotificationHooks';

const AuthenticatedLayout = memo(function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  useNotificationHooks();
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      <main className={cn(
        "flex-1 transition-all duration-300 overflow-x-hidden",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AuthenticatedLayout;
