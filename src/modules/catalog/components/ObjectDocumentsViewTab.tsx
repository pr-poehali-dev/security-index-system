import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { ObjectDocument } from '@/types/catalog';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface ObjectDocumentsViewTabProps {
  documents: ObjectDocument[];
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  commissioning: 'Документ, подтверждающий ввод объекта в эксплуатацию',
  safety_declaration: 'Декларация промышленной безопасности',
  expertise: 'Заключение экспертизы промышленной безопасности (ЭПБ)',
  diagnostic_report: 'Отчет о техническом диагностировании',
  passport: 'Паспорт объекта',
  manual: 'Руководство по эксплуатации',
  instructions: 'Инструкции',
  other: 'Прочие'
};

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function ObjectDocumentsViewTab({ documents }: ObjectDocumentsViewTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAllDocuments = async () => {
    const documentsWithFiles = documents.filter(doc => doc.fileUrl && doc.fileName);
    
    if (documentsWithFiles.length === 0) {
      toast.error('Нет документов для скачивания');
      return;
    }

    setIsDownloading(true);
    toast.info('Создаю архив с документами...');

    try {
      const zip = new JSZip();
      
      for (const doc of documentsWithFiles) {
        try {
          const response = await fetch(doc.fileUrl!);
          if (!response.ok) continue;
          
          const blob = await response.blob();
          const fileName = doc.fileName || `document-${doc.id}`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Ошибка загрузки документа ${doc.fileName}:`, error);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documents-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Архив успешно загружен');
    } catch (error) {
      console.error('Ошибка создания архива:', error);
      toast.error('Не удалось создать архив');
    } finally {
      setIsDownloading(false);
    }
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="FileText" className="mx-auto mb-3 text-muted-foreground" size={48} />
          <p className="text-muted-foreground">Документы не загружены</p>
        </CardContent>
      </Card>
    );
  }

  const documentsWithFiles = documents.filter(doc => doc.fileUrl);

  return (
    <div className="space-y-4">
      {documentsWithFiles.length > 1 && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={downloadAllDocuments}
            disabled={isDownloading}
          >
            <Icon name={isDownloading ? "Loader2" : "FolderArchive"} size={16} className={`mr-2 ${isDownloading ? 'animate-spin' : ''}`} />
            {isDownloading ? 'Создаю архив...' : `Скачать все (${documentsWithFiles.length})`}
          </Button>
        </div>
      )}
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <Icon name="FileText" size={24} className="text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1">{DOCUMENT_TYPE_LABELS[doc.type]}</h4>
                  {doc.fileName && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Icon name="Paperclip" size={14} />
                      {doc.fileName}
                      {doc.fileSize && <span>({(doc.fileSize / 1024).toFixed(1)} КБ)</span>}
                    </p>
                  )}
                </div>
              </div>
              {doc.fileUrl && (
                <Button size="sm" variant="outline">
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {doc.documentNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground min-w-[120px]">Номер документа:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{doc.documentNumber}</code>
                </div>
              )}

              {doc.issueDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground min-w-[120px]">Дата документа:</span>
                  <span className="text-sm font-medium">{formatDate(doc.issueDate)}</span>
                </div>
              )}

              {doc.expiryDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground min-w-[120px]">Срок действия:</span>
                  <span className="text-sm font-medium">{formatDate(doc.expiryDate)}</span>
                </div>
              )}

              {doc.type === 'expertise' && (
                <>
                  {doc.rtnRegistrationNumber && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Shield" size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                          Регистрация в Ростехнадзоре
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <span className="text-sm text-muted-foreground min-w-[120px]">Номер регистрации:</span>
                        <code className="text-sm bg-white dark:bg-gray-900 px-2 py-1 rounded">
                          {doc.rtnRegistrationNumber}
                        </code>
                      </div>
                      {doc.operationExtendedUntil && (
                        <div className="flex items-center gap-2 ml-6">
                          <span className="text-sm text-muted-foreground min-w-[120px]">
                            Срок продления эксплуатации:
                          </span>
                          <span className="text-sm font-medium">
                            {formatDate(doc.operationExtendedUntil)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {doc.status && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground min-w-[120px]">Статус:</span>
                  <Badge
                    variant={doc.status === 'valid' ? 'default' : doc.status === 'expiring_soon' ? 'secondary' : 'destructive'}
                  >
                    {doc.status === 'valid' && 'Действителен'}
                    {doc.status === 'expiring_soon' && 'Истекает скоро'}
                    {doc.status === 'expired' && 'Истек'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}