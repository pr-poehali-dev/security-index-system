import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { Employee } from '../../utils/employeeUtils';
import { getStatusColor, getStatusLabel, getStatusIcon } from '../../utils/employeeUtils';

interface EmployeeDetailsDialogProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onVerificationToggle: (certId: string) => void;
  onShowExportDialog: () => void;
  onShowAddCertDialog: () => void;
}

export default function EmployeeDetailsDialog({
  employee,
  open,
  onClose,
  onVerificationToggle,
  onShowExportDialog,
  onShowAddCertDialog
}: EmployeeDetailsDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Аттестации сотрудника</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="pb-4 border-b">
            <h3 className="font-semibold text-lg">{employee.name}</h3>
            <p className="text-sm text-muted-foreground mb-1">
              <Icon name="Building2" size={14} className="inline mr-1" />
              {employee.organization}
            </p>
            <p className="text-sm text-muted-foreground">
              {employee.position} • {employee.department}
            </p>
          </div>

          <div className="space-y-3">
            {employee.certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold">{cert.category}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                          <Icon name={getStatusIcon(cert.status) as any} size={12} className="inline mr-1" />
                          {getStatusLabel(cert.status)}
                        </span>
                        {cert.verified && cert.protocolNumber && (cert.category === 'Промышленная безопасность' || cert.category === 'Энергобезопасность') && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Icon name="CheckCircle2" size={12} className="inline mr-1" />
                            Проверено
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{cert.area}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Дата аттестации:</p>
                          <p className="font-medium">{new Date(cert.issueDate).toLocaleDateString('ru')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Действителен до:</p>
                          <p className={`font-medium ${
                            cert.status === 'valid' ? 'text-emerald-600' :
                            cert.status === 'expiring_soon' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {new Date(cert.expiryDate).toLocaleDateString('ru')}
                          </p>
                        </div>
                        {cert.protocolNumber && (
                          <>
                            <div>
                              <p className="text-muted-foreground">Номер протокола:</p>
                              <p className="font-medium">{cert.protocolNumber}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Дата протокола:</p>
                              <p className="font-medium">{cert.protocolDate ? new Date(cert.protocolDate).toLocaleDateString('ru') : '—'}</p>
                            </div>
                          </>
                        )}
                      </div>
                      {cert.daysLeft > 0 ? (
                        <p className="text-sm text-muted-foreground mt-2">
                          Осталось: {cert.daysLeft} дней
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 font-medium mt-2">
                          Просрочено на {Math.abs(cert.daysLeft)} дней
                        </p>
                      )}
                      
                      {cert.protocolNumber && (cert.category === 'Промышленная безопасность' || cert.category === 'Энергобезопасность') && (
                        <div className="space-y-3 mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                navigator.clipboard.writeText(cert.protocolNumber || '');
                                alert('Номер протокола скопирован');
                              }}
                            >
                              <Icon name="Copy" size={14} />
                              Скопировать номер протокола
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-2"
                              onClick={() => window.open('https://qr.gosnadzor.ru/prombez', '_blank')}
                            >
                              <Icon name="ExternalLink" size={14} />
                              Проверить в Ростехнадзоре
                            </Button>
                          </div>
                          
                          <div className={`flex items-center justify-between p-3 rounded-lg ${
                            cert.verified 
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900' 
                              : 'bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900'
                          }`}>
                            <div className="flex items-center gap-3">
                              <Icon 
                                name={cert.verified ? "CheckCircle2" : "AlertCircle"} 
                                size={20} 
                                className={cert.verified ? "text-emerald-600" : "text-slate-400"}
                              />
                              <div>
                                <Label htmlFor={`verify-${cert.id}`} className="text-sm font-medium cursor-pointer">
                                  {cert.verified ? 'Проверено в реестре Ростехнадзора' : 'Не проверено в реестре'}
                                </Label>
                                {cert.verified && cert.verifiedDate && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Проверено: {new Date(cert.verifiedDate).toLocaleDateString('ru')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Switch 
                              id={`verify-${cert.id}`}
                              checked={cert.verified || false}
                              onCheckedChange={() => onVerificationToggle(cert.id)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="FileText" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-4 border-t flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={onShowExportDialog}
            >
              <Icon name="Download" size={16} />
              Экспорт отчёта
            </Button>
            <Button 
              className="gap-2"
              onClick={onShowAddCertDialog}
            >
              <Icon name="Plus" size={16} />
              Добавить аттестацию
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}