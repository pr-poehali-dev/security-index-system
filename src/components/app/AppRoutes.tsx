import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import ProtectedRoute from './ProtectedRoute';
import AuthenticatedLayout from './AuthenticatedLayout';
import {
  LoginPage,
  DashboardPage,
  TenantsPage,
  SettingsPage,
  CatalogPage,
  ContractorsPage,
  IncidentsPage,
  ChecklistsPage,
  AttestationPage,
  TasksPage,
  ExaminationPage,
  NotificationsPage,
  CreateNotificationPage,
  NotificationsHistoryPage,
  MaintenancePage,
  BudgetPage,
  TrainingCenterPage,
  KnowledgeBasePage,
  AuditPage,
  NotFoundPage
} from '@/config/routes';

export default function AppRoutes() {
  return (
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
        path={ROUTES.CONTRACTORS}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ContractorsPage />
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
        path={ROUTES.KNOWLEDGE_BASE}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <KnowledgeBasePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.AUDIT}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AuditPage />
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
      
      <Route
        path={ROUTES.CREATE_NOTIFICATION}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CreateNotificationPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.NOTIFICATIONS_HISTORY}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <NotificationsHistoryPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to={ROUTES.DASHBOARD} replace />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}