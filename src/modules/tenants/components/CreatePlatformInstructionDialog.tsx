import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import Icon from '@/components/ui/icon';

interface CreatePlatformInstructionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePlatformInstructionDialog({
  open,
  onOpenChange,
}: CreatePlatformInstructionDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'text' | 'file'>('text');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const addDocument = useKnowledgeBaseStore((state) => state.addDocument);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Заполните обязательные поля');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    addDocument({
      tenantId: 'platform',
      category: 'platform_instruction',
      title: title.trim(),
      description: description.trim() || undefined,
      content: contentType === 'text' ? content : undefined,
      fileName: contentType === 'file' ? fileName : undefined,
      fileSize: contentType === 'file' ? 0 : undefined,
      tags: tagsArray,
      author: 'SuperAdmin',
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : undefined,
    });

    setTitle('');
    setDescription('');
    setContent('');
    setFileName('');
    setTags('');
    setStatus('draft');
    setContentType('text');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить инструкцию платформы</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Название <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название инструкции"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание инструкции"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Тип содержимого</Label>
            <Select value={contentType} onValueChange={(value: 'text' | 'file') => setContentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" size={16} />
                    <span>Текстовое содержимое</span>
                  </div>
                </SelectItem>
                <SelectItem value="file">
                  <div className="flex items-center gap-2">
                    <Icon name="Paperclip" size={16} />
                    <span>Файл</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contentType === 'text' ? (
            <div className="space-y-2">
              <Label htmlFor="content">Содержимое</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Текст инструкции (поддерживает Markdown)"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file">Файл</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileName(file.name);
                    }
                  }}
                />
              </div>
              {fileName && (
                <p className="text-sm text-muted-foreground">
                  Выбран файл: {fileName}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Теги</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Тег1, Тег2, Тег3"
            />
            <p className="text-xs text-muted-foreground">
              Разделяйте теги запятыми
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус публикации</Label>
            <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <Icon name="FileEdit" size={16} />
                    <span>Черновик</span>
                  </div>
                </SelectItem>
                <SelectItem value="published">
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} />
                    <span>Опубликовано</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Save" size={16} />
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
