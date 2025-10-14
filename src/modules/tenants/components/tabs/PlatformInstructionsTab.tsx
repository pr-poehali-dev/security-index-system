import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import CreatePlatformInstructionDialog from '../CreatePlatformInstructionDialog';
import EditPlatformInstructionDialog from '../EditPlatformInstructionDialog';
import type { KnowledgeDocument } from '@/types';

export default function PlatformInstructionsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
  const documents = useKnowledgeBaseStore((state) => state.documents);
  const deleteDocument = useKnowledgeBaseStore((state) => state.deleteDocument);

  const platformInstructions = documents.filter(
    (doc) => doc.category === 'platform_instruction'
  );

  const filteredInstructions = platformInstructions.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту инструкцию? Она будет удалена для всех тенантов.')) {
      deleteDocument(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Инструкции платформы</h2>
            <p className="text-muted-foreground">
              Управление общими инструкциями платформы, доступными всем тенантам только для просмотра
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Icon name="Plus" size={16} />
            Добавить инструкцию
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск по названию, описанию или тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredInstructions.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'Инструкции не найдены' : 'Нет инструкций платформы'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : 'Создайте первую инструкцию платформы для всех организаций'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Icon name="Plus" size={16} />
                Добавить инструкцию
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Теги</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Обновлено</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructions.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">
                      {doc.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={doc.status === 'published' ? 'default' : 'secondary'}
                      >
                        {doc.status === 'published' ? 'Опубликовано' : 'Черновик'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(doc.updatedAt), 'd MMM yyyy', { locale: ru })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDoc(doc)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <CreatePlatformInstructionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editingDoc && (
        <EditPlatformInstructionDialog
          document={editingDoc}
          open={!!editingDoc}
          onOpenChange={(open) => !open && setEditingDoc(null)}
        />
      )}
    </div>
  );
}
