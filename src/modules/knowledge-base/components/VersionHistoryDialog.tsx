import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { KnowledgeDocument } from '@/types';

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KnowledgeDocument | null;
}

export default function VersionHistoryDialog({
  open,
  onOpenChange,
  document,
}: VersionHistoryDialogProps) {
  if (!document) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${(bytes / 1024).toFixed(0)} КБ`;
  };

  const currentVersion = {
    versionNumber: document.version || '1.0',
    content: document.content,
    fileName: document.fileName,
    fileSize: document.fileSize,
    changeDescription: 'Текущая версия',
    author: document.author,
    createdAt: document.updatedAt,
  };

  const allVersions = [currentVersion, ...(document.versionHistory || [])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="History" size={24} />
            История версий: {document.title}
          </DialogTitle>
          <DialogDescription>
            Полная история изменений документа с описанием каждой версии
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {allVersions.length === 1 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <Icon name="FileText" size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">История изменений пуста</p>
                <p className="text-sm mt-2">
                  Версии будут сохраняться при каждом редактировании документа
                </p>
              </div>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {allVersions.map((version, index) => {
                  const isCurrentVersion = index === 0;
                  
                  return (
                    <Card 
                      key={`${version.versionNumber}-${index}`}
                      className={`relative ml-12 p-5 ${isCurrentVersion ? 'border-primary shadow-md' : ''}`}
                    >
                      <div 
                        className={`absolute left-[-3.25rem] top-6 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCurrentVersion 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon name={isCurrentVersion ? 'Star' : 'GitCommit'} size={18} />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">
                                Версия {version.versionNumber}
                              </h3>
                              {isCurrentVersion && (
                                <Badge variant="default" className="gap-1">
                                  <Icon name="CheckCircle2" size={12} />
                                  Текущая
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {version.changeDescription}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Icon name="User" size={14} />
                            {version.author}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Icon name="Calendar" size={14} />
                            {format(new Date(version.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                          </div>
                          {version.fileName && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Icon name="File" size={14} />
                                {version.fileName}
                              </div>
                              {version.fileSize && (
                                <div className="flex items-center gap-1.5">
                                  <Icon name="HardDrive" size={14} />
                                  {formatFileSize(version.fileSize)}
                                </div>
                              )}
                            </>
                          )}
                          {version.content && !version.fileName && (
                            <div className="flex items-center gap-1.5">
                              <Icon name="FileText" size={14} />
                              Текстовое содержимое
                            </div>
                          )}
                        </div>

                        {version.content && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                              Показать содержимое
                            </summary>
                            <div className="mt-2 p-3 bg-muted rounded-lg max-h-60 overflow-y-auto">
                              <pre className="text-xs whitespace-pre-wrap font-mono">
                                {version.content.substring(0, 500)}
                                {version.content.length > 500 && '...'}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
