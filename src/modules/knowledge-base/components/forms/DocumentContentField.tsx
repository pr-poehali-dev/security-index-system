import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DocumentContentFieldProps {
  contentType: 'text' | 'file';
  onContentTypeChange: (type: 'text' | 'file') => void;
  content: string;
  onContentChange: (content: string) => void;
  fileName: string;
  fileSize?: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DocumentContentField({
  contentType,
  onContentTypeChange,
  content,
  onContentChange,
  fileName,
  fileSize,
  onFileChange,
}: DocumentContentFieldProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>
          Тип содержимого <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={contentType === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onContentTypeChange('text')}
            className="gap-2"
          >
            <Icon name="FileText" size={16} />
            Текстовое содержимое
          </Button>
          <Button
            type="button"
            variant={contentType === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onContentTypeChange('file')}
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
            onChange={(e) => onContentChange(e.target.value)}
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
                onChange={onFileChange}
                accept=".pdf,.doc,.docx,.txt,.md"
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
