import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { generatePassword, hashPassword, copyToClipboard } from '@/lib/passwordUtils';
import type { UserRole, SystemUser } from '@/types';

interface EditSystemUserDialogProps {
  user: SystemUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSystemUserDialog({ user: systemUser, open, onOpenChange }: EditSystemUserDialogProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { updateSystemUser, getPersonnelByTenant, getOrganizationsByTenant } = useSettingsStore();
  const { toast } = useToast();

  const personnel = getPersonnelByTenant(currentUser!.tenantId!);
  const organizations = getOrganizationsByTenant(currentUser!.tenantId!);

  const [email, setEmail] = useState(systemUser.email);
  const [role, setRole] = useState<UserRole>(systemUser.role);
  const [status, setStatus] = useState(systemUser.status);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(systemUser.organizationAccess);
  const [allOrgsAccess, setAllOrgsAccess] = useState(
    systemUser.organizationAccess.length === organizations.length
  );
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    setEmail(systemUser.email);
    setRole(systemUser.role);
    setStatus(systemUser.status);
    setSelectedOrgs(systemUser.organizationAccess);
    setAllOrgsAccess(systemUser.organizationAccess.length === organizations.length);
    setNewPassword('');
    setChangePassword(false);
    setShowPassword(false);
  }, [systemUser, organizations.length]);

  const getPersonnelName = () => {
    if (!systemUser.personnelId) return '—';
    const person = personnel.find(p => p.id === systemUser.personnelId);
    return person?.fullName || '—';
  };

  const handleGeneratePassword = () => {
    const password = generatePassword(12);
    setNewPassword(password);
    setShowPassword(true);
    toast({
      title: 'Пароль сгенерирован',
      description: 'Не забудьте сохранить изменения'
    });
  };

  const handleCopyPassword = async () => {
    try {
      await copyToClipboard(newPassword);
      toast({
        title: 'Скопировано',
        description: 'Пароль скопирован в буфер обмена'
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать пароль',
        variant: 'destructive'
      });
    }
  };

  const handleOrgToggle = (orgId: string) => {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    );
  };

  const handleSubmit = () => {
    if (!email || !role) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    if (changePassword && !newPassword) {
      toast({
        title: 'Ошибка',
        description: 'Введите новый пароль или отмените его изменение',
        variant: 'destructive'
      });
      return;
    }

    const organizationAccess = allOrgsAccess 
      ? organizations.map(org => org.id)
      : selectedOrgs;

    const updates: Partial<SystemUser> = {
      email,
      role,
      status,
      organizationAccess
    };

    if (changePassword && newPassword) {
      updates.passwordHash = hashPassword(newPassword);
    }

    updateSystemUser(systemUser.id, updates);

    toast({
      title: 'Успешно',
      description: 'Данные пользователя обновлены'
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Персонал:</span>
              <span className="font-medium">{getPersonnelName()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Логин:</span>
              <code className="text-sm bg-background px-2 py-1 rounded">
                {systemUser.login}
              </code>
            </div>
            {systemUser.lastLogin && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Последний вход:</span>
                <span className="text-sm">
                  {new Date(systemUser.lastLogin).toLocaleString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="role">Роль *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TenantAdmin">Администратор</SelectItem>
                <SelectItem value="Manager">Менеджер</SelectItem>
                <SelectItem value="Auditor">Аудитор</SelectItem>
                <SelectItem value="Director">Директор</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Статус *</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="inactive">Неактивен</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="change-password"
                checked={changePassword}
                onCheckedChange={(checked) => {
                  setChangePassword(checked as boolean);
                  if (!checked) {
                    setNewPassword('');
                    setShowPassword(false);
                  }
                }}
              />
              <label htmlFor="change-password" className="text-sm font-medium">
                Изменить пароль
              </label>
            </div>

            {changePassword && (
              <div>
                <Label htmlFor="password">Новый пароль</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Введите или сгенерируйте пароль"
                    />
                    {newPassword && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                  >
                    <Icon name="Key" size={16} className="mr-2" />
                    Сгенерировать
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    disabled={!newPassword}
                  >
                    <Icon name="Copy" size={16} />
                  </Button>
                </div>
                {newPassword && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Icon name="AlertTriangle" size={14} />
                    Сохраните новый пароль в безопасном месте
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Доступ к организациям</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="all-orgs"
                  checked={allOrgsAccess}
                  onCheckedChange={(checked) => {
                    setAllOrgsAccess(checked as boolean);
                    if (checked) setSelectedOrgs([]);
                  }}
                />
                <label htmlFor="all-orgs" className="text-sm">
                  Доступ ко всем организациям
                </label>
              </div>
            </div>

            {!allOrgsAccess && (
              <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {organizations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Нет доступных организаций
                  </p>
                ) : (
                  organizations.map((org) => (
                    <div key={org.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`org-${org.id}`}
                        checked={selectedOrgs.includes(org.id)}
                        onCheckedChange={() => handleOrgToggle(org.id)}
                      />
                      <label
                        htmlFor={`org-${org.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {org.name}
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        {org.inn}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
