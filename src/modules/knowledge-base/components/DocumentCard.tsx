import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { KnowledgeDocument } from '@/types';

interface DocumentCardProps {
  document: KnowledgeDocument;
  canManage: boolean;
  onView: (doc: KnowledgeDocument) => void;
  onDownload: (docId: string) => void;
  onEdit: (doc: KnowledgeDocument) => void;
  onDelete: (doc: KnowledgeDocument) => void;
  onViewVersions: (doc: KnowledgeDocument) => void;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${(bytes / 1024).toFixed(0)} КБ`;
};

export default function DocumentCard({
  document: doc,
  canManage,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onViewVersions
}: DocumentCardProps) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
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
                onClick={() => onView(doc)}
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
                onClick={() => onDownload(doc.id)}
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
                  <DropdownMenuItem onClick={() => onViewVersions(doc)}>
                    <Icon name="History" size={14} className="mr-2" />
                    История версий
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(doc)}>
                    <Icon name="Edit" size={14} className="mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(doc)}
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
  );
}
