import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TechnicalParameter } from '@/types/facilities';

const TECHNICAL_PARAMS = [
  { value: 'power', label: 'Мощность', unit: 'кВт' },
  { value: 'capacity', label: 'Производительность (плановая)', unit: 'м³/час' },
  { value: 'pressure_allowed', label: 'Давление разрешенное', unit: 'кгс/см²' },
  { value: 'pressure_working', label: 'Давление рабочее', unit: 'кгс/см²' },
  { value: 'temperature_max', label: 'Температура (макс)', unit: '°C' },
  { value: 'working_medium', label: 'Рабочая среда', unit: '' },
];

interface ComponentTechnicalParamsTabProps {
  params: TechnicalParameter[];
  onChange: (params: TechnicalParameter[]) => void;
}

export default function ComponentTechnicalParamsTab({ params, onChange }: ComponentTechnicalParamsTabProps) {
  const [newParam, setNewParam] = useState({ parameter: '', value: '', unit: '' });

  const handleAdd = () => {
    if (!newParam.parameter || !newParam.value) return;
    onChange([...params, { id: crypto.randomUUID(), ...newParam }]);
    setNewParam({ parameter: '', value: '', unit: '' });
  };

  const handleParamSelect = (value: string) => {
    const param = TECHNICAL_PARAMS.find(p => p.value === value);
    setNewParam({ parameter: param?.label || '', value: '', unit: param?.unit || '' });
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Добавить технический параметр</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Параметр *</Label>
            <Select onValueChange={handleParamSelect}>
              <SelectTrigger><SelectValue placeholder="Выберите параметр" /></SelectTrigger>
              <SelectContent>
                {TECHNICAL_PARAMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Значение *</Label>
            <Input value={newParam.value} onChange={(e) => setNewParam({...newParam, value: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Единица</Label>
            <Input value={newParam.unit} onChange={(e) => setNewParam({...newParam, unit: e.target.value})} />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={!newParam.parameter || !newParam.value} size="sm">
          <Icon name="Plus" size={14} className="mr-2" />Добавить
        </Button>
      </div>

      {params.length > 0 && (
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
              {params.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.parameter}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>{item.unit || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => onChange(params.filter(p => p.id !== item.id))}>
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
