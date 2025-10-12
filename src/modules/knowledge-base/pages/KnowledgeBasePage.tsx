import { useState, useMemo } from 'react';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { DocumentCategory, KnowledgeDocument } from '@/types';
import KnowledgeBaseHeader from '@/modules/knowledge-base/components/KnowledgeBaseHeader';
import KnowledgeBaseStats from '@/modules/knowledge-base/components/KnowledgeBaseStats';
import KnowledgeBaseSearch from '@/modules/knowledge-base/components/KnowledgeBaseSearch';
import KnowledgeBaseTabs from '@/modules/knowledge-base/components/KnowledgeBaseTabs';
import DocumentsList from '@/modules/knowledge-base/components/DocumentsList';
import DocumentFormDialog from '@/modules/knowledge-base/components/DocumentFormDialog';
import DocumentViewDialog from '@/modules/knowledge-base/components/DocumentViewDialog';
import DocumentVersionsDialog from '@/modules/knowledge-base/components/DocumentVersionsDialog';
import DeleteDocumentDialog from '@/modules/knowledge-base/components/DeleteDocumentDialog';

export default function KnowledgeBasePage() {
  const user = useAuthStore((state) => state.user);
  const { documents, getDocumentsByCategory, incrementViews, incrementDownloads, deleteDocument } = useKnowledgeBaseStore();
  
  const [activeTab, setActiveTab] = useState<DocumentCategory>('user_guide');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const canManage = user?.role === 'SuperAdmin' || user?.role === 'TenantAdmin';
  const canView = true;

  const filteredDocuments = useMemo(() => {
    const categoryDocs = getDocumentsByCategory(activeTab);
    
    if (!searchQuery) return categoryDocs;
    
    const query = searchQuery.toLowerCase();
    return categoryDocs.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [activeTab, searchQuery, documents, getDocumentsByCategory]);

  const stats = useMemo(() => {
    return {
      userGuides: getDocumentsByCategory('user_guide').length,
      regulatory: getDocumentsByCategory('regulatory').length,
      organization: getDocumentsByCategory('organization').length,
      total: documents.filter(d => d.status === 'published').length,
    };
  }, [documents, getDocumentsByCategory]);

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEditDocument = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleViewDocument = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setViewOpen(true);
  };

  const handleViewVersions = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setVersionsDialogOpen(true);
  };

  const handleDownloadDocument = (docId: string) => {
    incrementDownloads(docId);
    toast.success('Документ загружен');
  };

  const handleDeleteClick = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDocument) {
      deleteDocument(selectedDocument.id);
      toast.success('Документ удалён');
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleExportDocuments = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      documents: filteredDocuments.length > 0 ? filteredDocuments : getDocumentsByCategory(activeTab),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-base-${activeTab}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Документы экспортированы');
  };

  const handleImportDocuments = () => {
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.documents || !Array.isArray(data.documents)) {
        toast.error('Неверный формат файла');
        return;
      }

      let imported = 0;
      data.documents.forEach((doc: any) => {
        if (doc.title && doc.category) {
          const { id, createdAt, updatedAt, viewsCount, downloadsCount, ...docData } = doc;
          useKnowledgeBaseStore.getState().addDocument({
            ...docData,
            tenantId: user?.tenantId || 'tenant-1',
          });
          imported++;
        }
      });

      toast.success(`Импортировано документов: ${imported}`);
    } catch (error) {
      toast.error('Ошибка при импорте файла');
      console.error(error);
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <KnowledgeBaseHeader
        canManage={canManage}
        onCreateDocument={handleCreateDocument}
        onExport={handleExportDocuments}
        onImport={handleImportDocuments}
        onFileChange={handleFileChange}
      />

      <KnowledgeBaseStats
        userGuides={stats.userGuides}
        regulatory={stats.regulatory}
        organization={stats.organization}
        total={stats.total}
      />

      <KnowledgeBaseSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <KnowledgeBaseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
      >
        <DocumentsList
          activeTab={activeTab}
          documents={filteredDocuments}
          searchQuery={searchQuery}
          canManage={canManage}
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
          onEdit={handleEditDocument}
          onDelete={handleDeleteClick}
          onViewVersions={handleViewVersions}
        />
      </KnowledgeBaseTabs>

      <DocumentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        document={selectedDocument || undefined}
        mode={formMode}
      />

      <DocumentViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        document={selectedDocument}
      />

      <DocumentVersionsDialog
        open={versionsDialogOpen}
        onOpenChange={setVersionsDialogOpen}
        document={selectedDocument}
      />

      <DeleteDocumentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        document={selectedDocument}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}