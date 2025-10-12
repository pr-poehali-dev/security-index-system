import { useState, useMemo } from 'react';
import { useTenantStore } from '@/stores/tenantStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import TenantCard from '../TenantCard';
import TenantsTable from '../TenantsTable';
import CreateTenantDialog from '../CreateTenantDialog';
import EditTenantDialog from '../EditTenantDialog';
import CredentialsDialog from '../CredentialsDialog';
import type { ModuleType } from '@/types';

type ViewMode = 'cards' | 'table';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function GeneralTab() {
  const { tenants, addTenant, updateTenant, saveCredentials, getCredentials, resetPassword } = useTenantStore();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
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

  const handleToggleStatus = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      updateTenant(tenantId, {
        ...tenant,
        status: tenant.status === 'active' ? 'inactive' : 'active'
      });
    }
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant => {
      const matchesSearch = searchQuery === '' || 
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.inn.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tenants, searchQuery, statusFilter]);

  const selectedTenantData = selectedTenant ? tenants.find(t => t.id === selectedTenant) : null;
  const credentials = selectedTenant ? getCredentials(selectedTenant) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Поиск по названию или ИНН..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-none gap-2"
              title="Карточки"
            >
              <Icon name="Grid3x3" size={18} />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none gap-2"
              title="Таблица"
            >
              <Icon name="List" size={18} />
            </Button>
          </div>
        </div>
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
      </div>

      {filteredTenants.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <Icon name="Search" className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Тенанты не найдены</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onEdit={handleEditTenant}
              onShowCredentials={handleShowCredentials}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <TenantsTable
          tenants={filteredTenants}
          onEdit={handleEditTenant}
          onShowCredentials={handleShowCredentials}
          onToggleStatus={handleToggleStatus}
        />
      )}

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