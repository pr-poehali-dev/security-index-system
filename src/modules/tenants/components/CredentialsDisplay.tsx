import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CredentialsDisplayProps {
  email: string;
  password: string;
  title: string;
  description: string;
  showWarning?: boolean;
  onClose: () => void;
}

export default function CredentialsDisplay({
  email,
  password,
  title,
  description,
  showWarning = true,
  onClose
}: CredentialsDisplayProps) {
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-emerald-600">
          <Icon name="CheckCircle2" size={24} />
          {title}
        </DialogTitle>
        <DialogDescription>
          {description}
        </DialogDescription>
      </DialogHeader>
      <div className="mt-6 space-y-4">
        {showWarning && (
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
        )}

        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={email} readOnly className="font-mono" />
              <Button
                size="icon"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(email)}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">Пароль</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={password} readOnly className="font-mono" />
              <Button
                size="icon"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(password)}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Закрыть
        </Button>
      </div>
    </div>
  );
}
