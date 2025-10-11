import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import CredentialsDisplay from './CredentialsDisplay';
import type { Tenant } from '@/types';

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTenant: Tenant | null;
  credentials: { email: string; password: string; createdAt: string } | null;
  generatedCredentials: { email: string; password: string } | null;
  onResetPassword: () => void;
  onCloseGenerated: () => void;
}

export default function CredentialsDialog({
  open,
  onOpenChange,
  selectedTenant,
  credentials,
  generatedCredentials,
  onResetPassword,
  onCloseGenerated
}: CredentialsDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (generatedCredentials) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <CredentialsDisplay
            email={generatedCredentials.email}
            password={generatedCredentials.password}
            title="Пароль успешно сброшен"
            description="Новый пароль администратора. Сохраните его в безопасном месте!"
            showWarning={true}
            onClose={onCloseGenerated}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Key" size={20} />
              Учетные данные
            </DialogTitle>
            <DialogDescription>
              Данные для входа администратора тенанта
            </DialogDescription>
          </DialogHeader>
          
          {selectedTenant && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Icon name="Info" className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      {selectedTenant.name}
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      ИНН: {selectedTenant.inn}
                    </p>
                  </div>
                </div>
              </div>

              {credentials ? (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Email (логин)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={credentials.email} readOnly className="font-mono" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(credentials.email)}
                      >
                        <Icon name="Copy" size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Пароль</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password} 
                        readOnly 
                        className="font-mono" 
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(credentials.password)}
                      >
                        <Icon name="Copy" size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Создано: {new Date(credentials.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Учетные данные не найдены
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="destructive" 
                  onClick={onResetPassword}
                  className="flex-1"
                >
                  <Icon name="RotateCcw" className="mr-2" size={16} />
                  Сбросить пароль
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
