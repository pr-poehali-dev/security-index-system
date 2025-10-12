import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import DocumentUploadModal from './DocumentUploadModal';
import type { Document, DocumentType, DocumentStatus } from '@/types/catalog';

interface ObjectDocumentsTabProps {
  objectId: string;
  allDocuments: Document[];
}

const documentTypeLabels: Record<DocumentType, string> = {
  passport: 'Паспорт',
  scheme: 'Схема',
  permit: 'Разрешение',
  protocol: 'Протокол',
  certificate: 'Заключение',
  other: 'Другое'
};

const documentStatusLabels: Record<DocumentStatus, string> = {
  valid: 'Действителен',
  expiring_soon: 'Истекает скоро',
  expired: 'Истек'
};

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function ObjectDocumentsTab({ objectId, allDocuments }: ObjectDocumentsTabProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [documentStatusFilter, setDocumentStatusFilter] = useState<string>('all');

  const documents = useMemo(() => {
    return allDocuments.filter(doc => {
      const matchesType = documentTypeFilter === 'all' || doc.type === documentTypeFilter;
      const matchesStatus = documentStatusFilter === 'all' || doc.status === documentStatusFilter;
      return matchesType && matchesStatus;
    });
  }, [allDocuments, documentTypeFilter, documentStatusFilter]);

  const handleResetFilters = () => {
    setDocumentTypeFilter('all');
    setDocumentStatusFilter('all');
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Icon name="FileText" size={18} />
              Документация
            </h3>
            <Button size="sm" variant="outline" onClick={() => setUploadModalOpen(true)}>
              <Icon name="Upload" className="mr-2" size={16} />
              Загрузить документ
            </Button>
          </div>

          {allDocuments.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Тип документа" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={documentStatusFilter} onValueChange={setDocumentStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.entries(documentStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {(documentTypeFilter !== 'all' || documentStatusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1"
                >
                  <Icon name="X" size={14} />
                  Сбросить
                </Button>
              )}
            </div>
          )}

          {allDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="FileText" className="mx-auto mb-2" size={48} />
              <p>Документы не загружены</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Search" className="mx-auto mb-2" size={48} />
              <p>Документы не найдены</p>
              <p className="text-sm mt-1">Попробуйте изменить параметры фильтра</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">
                  {documents.length} из {allDocuments.length} документ(ов)
                </Badge>
                {(documentTypeFilter !== 'all' || documentStatusFilter !== 'all') && (
                  <Badge variant="outline" className="gap-1">
                    <Icon name="Filter" size={12} />
                    Активные фильтры
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Icon name="File" size={24} className="text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.documentNumber && `№ ${doc.documentNumber} • `}
                        Выдан: {formatDate(doc.issueDate)}
                        {doc.expiryDate && ` • Действителен до: ${formatDate(doc.expiryDate)}`}
                      </p>
                      {doc.expiryDate && (
                        <Badge className={`mt-2 ${
                          doc.status === 'expired' 
                            ? 'bg-red-100 text-red-700' 
                            : doc.status === 'expiring_soon' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {doc.status === 'expired' && 'Истек'}
                          {doc.status === 'expiring_soon' && 'Истекает скоро'}
                          {doc.status === 'valid' && 'Действителен'}
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Icon name="Download" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        objectId={objectId}
      />
    </>
  );
}
