import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { getFileName, openStoredFile } from '@/utils/fileStorage';

interface FileUploadProps {
  label?: string;
  accept?: string;
  currentFileUrl?: string;
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  disabled?: boolean;
  maxSize?: number;
  className?: string;
}

export default function FileUpload({
  label = 'Загрузить файл',
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  currentFileUrl,
  onFileSelect,
  onFileRemove,
  disabled = false,
  maxSize = 10,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setError('');
    
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`Размер файла не должен превышать ${maxSize} МБ`);
      return;
    }

    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.some(ext => fileExtension === ext || ext === '*')) {
      setError('Недопустимый формат файла');
      return;
    }

    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };



  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {currentFileUrl ? (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
          <Icon name="FileCheck" size={18} className="text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentFileUrl ? getFileName(currentFileUrl) : 'Документ'}</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => currentFileUrl && openStoredFile(currentFileUrl)}
            >
              Открыть
            </Button>
          </div>
          {onFileRemove && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onFileRemove}
              disabled={disabled}
            >
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-md p-6 transition-colors cursor-pointer',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Icon name="Upload" size={24} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                или перетащите файл сюда
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Максимум {maxSize} МБ
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <Icon name="AlertCircle" size={12} />
          {error}
        </p>
      )}
    </div>
  );
}