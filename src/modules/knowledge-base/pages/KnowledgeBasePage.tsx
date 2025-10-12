import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PageHeader from '@/components/layout/PageHeader';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { DocumentCategory } from '@/types';

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
  const { documents, getDocumentsByCategory, incrementViews, incrementDownloads } = useKnowledgeBaseStore();
  
  const [activeTab, setActiveTab] = useState<DocumentCategory>('user_guide');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleViewDocument = (docId: string) => {
    incrementViews(docId);
  };

  const handleDownloadDocument = (docId: string) => {
    incrementDownloads(docId);
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
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </Button>
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentCategory)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="user_guide" className="gap-2">
            <Icon name="BookOpen" size={16} />
            Инструкции
            <Badge variant="secondary" className="ml-1">{stats.userGuides}</Badge>
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="gap-2">
            <Icon name="Scale" size={16} />
            Нормативные
            <Badge variant="secondary" className="ml-1">{stats.regulatory}</Badge>
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Icon name="Building2" size={16} />
            Документы
            <Badge variant="secondary" className="ml-1">{stats.organization}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Icon name={categoryInfo.icon} size={24} className={categoryInfo.color} />
              <div>
                <h3 className="font-semibold">{categoryInfo.label}</h3>
                <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
              </div>
            </div>
          </Card>

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
                            onClick={() => handleViewDocument(doc.id)}
                            className="gap-2"
                          >
                            <Icon name="Eye" size={14} />
                            Просмотр
                          </Button>
                        )}
                        {doc.fileName && (
                          <Button 
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.id)}
                            className="gap-2"
                          >
                            <Icon name="Download" size={14} />
                            Скачать
                          </Button>
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
    </div>
  );
}
