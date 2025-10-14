import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import DocumentCard from './DocumentCard';
import type { DocumentCategory, KnowledgeDocument } from '@/types';

interface DocumentsListProps {
  activeTab: DocumentCategory;
  documents: KnowledgeDocument[];
  searchQuery: string;
  canManage: boolean;
  userRole?: string;
  onView: (doc: KnowledgeDocument) => void;
  onDownload: (docId: string) => void;
  onEdit: (doc: KnowledgeDocument) => void;
  onDelete: (doc: KnowledgeDocument) => void;
  onViewVersions: (doc: KnowledgeDocument) => void;
}

export default function DocumentsList({
  activeTab,
  documents,
  searchQuery,
  canManage,
  userRole,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onViewVersions
}: DocumentsListProps) {
  return (
    <TabsContent value={activeTab} className="space-y-4">
      {documents.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Icon name="FileSearch" size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">
              {searchQuery ? 'Документы не найдены' : 'Нет доступных документов'}
            </p>
            <p className="text-sm mt-2">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос'
                : 'В этом разделе пока нет опубликованных документов'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => {
            const canManageDoc = doc.category === 'platform_instruction' 
              ? userRole === 'SuperAdmin'
              : canManage;
            
            return (
              <DocumentCard
                key={doc.id}
                document={doc}
                canManage={canManageDoc}
                onView={onView}
                onDownload={onDownload}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewVersions={onViewVersions}
              />
            );
          })}
        </div>
      )}
    </TabsContent>
  );
}