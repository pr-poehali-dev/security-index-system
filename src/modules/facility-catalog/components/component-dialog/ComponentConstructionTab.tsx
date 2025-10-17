import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConstructionData } from '@/types/facilities';

const CONSTRUCTION_PARAMS = [
  { value: 'diameter', label: 'Основной диаметр', unit: 'мм' },
  { value: 'thickness', label: 'Основная толщина', unit: 'мм' },
  { value: 'length', label: 'Протяженность общая', unit: 'м' },
  { value: 'volume', label: 'Объем', unit: 'м³' },
  { value: 'material', label: 'Материал основной', unit: '' },
  { value: 'category', label: 'Категория оборудования', unit: '' },
  { value: 'corrosion_rate', label: 'Скорость коррозии', unit: 'мм/год' },
];

interface ComponentConstructionTabProps {
  data: ConstructionData[];
  onChange: (data: ConstructionData[]) => void;
}

export default function ComponentConstructionTab({ data, onChange }: ComponentConstructionTabProps) {
  const [newData, setNewData] = useState({ parameter: '', value: '', unit: '' });

  const handleAdd = () => {
    if (!newData.parameter || !newData.value) return;
    onChange([...data, { id: crypto.randomUUID(), ...newData }]);
    setNewData({ parameter: '', value: '', unit: '' });
  };

  const handleParamSelect = (value: string) => {
    const param = CONSTRUCTION_PARAMS.find(p => p.value === value);
    setNewData({ parameter: param?.label || '', value: '', unit: param?.unit || '' });
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить параметр конструкции</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Параметр *</Label>
            <Select onValueChange={handleParamSelect}>
              <SelectTrigger><SelectValue placeholder="Выберите параметр" /></SelectTrigger>
              <SelectContent>
                {CONSTRUCTION_PARAMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Значение *</Label>
            <Input value={newData.value} onChange={(e) => setNewData({...newData, value: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Единица</Label>
            <Input value={newData.unit} onChange={(e) => setNewData({...newData, unit: e.target.value})} />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={!newData.parameter || !newData.value} size="sm">
          <Icon name="Plus" size={14} className="mr-2" />Добавить
        </Button>
      </div>

      {data.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Параметр</TableHead>
                <TableHead>Значение</TableHead>
                <TableHead>Единица</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.parameter}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>{item.unit || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onChange(data.filter(d => d.id !== item.id))}>
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
