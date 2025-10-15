import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OpoCharacteristic } from './types';
import { objectTypeLabels } from './types';

interface OpoDataTableProps {
  data: OpoCharacteristic[];
  onEdit: (objectId: string) => void;
  onGenerate: (objectId: string) => void;
}

export default function OpoDataTable({ data, onEdit, onGenerate }: OpoDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Организация</TableHead>
            <TableHead className="w-[120px]">Тип объекта</TableHead>
            <TableHead>Наименование объекта</TableHead>
            <TableHead className="w-[150px]">Рег. номер</TableHead>
            <TableHead className="w-[180px]">Статус</TableHead>
            <TableHead className="w-[100px] text-center">Полнота</TableHead>
            <TableHead className="w-[180px] text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Нет данных для отображения
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.objectId}>
                <TableCell className="font-medium text-sm">{item.organizationName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{objectTypeLabels[item.objectType]}</Badge>
                </TableCell>
                <TableCell className="font-medium">{item.objectName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.registrationNumber}
                </TableCell>
                <TableCell>
                  {item.dataStatus === 'sufficient' ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <Icon name="CheckCircle" size={14} className="mr-1" />
                      Данных достаточно
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                        <Icon name="AlertCircle" size={14} className="mr-1" />
                        Данных недостаточно
                      </Badge>
                      {item.missingFields.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Не хватает: {item.missingFields.slice(0, 2).join(', ')}
                          {item.missingFields.length > 2 && ` +${item.missingFields.length - 2}`}
                        </p>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium">{item.completeness}%</span>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.completeness >= 80
                            ? 'bg-green-500'
                            : item.completeness >= 50
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${item.completeness}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item.objectId)}
                    >
                      <Icon name="Edit" size={14} />
                      Редактировать
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onGenerate(item.objectId)}
                      disabled={item.dataStatus === 'insufficient'}
                    >
                      <Icon name="FileDown" size={14} />
                      Сформировать
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
