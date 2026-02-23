import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingRequestsStore } from '@/stores/trainingRequestsStore';
import { useTrainingCentersStore } from '@/stores/trainingCentersStore';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface SelectedEmployee {
  personnelId: string;
  personnelName: string;
  position: string;
  department: string;
  organizationName: string;
  productionSiteName: string;
  missingCertifications: string[];
  expiringCertifications: string[];
}

interface CreateGroupRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'sdo' | 'training_center';
  selectedEmployees: SelectedEmployee[];
}

export default function CreateGroupRequestDialog({
  open,
  onOpenChange,
  type,
  selectedEmployees,
}: CreateGroupRequestDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addRequest } = useTrainingRequestsStore();
  const { getActiveConnections } = useTrainingCentersStore();
  const { toast } = useToast();

  const activeConnections = user?.tenantId
    ? getActiveConnections(user.tenantId)
    : [];

  const [trainingCenterTenantId, setTrainingCenterTenantId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(selectedEmployees.map(e => e.personnelId)));

  const defaultGroupName = useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const firstEmp = selectedEmployees[0];
    const orgPart = firstEmp?.organizationName || 'ORG';
    const sitePart = firstEmp?.productionSiteName || 'SITE';
    const deptPart = firstEmp?.department || 'DEPT';
    return `${orgPart}_${sitePart}_${deptPart}_${mm}.${yyyy}_1`;
  }, [selectedEmployees]);

  const [groupName, setGroupName] = useState(defaultGroupName);

  useMemo(() => {
    setCheckedIds(new Set(selectedEmployees.map(e => e.personnelId)));
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const firstEmp = selectedEmployees[0];
    const orgPart = firstEmp?.organizationName || 'ORG';
    const sitePart = firstEmp?.productionSiteName || 'SITE';
    const deptPart = firstEmp?.department || 'DEPT';
    setGroupName(`${orgPart}_${sitePart}_${deptPart}_${mm}.${yyyy}_1`);
  }, [selectedEmployees]);

  const handleToggleEmployee = (personnelId: string) => {
    const next = new Set(checkedIds);
    if (next.has(personnelId)) {
      next.delete(personnelId);
    } else {
      next.add(personnelId);
    }
    setCheckedIds(next);
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setCheckedIds(new Set(selectedEmployees.map(e => e.personnelId)));
    } else {
      setCheckedIds(new Set());
    }
  };

  const isAllSelected = checkedIds.size === selectedEmployees.length && selectedEmployees.length > 0;

  const handleSubmit = () => {
    if (checkedIds.size === 0) {
      toast({ title: 'Ошибка', description: 'Выберите хотя бы одного сотрудника', variant: 'destructive' });
      return;
    }

    if (type === 'training_center' && !trainingCenterTenantId) {
      toast({ title: 'Ошибка', description: 'Выберите учебный центр', variant: 'destructive' });
      return;
    }

    const trainingCenter = activeConnections.find(c => c.trainingCenterTenantId === trainingCenterTenantId);
    const targetName = type === 'sdo' ? 'Собственное СДО ИСП' : trainingCenter?.trainingCenterName || '';
    let totalRequests = 0;

    selectedEmployees
      .filter(emp => checkedIds.has(emp.personnelId))
      .forEach(emp => {
        const allAreas = [...new Set([...emp.missingCertifications, ...emp.expiringCertifications])];
        allAreas.forEach(area => {
          addRequest({
            tenantId: user?.tenantId || '',
            employeeId: emp.personnelId,
            employeeName: emp.personnelName,
            position: emp.position,
            organizationName: emp.organizationName,
            programName: area,
            reason: 'mandatory',
            priority,
            requestDate: new Date().toISOString(),
            status: 'pending',
            autoCreated: false,
            notes: `Группа: ${groupName}\nНаправление: ${targetName}`,
            trainingCenterTenantId: type === 'training_center' ? trainingCenterTenantId : undefined,
          });
          totalRequests++;
        });
      });

    toast({
      title: 'Групповая заявка создана',
      description: `Создано ${totalRequests} заявок для ${checkedIds.size} сотрудников (группа: ${groupName})`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'training_center'
              ? 'Создать заявку на обучение в учебный центр'
              : 'Создать заявку на тренинг в СДО'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {type === 'training_center' ? (
                <>
                  <Label>Учебный центр *</Label>
                  <Select value={trainingCenterTenantId} onValueChange={setTrainingCenterTenantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите учебный центр" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeConnections.map(conn => (
                        <SelectItem key={conn.id} value={conn.trainingCenterTenantId}>
                          {conn.trainingCenterName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {activeConnections.length === 0 && (
                    <p className="text-xs text-muted-foreground">Нет активных подключений к УЦ</p>
                  )}
                </>
              ) : (
                <>
                  <Label>Система обучения</Label>
                  <Input value="Собственное СДО ИСП" readOnly className="bg-muted" />
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Приоритет *</Label>
              <Select value={priority} onValueChange={(v: string) => setPriority(v as 'low' | 'medium' | 'high' | 'critical')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Название группы</Label>
            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Сотрудники ({checkedIds.size} из {selectedEmployees.length})
              </Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleToggleAll(checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">
                  {isAllSelected ? 'Снять выделение' : 'Выбрать всех'}
                </span>
              </div>
            </div>

            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Организация</TableHead>
                    <TableHead>Производственная площадка</TableHead>
                    <TableHead>Подразделение</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Области аттестации</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployees.map(emp => {
                    const allAreas = [...new Set([...emp.missingCertifications, ...emp.expiringCertifications])];
                    const isChecked = checkedIds.has(emp.personnelId);
                    return (
                      <TableRow key={emp.personnelId} className={isChecked ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleEmployee(emp.personnelId)}
                          />
                        </TableCell>
                        <TableCell className="text-sm">{emp.organizationName}</TableCell>
                        <TableCell className="text-sm">{emp.productionSiteName}</TableCell>
                        <TableCell className="text-sm">{emp.department}</TableCell>
                        <TableCell className="text-sm">{emp.position}</TableCell>
                        <TableCell className="text-sm font-medium">{emp.personnelName}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {emp.missingCertifications.map(area => (
                              <Badge key={`m-${area}`} variant="destructive" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {emp.expiringCertifications.map(area => (
                              <Badge key={`e-${area}`} variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {selectedEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Нет выбранных сотрудников
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={checkedIds.size === 0} className="gap-2">
            <Icon name="Send" size={16} />
            Создать заявку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
