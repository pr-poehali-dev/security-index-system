import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useToast } from '@/hooks/use-toast';
import OrganizationDialog from './OrganizationDialog';
import OrganizationsTable from './OrganizationsTable';

export default function OrganizationsTab() {
  const user = useAuthStore((state) => state.user);
  const { getOrganizationsByTenant, deleteOrganization } = useFacilitiesStore();
  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);

  const filteredOrganizations = organizations.filter((org) => {
    const query = searchQuery.toLowerCase();
    return (
      org.fullName.toLowerCase().includes(query) ||
      org.shortName?.toLowerCase().includes(query) ||
      org.inn.includes(query)
    );
  });

  const handleAdd = () => {
    setEditingOrg(null);
    setShowDialog(true);
  };

  const handleEdit = (id: string) => {
    setEditingOrg(id);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить организацию?')) {
      deleteOrganization(id);
      toast({ title: 'Организация удалена' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Организации тенанта</CardTitle>
            <Button onClick={handleAdd}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить организацию
            </Button>
          </div>
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

          <OrganizationsTable
            organizations={filteredOrganizations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <OrganizationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        organizationId={editingOrg}
      />
    </div>
  );
}
