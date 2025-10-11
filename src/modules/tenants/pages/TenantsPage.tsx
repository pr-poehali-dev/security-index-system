import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import Icon from '@/components/ui/icon';
import { ROUTES } from '@/lib/constants';
import { Navigate } from 'react-router-dom';
import TenantCard from '../components/TenantCard';
import CreateTenantDialog from '../components/CreateTenantDialog';
import EditTenantDialog from '../components/EditTenantDialog';
import CredentialsDialog from '../components/CredentialsDialog';
import type { ModuleType } from '@/types';

export default function TenantsPage() {
  const user = useAuthStore((state) => state.user);

  if (!user || user.role !== 'SuperAdmin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const { tenants, addTenant, updateTenant, saveCredentials, getCredentials, resetPassword } = useTenantStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    adminEmail: '',
    adminName: '',
    modules: ['catalog'] as ModuleType[],
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  });

  const handleModuleToggle = (moduleKey: ModuleType) => {
    if (moduleKey === 'catalog') return;
    
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(moduleKey)
        ? prev.modules.filter(m => m !== moduleKey)
        : [...prev.modules, moduleKey]
    }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      inn: '',
      adminEmail: '',
      adminName: '',
      modules: ['catalog'],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tenantId = addTenant({
      ...formData,
      status: 'active'
    });

    const password = generatePassword();
    saveCredentials(tenantId, formData.adminEmail, password);
    
    setGeneratedCredentials({
      email: formData.adminEmail,
      password: password
    });

    resetFormData();
  };

  const handleEditTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setSelectedTenant(tenantId);
      setFormData({
        name: tenant.name,
        inn: tenant.inn,
        adminEmail: tenant.adminEmail,
        adminName: tenant.adminName,
        modules: tenant.modules,
        expiresAt: tenant.expiresAt
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    
    updateTenant(selectedTenant, formData);
    setIsEditDialogOpen(false);
    setSelectedTenant(null);
    resetFormData();
  };

  const handleShowCredentials = (tenantId: string) => {
    setSelectedTenant(tenantId);
    setIsCredentialsDialogOpen(true);
  };

  const handleResetPassword = () => {
    if (!selectedTenant) return;
    const newPassword = resetPassword(selectedTenant);
    const credentials = getCredentials(selectedTenant);
    if (credentials) {
      setGeneratedCredentials({
        email: credentials.email,
        password: newPassword
      });
    }
  };

  const handleCloseCredentials = () => {
    setGeneratedCredentials(null);
    setIsCreateDialogOpen(false);
  };

  const handleCloseGeneratedCredentials = () => {
    setGeneratedCredentials(null);
    setIsCredentialsDialogOpen(false);
  };

  const selectedTenantData = selectedTenant ? tenants.find(t => t.id === selectedTenant) : null;
  const credentials = selectedTenant ? getCredentials(selectedTenant) : null;

  return (
    <div>
      <PageHeader
        title="Управление тенантами"
        description="Создание и администрирование организаций в системе"
        icon="Building2"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Создать тенант
              </Button>
            </DialogTrigger>
            <CreateTenantDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              formData={formData}
              generatedCredentials={generatedCredentials}
              onFormDataChange={setFormData}
              onModuleToggle={handleModuleToggle}
              onSubmit={handleSubmit}
              onCloseCredentials={handleCloseCredentials}
            />
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tenants.map((tenant) => (
          <TenantCard
            key={tenant.id}
            tenant={tenant}
            onEdit={handleEditTenant}
            onShowCredentials={handleShowCredentials}
          />
        ))}
      </div>

      <EditTenantDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onModuleToggle={handleModuleToggle}
        onSubmit={handleUpdateTenant}
      />

      <CredentialsDialog
        open={isCredentialsDialogOpen}
        onOpenChange={setIsCredentialsDialogOpen}
        selectedTenant={selectedTenantData || null}
        credentials={credentials}
        generatedCredentials={generatedCredentials}
        onResetPassword={handleResetPassword}
        onCloseGenerated={handleCloseGeneratedCredentials}
      />
    </div>
  );
}
