import { useEffect } from 'react';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { KnowledgeDocument } from '@/types';
import { REGULATORY_DOCUMENT_TYPES, FEDERAL_AUTHORITIES } from '@/types';

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KnowledgeDocument | null;
}

export default function DocumentViewDialog({
  open,
  onOpenChange,
  document,
}: DocumentViewDialogProps) {
  const { incrementViews, incrementDownloads } = useKnowledgeBaseStore();

  useEffect(() => {
    if (open && document) {
      incrementViews(document.id);
    }
  }, [open, document, incrementViews]);

  if (!document) return null;

  const handleDownload = () => {
    incrementDownloads(document.id);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${(bytes / 1024).toFixed(0)} КБ`;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'user_guide':
        return 'Инструкции пользователя';
      case 'regulatory':
        return 'Нормативные документы';
      case 'organization':
        return 'Документы организации';
      default:
        return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Icon name={document.fileName ? 'FileText' : 'BookText'} size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{document.title}</DialogTitle>
              {document.description && (
                <DialogDescription className="mt-2">{document.description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3 pb-4 border-b">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="FolderOpen" size={16} />
                <span>{getCategoryLabel(document.category)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="User" size={16} />
                <span>{document.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                <span>{format(new Date(document.adoptionDate || document.publishedAt || document.createdAt), 'd MMMM yyyy', { locale: ru })}</span>
              </div>
              {document.version && (
                <div className="flex items-center gap-2">
                  <Icon name="GitBranch" size={16} />
                  <span>{document.version}</span>
                </div>
              )}
              {document.fileName && (
                <div className="flex items-center gap-2">
                  <Icon name="HardDrive" size={16} />
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
              )}
            </div>

            {document.category === 'regulatory' && (
              <div className="flex flex-wrap gap-4 text-sm">
                {document.regulatoryType && (
                  <div className="flex items-center gap-2">
                    <Icon name="FileCheck" size={16} className="text-primary" />
                    <span className="font-medium">{REGULATORY_DOCUMENT_TYPES[document.regulatoryType]}</span>
                  </div>
                )}
                {document.documentNumber && (
                  <div className="flex items-center gap-2">
                    <Icon name="Hash" size={16} className="text-primary" />
                    <span className="font-medium">{document.documentNumber}</span>
                  </div>
                )}
                {document.regulatoryStatus && (
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={document.regulatoryStatus === 'active' ? 'CheckCircle2' : 'XCircle'} 
                      size={16} 
                      className={document.regulatoryStatus === 'active' ? 'text-green-600' : 'text-red-600'} 
                    />
                    <span className={document.regulatoryStatus === 'active' ? 'text-green-600' : 'text-red-600'}>
                      {document.regulatoryStatus === 'active' ? 'Действующий' : 'Недействующий'}
                    </span>
                  </div>
                )}
                {document.expiryDate && (
                  <div className="flex items-center gap-2">
                    <Icon name="CalendarX" size={16} className="text-amber-600" />
                    <span className="text-amber-600">Действует до: {format(new Date(document.expiryDate), 'd MMMM yyyy', { locale: ru })}</span>
                  </div>
                )}
                {document.authority && (
                  <div className="flex items-center gap-2">
                    <Icon name="Building2" size={16} className="text-primary" />
                    <span>{FEDERAL_AUTHORITIES[document.authority]}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  <Icon name="Tag" size={12} className="mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {document.content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="p-6 bg-muted/30 rounded-lg border">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {document.content}
                </pre>
              </div>
            </div>
          ) : document.fileName ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border">
              <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">Файл: {document.fileName}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {formatFileSize(document.fileSize)}
              </p>
              <Button onClick={handleDownload} className="gap-2">
                <Icon name="Download" size={16} />
                Скачать документ
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="FileX" size={64} className="mx-auto mb-4 opacity-20" />
              <p>Содержимое документа недоступно</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Icon name="Eye" size={14} />
                {document.viewsCount} просмотров
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Download" size={14} />
                {document.downloadsCount} загрузок
              </div>
            </div>
            <div className="text-xs">
              Обновлено {format(new Date(document.updatedAt), 'd MMM yyyy, HH:mm', { locale: ru })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}