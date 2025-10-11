import { useState, useEffect } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { useUsersStore } from '@/stores/usersStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface ScheduleAuditDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ScheduleAuditDialog({ open, onClose }: ScheduleAuditDialogProps) {
  const { checklists, scheduleAudit } = useChecklistsStore();
  const { organizations } = useOrganizationsStore();
  const { users } = useUsersStore();
  
  const [checklistId, setChecklistId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [auditorId, setAuditorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    if (open) {
      setChecklistId('');
      setOrganizationId('');
      setAuditorId('');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [open]);

  const auditors = users;

  const handleSchedule = () => {
    if (!checklistId || !organizationId || !auditorId || !scheduledDate) {
      return;
    }

    scheduleAudit({
      tenantId: 'tenant-1',
      checklistId,
      organizationId,
      auditorId,
      scheduledDate,
      status: 'scheduled'
    });

    onClose();
  };

  const selectedChecklist = checklists.find(c => c.id === checklistId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Назначить аудит</DialogTitle>
          <DialogDescription>
            Запланируйте проведение проверки по чек-листу
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="checklist">Чек-лист</Label>
            <Select value={checklistId} onValueChange={setChecklistId}>
              <SelectTrigger id="checklist">
                <SelectValue placeholder="Выберите чек-лист" />
              </SelectTrigger>
              <SelectContent>
                {checklists.map(checklist => (
                  <SelectItem key={checklist.id} value={checklist.id}>
                    {checklist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChecklist && (
              <p className="text-xs text-gray-600">
                {selectedChecklist.items.length} вопросов • {selectedChecklist.items.filter(i => i.criticalItem).length} критичных
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Объект проверки</Label>
            <Select value={organizationId} onValueChange={setOrganizationId}>
              <SelectTrigger id="organization">
                <SelectValue placeholder="Выберите объект" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditor">Аудитор</Label>
            <Select value={auditorId} onValueChange={setAuditorId}>
              <SelectTrigger id="auditor">
                <SelectValue placeholder="Выберите аудитора" />
              </SelectTrigger>
              <SelectContent>
                {auditors.map(auditor => (
                  <SelectItem key={auditor.id} value={auditor.id}>
                    {auditor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Дата проведения</Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSchedule}
            disabled={!checklistId || !organizationId || !auditorId || !scheduledDate}
            className="gap-2"
          >
            <Icon name="Calendar" size={16} />
            Назначить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}