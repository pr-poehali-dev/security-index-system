import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import ModulesSelector from './ModulesSelector';
import CredentialsDisplay from './CredentialsDisplay';
import type { ModuleType } from '@/types';

interface CreateTenantDialogProps {
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
  generatedCredentials: { email: string; password: string } | null;
  onFormDataChange: (data: any) => void;
  onModuleToggle: (moduleKey: ModuleType) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCloseCredentials: () => void;
}

export default function CreateTenantDialog({
  open,
  onOpenChange,
  formData,
  generatedCredentials,
  onFormDataChange,
  onModuleToggle,
  onSubmit,
  onCloseCredentials
}: CreateTenantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {generatedCredentials ? (
          <CredentialsDisplay
            email={generatedCredentials.email}
            password={generatedCredentials.password}
            title="Тенант успешно создан"
            description="Сохраните учетные данные администратора. Они отображаются только один раз!"
            showWarning={true}
            onClose={onCloseCredentials}
          />
        ) : (
          <form onSubmit={onSubmit}>
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
                    onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input
                    id="inn"
                    value={formData.inn}
                    onChange={(e) => onFormDataChange({ ...formData, inn: e.target.value })}
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
                    onChange={(e) => onFormDataChange({ ...formData, adminName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email администратора *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => onFormDataChange({ ...formData, adminEmail: e.target.value })}
                    required
                  />
                </div>
              </div>

              <ModulesSelector
                selectedModules={formData.modules}
                onToggle={onModuleToggle}
              />

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <Icon name="Plus" className="mr-2" size={18} />
                  Создать тенант
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
