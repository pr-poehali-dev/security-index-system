import { useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { DocumentType } from '@/types/catalog';

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectId: string;
}

const documentTypeLabels: Record<DocumentType, string> = {
  passport: 'Паспорт',
  scheme: 'Схема',
  permit: 'Разрешение',
  protocol: 'Протокол',
  certificate: 'Заключение',
  other: 'Другое'
};

export default function DocumentUploadModal({ open, onOpenChange, objectId }: DocumentUploadModalProps) {
  const { addDocument } = useCatalogStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'other' as DocumentType,
    documentNumber: '',
    issueDate: '',
    expiryDate: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, '') }));
      }
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!file) {
      newErrors.file = 'Выберите файл для загрузки';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Введите название документа';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Укажите дату выдачи';
    } else {
      const issueDate = new Date(formData.issueDate);
      if (issueDate > new Date()) {
        newErrors.issueDate = 'Дата выдачи не может быть в будущем';
      }
    }

    if (formData.expiryDate && formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate < issueDate) {
        newErrors.expiryDate = 'Срок действия не может быть раньше даты выдачи';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const fileUrl = `/docs/${file!.name}`;
      
      // Определяем статус документа на основе срока действия
      let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';
      if (formData.expiryDate) {
        const today = new Date();
        const expiryDate = new Date(formData.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= 30) {
          status = 'expiring_soon';
        }
      }
      
      addDocument({
        objectId,
        title: formData.title.trim(),
        type: formData.type,
        documentNumber: formData.documentNumber.trim() || undefined,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate || undefined,
        fileUrl,
        fileName: file!.name,
        fileSize: file!.size,
        status,
        uploadedBy: 'Текущий пользователь'
      });

      handleClose();
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      type: 'other',
      documentNumber: '',
      issueDate: '',
      expiryDate: ''
    });
    setFile(null);
    setErrors({});
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Upload" size={24} />
            Загрузить документ
          </DialogTitle>
          <DialogDescription>
            Добавьте новый документ для объекта
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">
              Файл <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className={errors.file ? 'border-destructive' : ''}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="File" size={16} />
                  <span>{file.name}</span>
                  <span className="text-xs">({formatFileSize(file.size)})</span>
                </div>
              )}
              {errors.file && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors.file}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Например: Паспорт котла"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Тип документа <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value as DocumentType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
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
                value={formData.documentNumber}
                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                placeholder="ЭПБ-2024-0145"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">
                Дата выдачи <span className="text-destructive">*</span>
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={errors.issueDate ? 'border-destructive' : ''}
              />
              {errors.issueDate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors.issueDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Срок действия до</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className={errors.expiryDate ? 'border-destructive' : ''}
              />
              {errors.expiryDate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {errors.expiryDate}
                </p>
              )}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p>Поддерживаемые форматы: PDF, DOC, DOCX, JPG, PNG</p>
                <p>Максимальный размер файла: 10 МБ</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                Загрузка...
              </>
            ) : (
              <>
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}