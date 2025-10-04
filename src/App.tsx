import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TenantsPage from "@/pages/TenantsPage";
import CatalogPage from "@/pages/CatalogPage";
import IncidentsPage from "@/pages/IncidentsPage";
import ChecklistsPage from "@/pages/ChecklistsPage";
import AttestationPage from "@/pages/AttestationPage";
import TasksPage from "@/pages/TasksPage";
import ExaminationPage from "@/pages/ExaminationPage";
import MaintenancePage from "@/pages/MaintenancePage";
import BudgetPage from "@/pages/BudgetPage";
import Sidebar from "@/components/layout/Sidebar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return <>{children}</>;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

const App = () => {
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
            <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;