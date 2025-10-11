import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import ModulesSelector from './ModulesSelector';
import type { ModuleType } from '@/types';

interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    inn: string;
    adminEmail: string;
    adminName: string;
    modules: ModuleType[];
    expiresAt: string;
  };
  onFormDataChange: (data: any) => void;
  onModuleToggle: (moduleKey: ModuleType) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditTenantDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onModuleToggle,
  onSubmit
}: EditTenantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Редактирование тенанта</DialogTitle>
            <DialogDescription>
              Измените данные организации и администратора
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Наименование организации *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-inn">ИНН *</Label>
                <Input
                  id="edit-inn"
                  value={formData.inn}
                  onChange={(e) => onFormDataChange({ ...formData, inn: e.target.value })}
                  pattern="[0-9]{10,12}"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-adminName">ФИО администратора *</Label>
                <Input
                  id="edit-adminName"
                  value={formData.adminName}
                  onChange={(e) => onFormDataChange({ ...formData, adminName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-adminEmail">Email администратора *</Label>
                <Input
                  id="edit-adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => onFormDataChange({ ...formData, adminEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expiresAt">Срок действия</Label>
              <Input
                id="edit-expiresAt"
                type="date"
                value={formData.expiresAt.split('T')[0]}
                onChange={(e) => onFormDataChange({ ...formData, expiresAt: new Date(e.target.value).toISOString() })}
                required
              />
            </div>

            <ModulesSelector
              selectedModules={formData.modules}
              onToggle={onModuleToggle}
              idPrefix="edit-"
            />

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Icon name="Save" className="mr-2" size={18} />
                Сохранить изменения
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
