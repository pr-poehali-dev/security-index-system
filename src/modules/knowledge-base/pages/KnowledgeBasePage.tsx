import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import Icon from '@/components/ui/icon';
import PageHeader from '@/components/layout/PageHeader';
import DocumentFormDialog from '@/modules/knowledge-base/components/DocumentFormDialog';
import DocumentViewDialog from '@/modules/knowledge-base/components/DocumentViewDialog';
import DocumentVersionsDialog from '@/modules/knowledge-base/components/DocumentVersionsDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import type { DocumentCategory, KnowledgeDocument } from '@/types';

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = user?.role === 'SuperAdmin' || user?.role === 'TenantAdmin';

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

  const getCategoryInfo = (category: DocumentCategory) => {
    switch (category) {
      case 'user_guide':
        return {
          label: 'Инструкции пользователя',
          icon: 'BookOpen',
          description: 'Руководства по работе с системой',
          color: 'text-blue-600 dark:text-blue-400',
        };
      case 'regulatory':
        return {
          label: 'Нормативные документы',
          icon: 'Scale',
          description: 'Законы, приказы, правила и стандарты',
          color: 'text-purple-600 dark:text-purple-400',
        };
      case 'organization':
        return {
          label: 'Документы организации',
          icon: 'Building2',
          description: 'Внутренние положения и инструкции',
          color: 'text-green-600 dark:text-green-400',
        };
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${(bytes / 1024).toFixed(0)} КБ`;
  };

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
    fileInputRef.current?.click();
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const stats = useMemo(() => {
    return {
      userGuides: getDocumentsByCategory('user_guide').length,
      regulatory: getDocumentsByCategory('regulatory').length,
      organization: getDocumentsByCategory('organization').length,
      total: documents.filter(d => d.status === 'published').length,
    };
  }, [documents, getDocumentsByCategory]);

  const categoryInfo = getCategoryInfo(activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="База знаний"
        description="Документация, инструкции и нормативные материалы"
        action={
          <div className="flex gap-2">
            {canManage && (
              <>
                <Button onClick={handleCreateDocument} className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить документ
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Icon name="Download" size={16} />
                      Экспорт/Импорт
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportDocuments}>
                      <Icon name="Download" size={14} className="mr-2" />
                      Экспортировать документы
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportDocuments}>
                      <Icon name="Upload" size={14} className="mr-2" />
                      Импортировать документы
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Назад
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon name="BookOpen" size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.userGuides}</p>
              <p className="text-sm text-muted-foreground">Инструкций</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Icon name="Scale" size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.regulatory}</p>
              <p className="text-sm text-muted-foreground">Нормативных</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Icon name="Building2" size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.organization}</p>
              <p className="text-sm text-muted-foreground">Документов</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Icon name="FileText" size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Всего</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, описанию или тегам..."
            className="pl-10"
          />
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentCategory)} className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="user_guide" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BookOpen" size={20} />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Инструкции</span>
              <Badge variant="secondary" className="text-xs">{stats.userGuides}</Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Scale" size={20} />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Нормативные</span>
              <Badge variant="secondary" className="text-xs">{stats.regulatory}</Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building2" size={20} />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Документы</span>
              <Badge variant="secondary" className="text-xs">{stats.organization}</Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">

          {filteredDocuments.length === 0 ? (
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
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Icon 
                              name={doc.fileName ? 'FileText' : 'BookText'} 
                              size={24} 
                              className="text-primary" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {doc.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Icon name="User" size={14} />
                                {doc.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {format(new Date(doc.publishedAt || doc.createdAt), 'd MMM yyyy', { locale: ru })}
                              </div>
                              {doc.version && (
                                <div className="flex items-center gap-1">
                                  <Icon name="GitBranch" size={14} />
                                  {doc.version}
                                </div>
                              )}
                              {doc.fileName && (
                                <div className="flex items-center gap-1">
                                  <Icon name="HardDrive" size={14} />
                                  {formatFileSize(doc.fileSize)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {doc.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Icon name="Tag" size={12} className="mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon name="Eye" size={14} />
                          {doc.viewsCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Download" size={14} />
                          {doc.downloadsCount}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {doc.content && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDocument(doc)}
                            className="gap-2"
                          >
                            <Icon name="Eye" size={14} />
                            Просмотр
                          </Button>
                        )}
                        {doc.fileName && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(doc.id)}
                            className="gap-2"
                          >
                            <Icon name="Download" size={14} />
                            Скачать
                          </Button>
                        )}
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Icon name="MoreVertical" size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewVersions(doc)}>
                                <Icon name="History" size={14} className="mr-2" />
                                История версий
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                                <Icon name="Edit" size={14} className="mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(doc)}
                                className="text-destructive"
                              >
                                <Icon name="Trash2" size={14} className="mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить документ?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить документ "{selectedDocument?.title}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}