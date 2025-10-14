import { useState, useMemo } from 'react';
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
import { generateLogin, generatePassword, hashPassword, copyToClipboard } from '@/lib/passwordUtils';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import type { UserRole } from '@/types';

interface AddSystemUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSystemUserDialog({ open, onOpenChange }: AddSystemUserDialogProps) {
  const user = useAuthStore((state) => state.user);
  const addSystemUser = useSettingsStore((state) => state.addSystemUser);
  const allPersonnel = useSettingsStore((state) => state.personnel);
  const allOrganizations = useSettingsStore((state) => state.organizations);
  const people = useSettingsStore((state) => state.people);
  const positions = useSettingsStore((state) => state.positions);
  const { toast } = useToast();

  const personnel = useMemo(() => 
    allPersonnel.filter(p => p.tenantId === user!.tenantId!)
  , [allPersonnel, user]);
  
  const organizations = useMemo(() => 
    allOrganizations.filter(o => o.tenantId === user!.tenantId!)
  , [allOrganizations, user]);
  
  const personnelWithInfo = useMemo(() => 
    personnel.map(p => ({
      ...p,
      info: getPersonnelFullInfo(p, people, positions)
    })), 
    [personnel, people, positions]
  );

  const [personnelId, setPersonnelId] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Manager');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [allOrgsAccess, setAllOrgsAccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePersonnelChange = (value: string) => {
    setPersonnelId(value);
    const personnelRecord = personnelWithInfo.find(p => p.id === value);
    if (personnelRecord) {
      const person = people.find(p => p.id === personnelRecord.personId);
      if (person?.email) setEmail(person.email);
      const generatedLogin = generateLogin(personnelRecord.info.fullName);
      setLogin(generatedLogin);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(12);
    setPassword(newPassword);
    setShowPassword(true);
    toast({
      title: 'Пароль сгенерирован',
      description: 'Скопируйте пароль и сохраните его в безопасном месте'
    });
  };

  const handleCopyPassword = async () => {
    try {
      await copyToClipboard(password);
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

  const handleCopyLogin = async () => {
    try {
      await copyToClipboard(login);
      toast({
        title: 'Скопировано',
        description: 'Логин скопирован в буфер обмена'
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать логин',
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
    if (!personnelId || !email || !login || !password || !role) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const organizationAccess = allOrgsAccess 
      ? organizations.map(org => org.id)
      : selectedOrgs;

    addSystemUser({
      tenantId: user!.tenantId!,
      personnelId,
      email,
      login,
      passwordHash: hashPassword(password),
      role,
      status: 'active',
      organizationAccess
    });

    toast({
      title: 'Успешно',
      description: 'Пользователь добавлен в систему'
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setPersonnelId('');
    setEmail('');
    setLogin('');
    setPassword('');
    setRole('Manager');
    setSelectedOrgs([]);
    setAllOrgsAccess(false);
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить пользователя системы</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Сотрудник *</Label>
            <Select value={personnelId} onValueChange={handlePersonnelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {personnelWithInfo.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    Нет доступных сотрудников
                  </div>
                ) : (
                  personnelWithInfo.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.info.fullName} — {p.info.position}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Email и логин подставятся автоматически
            </p>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <Label htmlFor="login">Логин *</Label>
            <div className="flex gap-2">
              <Input
                id="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="ivanov_ii"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLogin}
                disabled={!login}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="password">Пароль *</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Сгенерируйте пароль"
                />
                {password && (
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
                disabled={!password}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
            {password && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Icon name="AlertTriangle" size={14} />
                Сохраните пароль! Он не будет показан повторно
              </p>
            )}
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

            {allOrgsAccess && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <Icon name="Info" size={16} className="inline mr-2" />
                Пользователь получит доступ ко всем организациям, включая новые
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit}>
              <Icon name="UserPlus" size={16} className="mr-2" />
              Добавить пользователя
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}