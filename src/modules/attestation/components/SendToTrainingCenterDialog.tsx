import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Order } from '@/stores/ordersStore';

interface SendToTrainingCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export default function SendToTrainingCenterDialog({ open, onOpenChange, order }: SendToTrainingCenterDialogProps) {
  const user = useAuthStore((state) => state.user);
  const allContractors = useSettingsStore((state) => state.contractors);
  const { sendOrderToTrainingCenter } = useOrdersStore();
  const { toast } = useToast();

  const [selectedContractor, setSelectedContractor] = useState<string>('');
  const [requestType, setRequestType] = useState<'full_training' | 'sdo_access_only'>('full_training');
  const [isLoading, setIsLoading] = useState(false);

  const trainingCenters = useMemo(() => 
    user?.tenantId 
      ? allContractors.filter(c => c.tenantId === user.tenantId && c.type === 'training_center' && c.status === 'active')
      : []
  , [allContractors, user?.tenantId]);

  const handleSubmit = () => {
    if (!order || !selectedContractor) {
      toast({
        title: 'Ошибка',
        description: 'Выберите учебный центр',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const requestId = sendOrderToTrainingCenter(order.id, selectedContractor, requestType);
      
      if (requestId) {
        toast({
          title: 'Заявка отправлена',
          description: `Заявка успешно отправлена в учебный центр (ID: ${requestId.slice(0, 8)})`,
        });
        onOpenChange(false);
        setSelectedContractor('');
        setRequestType('full_training');
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось отправить заявку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при отправке заявки',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedContractorData = trainingCenters.find(c => c.id === selectedContractor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Отправить заявку в учебный центр</DialogTitle>
          <DialogDescription>
            Приказ: {order?.number} от {order?.date ? new Date(order.date).toLocaleDateString('ru-RU') : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {trainingCenters.length === 0 ? (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Нет доступных учебных центров
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Добавьте учебные центры в разделе Настройки → Контрагенты
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <Label>Выберите учебный центр</Label>
                <RadioGroup value={selectedContractor} onValueChange={setSelectedContractor}>
                  {trainingCenters.map((contractor) => (
                    <div
                      key={contractor.id}
                      className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedContractor === contractor.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedContractor(contractor.id)}
                    >
                      <RadioGroupItem value={contractor.id} id={contractor.id} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={contractor.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {contractor.contractorName}
                          </label>
                          {contractor.contractorTenantId && (
                            <Badge variant="secondary" className="text-xs">
                              <Icon name="Link" size={12} className="mr-1" />
                              В системе
                            </Badge>
                          )}
                        </div>
                        {contractor.contractorInn && (
                          <p className="text-xs text-muted-foreground mt-1">ИНН: {contractor.contractorInn}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {contractor.services.map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service === 'full_training' && 'Полное обучение'}
                              {service === 'sdo_access_only' && 'Только СДО'}
                              {service === 'certification' && 'Аттестация'}
                              {service === 'consulting' && 'Консалтинг'}
                            </Badge>
                          ))}
                        </div>
                        {contractor.contractNumber && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Договор: {contractor.contractNumber}
                            {contractor.contractDate && ` от ${new Date(contractor.contractDate).toLocaleDateString('ru-RU')}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {selectedContractorData && (
                <div className="space-y-4">
                  <Label>Тип заявки</Label>
                  <RadioGroup value={requestType} onValueChange={(value: any) => setRequestType(value)}>
                    {selectedContractorData.services.includes('full_training') && (
                      <div
                        className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                          requestType === 'full_training'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setRequestType('full_training')}
                      >
                        <RadioGroupItem value="full_training" id="full_training" />
                        <div className="flex-1">
                          <label
                            htmlFor="full_training"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Полное обучение с выдачей удостоверений
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Учебный центр проведет обучение, экзамены и выдаст удостоверения о повышении квалификации
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedContractorData.services.includes('sdo_access_only') && (
                      <div
                        className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                          requestType === 'sdo_access_only'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setRequestType('sdo_access_only')}
                      >
                        <RadioGroupItem value="sdo_access_only" id="sdo_access_only" />
                        <div className="flex-1">
                          <label
                            htmlFor="sdo_access_only"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Доступ к СДО (без удостоверений)
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Учебный центр предоставит доступ к Интеллектуальной системе подготовки без выдачи удостоверений
                          </p>
                        </div>
                      </div>
                    )}
                  </RadioGroup>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Что произойдет:</p>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                      <li>Заявка будет автоматически отправлена в учебный центр</li>
                      <li>Персонал из приказа ({order?.employeeIds.length || 0} чел.) будет добавлен в заявку</li>
                      <li>После обработки учебный центр вернет документы</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedContractor || trainingCenters.length === 0 || isLoading}
            >
              {isLoading ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}