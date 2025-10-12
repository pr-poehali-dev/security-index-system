import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useCertificationStore, type Certification, type CertificationDocument } from '@/stores/certificationStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CertificationDocumentsViewerProps {
  certification: Certification;
}

const documentTypeLabels = {
  certificate: 'Удостоверение',
  protocol: 'Протокол',
  scan: 'Скан',
  other: 'Другое'
};

const documentTypeIcons = {
  certificate: 'Award',
  protocol: 'ScrollText',
  scan: 'Scan',
  other: 'File'
};

const roleLabels = {
  training_center: 'Учебный центр',
  employee: 'Сотрудник',
  admin: 'Администратор'
};

export default function CertificationDocumentsViewer({ certification }: CertificationDocumentsViewerProps) {
  const { deleteDocument } = useCertificationStore();

  const documents = certification.documents || [];

  const handleDownload = (doc: CertificationDocument) => {
    window.open(doc.fileUrl, '_blank');
  };

  const handleDelete = (docId: string) => {
    if (confirm('Удалить документ?')) {
      deleteDocument(certification.id, docId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Files" size={20} />
          Документы аттестации
        </CardTitle>
        <CardDescription>
          Удостоверения, протоколы и другие документы
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <Alert>
            <Icon name="Info" size={16} />
            <AlertDescription>
              Документы не загружены. Обратитесь в учебный центр или загрузите документы вручную.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name={documentTypeIcons[doc.type]} size={20} className="text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{doc.fileName}</p>
                      <Badge variant="outline" className="flex-shrink-0">
                        {documentTypeLabels[doc.type]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="HardDrive" size={12} />
                        {formatFileSize(doc.fileSize)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={12} />
                        {format(new Date(doc.uploadedAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={12} />
                        {doc.uploadedBy} ({roleLabels[doc.uploadedByRole]})
                      </span>
                    </div>
                    
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDownload(doc)}
                  >
                    <Icon name="Download" size={14} />
                    Скачать
                  </Button>
                  
                  {doc.uploadedByRole !== 'training_center' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="gap-2 w-full">
            <Icon name="Upload" size={16} />
            Загрузить документ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}