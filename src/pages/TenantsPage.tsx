import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import PageHeader from '@/components/layout/PageHeader';
import Icon from '@/components/ui/icon';
import { MODULES, ROUTES } from '@/lib/constants';
import { Navigate } from 'react-router-dom';
import type { ModuleType } from '@/types';

export default function TenantsPage() {
  const user = useAuthStore((state) => state.user);

  if (!user || user.role !== 'SuperAdmin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  const { tenants, addTenant } = useTenantStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tenantId = addTenant({
      ...formData,
      status: 'active'
    });

    const password = generatePassword();
    setGeneratedCredentials({
      email: formData.adminEmail,
      password: password
    });

    setFormData({
      name: '',
      inn: '',
      adminEmail: '',
      adminName: '',
      modules: ['catalog'],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const handleCloseCredentials = () => {
    setGeneratedCredentials(null);
    setIsCreateDialogOpen(false);
  };

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {generatedCredentials ? (
                <div>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-600">
                      <Icon name="CheckCircle2" size={24} />
                      Тенант успешно создан
                    </DialogTitle>
                    <DialogDescription>
                      Сохраните учетные данные администратора. Они отображаются только один раз!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Icon name="AlertTriangle" className="text-amber-600 mt-0.5" size={18} />
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                          Внимание! Скопируйте данные сейчас
                        </p>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        После закрытия окна пароль будет недоступен
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Email</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input value={generatedCredentials.email} readOnly className="font-mono" />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(generatedCredentials.email)}
                          >
                            <Icon name="Copy" size={16} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Пароль</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input value={generatedCredentials.password} readOnly className="font-mono" />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(generatedCredentials.password)}
                          >
                            <Icon name="Copy" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCloseCredentials} className="w-full">
                      Закрыть
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Создание нового тенанта</DialogTitle>
                    <DialogDescription>
                      Заполните данные организации и администратора
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Наименование организации *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inn">ИНН *</Label>
                        <Input
                          id="inn"
                          value={formData.inn}
                          onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                          pattern="[0-9]{10,12}"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminName">ФИО администратора *</Label>
                        <Input
                          id="adminName"
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email администратора *</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Доступные модули</Label>
                      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {(Object.keys(MODULES) as ModuleType[]).map((moduleKey) => {
                          const module = MODULES[moduleKey];
                          const isDisabled = moduleKey === 'catalog';
                          
                          return (
                            <div key={moduleKey} className="flex items-start gap-2">
                              <Checkbox
                                id={moduleKey}
                                checked={formData.modules.includes(moduleKey)}
                                onCheckedChange={() => handleModuleToggle(moduleKey)}
                                disabled={isDisabled}
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={moduleKey}
                                  className={`text-sm font-medium cursor-pointer ${isDisabled ? 'text-gray-500' : ''}`}
                                >
                                  {module.name}
                                  {isDisabled && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Обязательно
                                    </Badge>
                                  )}
                                </Label>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{module.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1">
                        <Icon name="Plus" className="mr-2" size={18} />
                        Создать тенант
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tenants.map((tenant) => {
          const daysUntilExpiry = Math.floor((new Date(tenant.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isExpiring = daysUntilExpiry <= 30;

          return (
            <Card key={tenant.id} className="hover-scale">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                      <Icon name="Building2" className="text-emerald-600" size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ИНН: {tenant.inn}</p>
                    </div>
                  </div>
                  <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                    {tenant.status === 'active' ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Администратор</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.adminName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{tenant.adminEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Срок действия</p>
                    <p className={`text-sm font-medium ${isExpiring ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                      {new Date(tenant.expiresAt).toLocaleDateString('ru-RU')}
                    </p>
                    <p className={`text-xs ${isExpiring ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>
                      Осталось {daysUntilExpiry} дней
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Доступные модули ({tenant.modules.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {tenant.modules.map((moduleKey) => (
                      <Badge key={moduleKey} variant="outline" className="text-xs">
                        {MODULES[moduleKey].name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Icon name="Settings" className="mr-2" size={14} />
                    Настроить
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Icon name="Key" className="mr-2" size={14} />
                    Учетные данные
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}