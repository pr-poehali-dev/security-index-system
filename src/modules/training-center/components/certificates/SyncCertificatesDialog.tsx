import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useTrainingCenterStore, type IssuedCertificate } from '@/stores/trainingCenterStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useToast } from '@/hooks/use-toast';

interface SyncCertificatesDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCertificates: IssuedCertificate[];
  trainingCenterName: string;
}

export default function SyncCertificatesDialog({
  open,
  onClose,
  selectedCertificates,
  trainingCenterName
}: SyncCertificatesDialogProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { syncCertificatesToOrganization } = useTrainingCenterStore();
  const { addTrainingCompletionNotification } = useNotificationsStore();
  const { toast } = useToast();

  const groupedByTenant = selectedCertificates.reduce((acc, cert) => {
    const tenantId = cert.clientTenantId;
    if (!acc[tenantId]) {
      acc[tenantId] = {
        tenantName: cert.organizationName || 'Неизвестная организация',
        certificates: []
      };
    }
    acc[tenantId].certificates.push(cert);
    return acc;
  }, {} as Record<string, { tenantName: string; certificates: IssuedCertificate[] }>);

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      for (const [tenantId, data] of Object.entries(groupedByTenant)) {
        const certIds = data.certificates.map(c => c.id);
        
        syncCertificatesToOrganization(certIds, tenantId);
        
        addTrainingCompletionNotification(
          tenantId,
          trainingCenterName,
          data.certificates.length,
          certIds
        );
      }

      toast({
        title: 'Удостоверения синхронизированы',
        description: `Успешно синхронизировано ${selectedCertificates.length} удостоверений с организациями`,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Ошибка синхронизации',
        description: 'Не удалось синхронизировать удостоверения',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="RefreshCw" size={24} />
            Синхронизация удостоверений
          </DialogTitle>
          <DialogDescription>
            Удостоверения будут автоматически переданы в систему организаций-заказчиков
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Что произойдёт при синхронизации:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Удостоверения автоматически появятся в модуле "Аттестация" организаций</li>
                  <li>Файлы документов будут прикреплены к персоналу</li>
                  <li>Организации получат уведомление о завершении подготовки</li>
                  <li>Статус удостоверений изменится на "Синхронизировано"</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Удостоверения для синхронизации:</h4>
            
            {Object.entries(groupedByTenant).map(([tenantId, data]) => (
              <div key={tenantId} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Building2" size={18} className="text-muted-foreground" />
                    <span className="font-medium">{data.tenantName}</span>
                  </div>
                  <Badge variant="secondary">
                    {data.certificates.length} {data.certificates.length === 1 ? 'удостоверение' : 'удостоверений'}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  {data.certificates.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="flex items-center gap-2">
                      <Icon name="Award" size={14} />
                      <span>{cert.personnelName} — {cert.certificateNumber}</span>
                    </div>
                  ))}
                  {data.certificates.length > 3 && (
                    <div className="text-xs italic">
                      + ещё {data.certificates.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-3 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={18} className="text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Синхронизацию невозможно отменить. Убедитесь, что выбраны правильные удостоверения.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSyncing}>
            Отмена
          </Button>
          <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
            {isSyncing ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <Icon name="RefreshCw" size={18} />
                Синхронизировать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
