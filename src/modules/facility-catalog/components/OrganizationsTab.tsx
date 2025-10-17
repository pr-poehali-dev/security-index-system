import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function OrganizationsTab() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { getOrganizationsByTenant } = useSettingsStore();
  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrganizations = organizations.filter((org) => {
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.inn.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Организации тенанта</CardTitle>
            <Button onClick={() => navigate('/settings')}>
              <Icon name="Settings" size={16} className="mr-2" />
              Управление организациями
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Организации управляются в разделе Настройки → Организации
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск по названию или ИНН..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-medium">Название</th>
                  <th className="p-3 text-left font-medium">ИНН</th>
                  <th className="p-3 text-left font-medium">КПП</th>
                  <th className="p-3 text-left font-medium">Адрес</th>
                  <th className="p-3 text-left font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Организации не найдены. Добавьте организации в разделе Настройки.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizations.map((org) => (
                    <tr key={org.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">{org.name}</td>
                      <td className="p-3">{org.inn}</td>
                      <td className="p-3">{org.kpp || '—'}</td>
                      <td className="p-3">{org.address || '—'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          org.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {org.status === 'active' ? 'Активна' : 'Неактивна'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
