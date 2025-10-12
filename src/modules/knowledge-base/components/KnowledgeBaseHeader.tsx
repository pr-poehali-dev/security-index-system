import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import PageHeader from '@/components/layout/PageHeader';

interface KnowledgeBaseHeaderProps {
  canManage: boolean;
  onCreateDocument: () => void;
  onExport: () => void;
  onImport: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function KnowledgeBaseHeader({
  canManage,
  onCreateDocument,
  onExport,
  onImport,
  onFileChange
}: KnowledgeBaseHeaderProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
    onImport();
  };

  return (
    <PageHeader
      title="База знаний"
      description="Документация, инструкции и нормативные материалы"
      action={
        <div className="flex gap-2">
          {canManage && (
            <>
              <Button onClick={onCreateDocument} className="gap-2">
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
                  <DropdownMenuItem onClick={onExport}>
                    <Icon name="Download" size={14} className="mr-2" />
                    Экспортировать документы
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImportClick}>
                    <Icon name="Upload" size={14} className="mr-2" />
                    Импортировать документы
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={onFileChange}
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
  );
}
