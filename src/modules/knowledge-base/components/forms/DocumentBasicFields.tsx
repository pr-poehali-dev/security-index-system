import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { DocumentCategory, DocumentStatus } from '@/types';

interface DocumentBasicFieldsProps {
  category: DocumentCategory;
  onCategoryChange: (category: DocumentCategory) => void;
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  version: string;
  onVersionChange: (version: string) => void;
  status: DocumentStatus;
  onStatusChange: (status: DocumentStatus) => void;
  userRole?: string;
}

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

const allCategories: CategoryOption[] = [
  { value: 'regulatory', label: 'Нормативные документы', icon: 'Scale' },
  { value: 'organization', label: 'Документы организации', icon: 'Building2' },
  { value: 'platform_instruction', label: 'Инструкции платформы', icon: 'Zap' },
];

const statuses = [
  { value: 'draft', label: 'Черновик' },
  { value: 'published', label: 'Опубликован' },
  { value: 'archived', label: 'Архив' },
];

export default function DocumentBasicFields({
  category,
  onCategoryChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  version,
  onVersionChange,
  status,
  onStatusChange,
  userRole,
}: DocumentBasicFieldsProps) {
  const categories = allCategories.filter(cat => {
    if (cat.value === 'platform_instruction' && userRole !== 'SuperAdmin') {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="category">
          Раздел <span className="text-red-500">*</span>
        </Label>
        <Select value={category} onValueChange={(v) => onCategoryChange(v as DocumentCategory)}>
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
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Краткое описание содержания документа"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Версия</Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => onVersionChange(e.target.value)}
            placeholder="1.0, v2.5, ред. от 01.01.2024"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Статус <span className="text-red-500">*</span>
          </Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as DocumentStatus)}>
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
    </>
  );
}
