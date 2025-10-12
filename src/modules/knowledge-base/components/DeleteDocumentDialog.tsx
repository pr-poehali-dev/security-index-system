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
import type { KnowledgeDocument } from '@/types';

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KnowledgeDocument | null;
  onConfirm: () => void;
}

export default function DeleteDocumentDialog({
  open,
  onOpenChange,
  document,
  onConfirm
}: DeleteDocumentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить документ?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить документ "{document?.title}"?
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
