import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import type { KnowledgeDocument, DocumentVersion } from '@/types';

interface DocumentVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KnowledgeDocument | null;
}

export default function DocumentVersionsDialog({
  open,
  onOpenChange,
  document,
}: DocumentVersionsDialogProps) {
  const { getDocumentVersions, restoreVersion } = useKnowledgeBaseStore();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  if (!document) return null;

  const versions = getDocumentVersions(document.id);
  const currentVersion: DocumentVersion = {
    versionNumber: document.version || '1.0',
    createdAt: document.updatedAt,
    createdBy: document.author,
    changeDescription: 'Текущая версия',
    content: document.content,
    fileName: document.fileName,
    fileSize: document.fileSize,
    fileUrl: document.fileUrl,
  };

  const allVersions = [currentVersion, ...versions];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${(bytes / 1024).toFixed(0)} КБ`;
  };

  const handleRestoreClick = (version: DocumentVersion) => {
    setSelectedVersion(version);
    setRestoreDialogOpen(true);
  };

  const handleConfirmRestore = () => {
    if (selectedVersion && document) {
      restoreVersion(document.id, selectedVersion.versionNumber);
      toast.success(`Версия ${selectedVersion.versionNumber} восстановлена`);
      setRestoreDialogOpen(false);
      setSelectedVersion(null);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="History" size={20} />
              История версий документа
            </DialogTitle>
            <DialogDescription>
              {document.title}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {allVersions.map((version, idx) => (
                <Card key={idx} className={`p-4 ${idx === 0 ? 'border-primary' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                            Версия {version.versionNumber}
                          </Badge>
                          {idx === 0 && (
                            <Badge variant="outline" className="gap-1">
                              <Icon name="Check" size={12} />
                              Текущая
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {version.changeDescription || 'Без описания изменений'}
                        </p>
                      </div>
                      {idx > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreClick(version)}
                          className="gap-2"
                        >
                          <Icon name="RotateCcw" size={14} />
                          Восстановить
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        {version.createdBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {format(new Date(version.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </div>
                      {version.content && (
                        <div className="flex items-center gap-1">
                          <Icon name="FileText" size={14} />
                          Текстовое содержимое
                        </div>
                      )}
                      {version.fileName && (
                        <>
                          <div className="flex items-center gap-1">
                            <Icon name="Paperclip" size={14} />
                            {version.fileName}
                          </div>
                          {version.fileSize && (
                            <div className="flex items-center gap-1">
                              <Icon name="HardDrive" size={14} />
                              {formatFileSize(version.fileSize)}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {version.content && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary hover:underline">
                          Предварительный просмотр содержимого
                        </summary>
                        <div className="mt-2 p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-xs">{version.content.slice(0, 500)}{version.content.length > 500 ? '...' : ''}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                </Card>
              ))}

              {allVersions.length === 1 && (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <Icon name="History" size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">История версий пуста</p>
                    <p className="text-sm mt-1">
                      Здесь будут отображаться предыдущие версии при обновлении документа
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Всего версий: {allVersions.length}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Восстановить версию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите восстановить версию {selectedVersion?.versionNumber}?
              <br />
              Текущая версия будет сохранена в истории.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>
              Восстановить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
