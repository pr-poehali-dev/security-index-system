import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Certification {
  id: string;
  employeeName: string;
  employeePosition: string;
  department: string;
  category: string;
  area: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
}

interface DayCertificationsDialogProps {
  selectedDay: Date | null;
  certifications: Certification[];
  open: boolean;
  onClose: () => void;
}

export default function DayCertificationsDialog({
  selectedDay,
  certifications,
  open,
  onClose
}: DayCertificationsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Аттестации на {selectedDay?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </DialogTitle>
          <DialogDescription>
            Всего аттестаций: {certifications.length}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {certifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет аттестаций на эту дату</p>
            </div>
          ) : (
            certifications.map(cert => (
              <div
                key={cert.id}
                className={`p-4 rounded-lg border ${
                  cert.status === 'expired'
                    ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                    : cert.status === 'expiring_soon'
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                    : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-medium">{cert.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{cert.employeePosition}</p>
                  </div>
                  <Badge
                    variant={
                      cert.status === 'expired'
                        ? 'destructive'
                        : cert.status === 'expiring_soon'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {cert.status === 'expired' ? 'Просрочен' : cert.status === 'expiring_soon' ? 'Истекает' : 'Действует'}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Building2" size={14} />
                    {cert.department}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Tag" size={14} />
                    {cert.category}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Award" size={14} />
                    {cert.area}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
