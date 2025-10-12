import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useEffect, lazy, Suspense, memo } from "react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import Sidebar from "@/components/layout/Sidebar";

const LoginPage = lazy(() => import("@/modules/auth").then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/modules/dashboard").then(m => ({ default: m.DashboardPage })));
const TenantsPage = lazy(() => import("@/modules/tenants").then(m => ({ default: m.TenantsPage })));
const SettingsPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.SettingsPage })));
const CatalogPage = lazy(() => import("@/modules/catalog").then(m => ({ default: m.CatalogPage })));
const IncidentsPage = lazy(() => import("@/modules/incidents").then(m => ({ default: m.IncidentsPage })));
const ChecklistsPage = lazy(() => import("@/modules/checklists").then(m => ({ default: m.ChecklistsPage })));
const AttestationPage = lazy(() => import("@/modules/attestation").then(m => ({ default: m.AttestationPage })));
const TasksPage = lazy(() => import("@/modules/tasks").then(m => ({ default: m.TasksPage })));
const ExaminationPage = lazy(() => import("@/modules/examination").then(m => ({ default: m.ExaminationPage })));
const NotificationsPage = lazy(() => import("@/modules/notifications").then(m => ({ default: m.NotificationsPage })));
const MaintenancePage = lazy(() => import("@/modules/maintenance").then(m => ({ default: m.MaintenancePage })));
const BudgetPage = lazy(() => import("@/modules/budget").then(m => ({ default: m.BudgetPage })));
const TrainingCenterPage = lazy(() => import("@/modules/training-center/pages/TrainingCenterPage"));
const NotFoundPage = lazy(() => import("@/modules/common").then(m => ({ default: m.NotFoundPage })));
import { useIncidentNotifications } from "@/hooks/useIncidentNotifications";
import { useAttestationNotifications } from "@/hooks/useAttestationNotifications";
import { useCatalogNotifications } from "@/hooks/useCatalogNotifications";

const queryClient = new QueryClient();

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

const ProtectedRoute = memo(function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return <>{children}</>;
});

const AuthenticatedLayout = memo(function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  useIncidentNotifications();
  useAttestationNotifications();
  useCatalogNotifications();
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300 overflow-x-hidden",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-8 max-w-[calc(100vw-4rem)] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
});

const App = memo(function App() {
  const theme = useUIStore((state) => state.theme);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <DashboardPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.TENANTS}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <TenantsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <SettingsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CATALOG}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <CatalogPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.INCIDENTS}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <IncidentsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CHECKLISTS}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ChecklistsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ATTESTATION}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <AttestationPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.TASKS}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <TasksPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EXAMINATION}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ExaminationPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MAINTENANCE}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <MaintenancePage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.BUDGET}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <BudgetPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.TRAINING_CENTER}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <TrainingCenterPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.NOTIFICATIONS}
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <NotificationsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to={ROUTES.DASHBOARD} replace />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
});

export default App;