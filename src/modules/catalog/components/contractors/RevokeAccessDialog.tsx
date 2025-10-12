import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RevokeAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revokeReason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RevokeAccessDialog({
  open,
  onOpenChange,
  revokeReason,
  onReasonChange,
  onConfirm,
  onCancel,
}: RevokeAccessDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отозвать доступ к объекту</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите отозвать доступ? Сотрудник больше не сможет посещать
            этот объект.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="revokeReason">Причина отзыва</Label>
          <Input
            id="revokeReason"
            placeholder="Укажите причину..."
            value={revokeReason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600">
            Отозвать доступ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
