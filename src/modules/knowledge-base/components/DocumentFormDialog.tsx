import { useState, useEffect } from 'react';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { KnowledgeDocument, DocumentCategory, DocumentStatus, RegulatoryDocumentType, FederalAuthority } from '@/types';
import { REGULATORY_DOCUMENT_TYPES, FEDERAL_AUTHORITIES } from '@/types';

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: KnowledgeDocument;
  mode: 'create' | 'edit';
  initialCategory?: DocumentCategory;
}

export default function DocumentFormDialog({
  open,
  onOpenChange,
  document,
  mode,
  initialCategory,
}: DocumentFormDialogProps) {
  const { addDocument, updateDocument } = useKnowledgeBaseStore();
  const user = useAuthStore((state) => state.user);

  const [category, setCategory] = useState<DocumentCategory>('user_guide');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [contentType, setContentType] = useState<'text' | 'file'>('text');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>();
  const [changeDescription, setChangeDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regulatoryType, setRegulatoryType] = useState<RegulatoryDocumentType | ''>('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [adoptionDate, setAdoptionDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [authority, setAuthority] = useState<FederalAuthority | ''>('');

  useEffect(() => {
    if (document && mode === 'edit') {
      setCategory(document.category);
      setTitle(document.title);
      setDescription(document.description || '');
      setContent(document.content || '');
      setVersion(document.version || '');
      setStatus(document.status);
      setTags(document.tags || []);
      setContentType(document.fileName ? 'file' : 'text');
      setFileName(document.fileName || '');
      setFileSize(document.fileSize);
      setRegulatoryType(document.regulatoryType || '');
      setDocumentNumber(document.documentNumber || '');
      setAdoptionDate(document.adoptionDate || '');
      setEffectiveDate(document.effectiveDate || '');
      setAuthority(document.authority || '');
    } else {
      handleReset();
      if (initialCategory && mode === 'create') {
        setCategory(initialCategory);
      }
    }
  }, [document, mode, open, initialCategory]);

  const handleReset = () => {
    setCategory(initialCategory || 'user_guide');
    setTitle('');
    setDescription('');
    setContent('');
    setVersion('');
    setStatus('draft');
    setTags([]);
    setTagInput('');
    setContentType('text');
    setFileName('');
    setFileSize(undefined);
    setChangeDescription('');
    setRegulatoryType('');
    setDocumentNumber('');
    setAdoptionDate('');
    setEffectiveDate('');
    setAuthority('');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setContent(event.target?.result as string || '');
        };
        reader.readAsText(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Укажите название документа');
      return;
    }

    if (contentType === 'text' && !content.trim()) {
      toast.error('Добавьте содержимое документа');
      return;
    }

    if (contentType === 'file' && !fileName) {
      toast.error('Загрузите файл');
      return;
    }

    setIsSubmitting(true);

    try {
      const documentData = {
        tenantId: user?.tenantId || 'tenant-1',
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        content: contentType === 'text' ? content.trim() : undefined,
        fileName: contentType === 'file' ? fileName : undefined,
        fileSize: contentType === 'file' ? fileSize : undefined,
        version: version.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        author: user?.name || 'Администратор',
        status,
        regulatoryType: regulatoryType || undefined,
        documentNumber: documentNumber.trim() || undefined,
        adoptionDate: adoptionDate || undefined,
        effectiveDate: effectiveDate || undefined,
        authority: authority || undefined,
      };

      if (mode === 'edit' && document) {
        updateDocument(
          document.id, 
          {
            ...documentData,
            publishedAt: status === 'published' && document.status !== 'published' 
              ? new Date().toISOString() 
              : document.publishedAt,
          },
          changeDescription || 'Обновление документа',
          user?.name || 'Администратор'
        );
        toast.success('Документ обновлён');
      } else {
        addDocument({
          ...documentData,
          publishedAt: status === 'published' ? new Date().toISOString() : undefined,
        });
        toast.success('Документ добавлен');
      }

      onOpenChange(false);
      handleReset();
    } catch (error) {
      toast.error('Ошибка сохранения документа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'user_guide', label: 'Инструкции пользователя', icon: 'BookOpen' },
    { value: 'regulatory', label: 'Нормативные документы', icon: 'Scale' },
    { value: 'organization', label: 'Документы организации', icon: 'Building2' },
  ];

  const statuses = [
    { value: 'draft', label: 'Черновик' },
    { value: 'published', label: 'Опубликован' },
    { value: 'archived', label: 'Архив' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Добавить документ' : 'Редактировать документ'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Создайте новый документ в базе знаний'
              : 'Измените информацию о документе'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">
              Раздел <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <Icon name={cat.icon} size={16} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Название <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название документа"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание содержания документа"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Тип содержимого <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={contentType === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('text')}
                className="gap-2"
              >
                <Icon name="FileText" size={16} />
                Текстовое содержимое
              </Button>
              <Button
                type="button"
                variant={contentType === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('file')}
                className="gap-2"
              >
                <Icon name="Upload" size={16} />
                Загрузить файл
              </Button>
            </div>
          </div>

          {contentType === 'text' ? (
            <div className="space-y-2">
              <Label htmlFor="content">
                Содержимое <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Введите или вставьте текст документа. Поддерживается Markdown."
                rows={10}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Можно использовать Markdown для форматирования: # Заголовок, **жирный**, *курсив*
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file">
                Файл документа <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="flex flex-col items-center gap-3">
                  <Icon name="Upload" size={32} className="text-muted-foreground" />
                  {fileName ? (
                    <div className="text-center">
                      <p className="font-medium">{fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {fileSize ? `${(fileSize / 1024).toFixed(0)} КБ` : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Загрузите PDF, DOCX, TXT или другой файл
                    </p>
                  )}
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.md"
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'regulatory' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="regulatoryType">Тип нормативного документа</Label>
                <Select value={regulatoryType} onValueChange={(v) => setRegulatoryType(v as RegulatoryDocumentType)}>
                  <SelectTrigger id="regulatoryType">
                    <SelectValue placeholder="Выберите тип документа" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REGULATORY_DOCUMENT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Номер документа</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="123-ФЗ, N 1234, и т.д."
                  maxLength={100}
                />
              </div>

              {regulatoryType && (regulatoryType.includes('order') || regulatoryType === 'government_decree') && (
                <div className="space-y-2">
                  <Label htmlFor="authority">Ведомство</Label>
                  <Select value={authority} onValueChange={(v) => setAuthority(v as FederalAuthority)}>
                    <SelectTrigger id="authority">
                      <SelectValue placeholder="Выберите ведомство" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FEDERAL_AUTHORITIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adoptionDate">Дата принятия</Label>
                  <Input
                    id="adoptionDate"
                    type="date"
                    value={adoptionDate}
                    onChange={(e) => setAdoptionDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Дата вступления в силу</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Версия</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0, v2.5, ред. от 01.01.2024"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Статус <span className="text-red-500">*</span>
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === 'edit' && (
            <div className="space-y-2">
              <Label htmlFor="changeDescription">Описание изменений</Label>
              <Textarea
                id="changeDescription"
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Опишите, что было изменено в документе (опционально)"
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Будет сохранено в истории версий для отслеживания изменений
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Теги</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Добавьте тег и нажмите Enter"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Icon name={mode === 'create' ? 'Plus' : 'Save'} size={16} />
              {isSubmitting ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}