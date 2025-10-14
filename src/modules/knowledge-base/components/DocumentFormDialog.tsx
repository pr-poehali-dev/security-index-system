import { useState, useEffect } from 'react';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { KnowledgeDocument, DocumentCategory, DocumentStatus, RegulatoryDocumentType } from '@/types';
import DocumentBasicFields from './forms/DocumentBasicFields';
import RegulatoryDocumentFields from './forms/RegulatoryDocumentFields';
import DocumentContentField from './forms/DocumentContentField';
import DocumentTagsField from './forms/DocumentTagsField';

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

  const [category, setCategory] = useState<DocumentCategory>('regulatory');
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
  const [expiryDate, setExpiryDate] = useState('');
  const [regulatoryStatus, setRegulatoryStatus] = useState<'active' | 'inactive'>('active');

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
      setExpiryDate(document.expiryDate || '');
      setRegulatoryStatus(document.regulatoryStatus || 'active');
    } else {
      handleReset();
      if (initialCategory && mode === 'create') {
        setCategory(initialCategory);
      }
    }
  }, [document, mode, open, initialCategory]);

  const handleReset = () => {
    setCategory(initialCategory || 'regulatory');
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
    setExpiryDate('');
    setRegulatoryStatus('active');
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
        expiryDate: expiryDate || undefined,
        regulatoryStatus: category === 'regulatory' ? regulatoryStatus : undefined,
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
          <DocumentBasicFields
            category={category}
            onCategoryChange={setCategory}
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            version={version}
            onVersionChange={setVersion}
            status={status}
            onStatusChange={setStatus}
            userRole={user?.role}
          />

          {category === 'regulatory' && (
            <RegulatoryDocumentFields
              regulatoryType={regulatoryType}
              onRegulatoryTypeChange={setRegulatoryType}
              documentNumber={documentNumber}
              onDocumentNumberChange={setDocumentNumber}
              adoptionDate={adoptionDate}
              onAdoptionDateChange={setAdoptionDate}
              expiryDate={expiryDate}
              onExpiryDateChange={setExpiryDate}
              regulatoryStatus={regulatoryStatus}
              onRegulatoryStatusChange={setRegulatoryStatus}
            />
          )}

          <DocumentContentField
            contentType={contentType}
            onContentTypeChange={setContentType}
            content={content}
            onContentChange={setContent}
            fileName={fileName}
            fileSize={fileSize}
            onFileChange={handleFileChange}
          />

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

          <DocumentTagsField
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

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
