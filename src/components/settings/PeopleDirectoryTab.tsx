import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PersonDialog from './PersonDialog';
import type { Person } from '@/types';
import { getFullName } from '@/lib/personnelUtils';

export default function PeopleDirectoryTab() {
  const { people, addPerson, updatePerson, deletePerson } = useSettingsStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();

  const handleAdd = () => {
    setEditingPerson(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setDialogOpen(true);
  };

  const handleSave = (personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPerson) {
      updatePerson(editingPerson.id, personData);
    } else {
      addPerson(personData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этого человека из справочника?')) {
      deletePerson(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Справочник людей</h2>
          <p className="text-sm text-muted-foreground">
            Управление базой данных сотрудников и контрагентов
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Нет данных. Добавьте первого человека.
                </TableCell>
              </TableRow>
            ) : (
              people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{getFullName(person)}</TableCell>
                  <TableCell>{person.email || '—'}</TableCell>
                  <TableCell>{person.phone || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(person)}
                      >
                        <Icon name="Pencil" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(person.id)}
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PersonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        person={editingPerson}
        onSave={handleSave}
      />
    </div>
  );
}
