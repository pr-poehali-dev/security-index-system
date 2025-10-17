import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrganizationContractor, ContractorFacilityAccess } from '@/types';

interface ManageFacilitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: OrganizationContractor;
}

export default function ManageFacilitiesDialog({ open, onOpenChange, contractor }: ManageFacilitiesDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { 
    contractorFacilityAccesses, 
    getContractorFacilityAccessByContractor,
    addContractorFacilityAccess,
    updateContractorFacilityAccess,
    deleteContractorFacilityAccess
  } = useSettingsStore();
  const { facilities } = useFacilitiesStore();
  const { toast } = useToast();

  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set());
  const [accessType, setAccessType] = useState<'full' | 'limited' | 'temporary'>('full');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [permitDate, setPermitDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const tenantFacilities = user?.tenantId 
    ? facilities.filter(f => f.tenantId === user.tenantId) 
    : [];

  const contractorAccesses = getContractorFacilityAccessByContractor(contractor.id);
  const existingFacilityIds = new Set(contractorAccesses.map(a => a.facilityId));

  useEffect(() => {
    if (open) {
      setSelectedFacilities(new Set(contractorAccesses.filter(a => a.status === 'active').map(a => a.facilityId)));
    }
  }, [open, contractor.id]);

  const filteredFacilities = tenantFacilities.filter(facility =>
    facility.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFacility = (facilityId: string) => {
    const newSelected = new Set(selectedFacilities);
    if (newSelected.has(facilityId)) {
      newSelected.delete(facilityId);
    } else {
      newSelected.add(facilityId);
    }
    setSelectedFacilities(newSelected);
  };

  const handleSave = () => {
    if (!user?.tenantId) return;

    const currentFacilityIds = new Set(contractorAccesses.map(a => a.facilityId));
    
    selectedFacilities.forEach(facilityId => {
      const facility = tenantFacilities.find(f => f.id === facilityId);
      if (!facility) return;

      const existingAccess = contractorAccesses.find(a => a.facilityId === facilityId);
      
      if (existingAccess) {
        if (existingAccess.status !== 'active') {
          updateContractorFacilityAccess(existingAccess.id, {
            status: 'active',
            accessType,
            startDate,
            endDate: endDate || undefined,
            permitNumber: permitNumber || undefined,
            permitDate: permitDate || undefined,
          });
        }
      } else {
        addContractorFacilityAccess({
          tenantId: user.tenantId,
          contractorId: contractor.id,
          facilityId: facilityId,
          facilityName: facility.fullName,
          accessType,
          startDate,
          endDate: endDate || undefined,
          permitNumber: permitNumber || undefined,
          permitDate: permitDate || undefined,
          status: 'active',
        });
      }
    });

    contractorAccesses.forEach(access => {
      if (!selectedFacilities.has(access.facilityId) && access.status === 'active') {
        updateContractorFacilityAccess(access.id, { status: 'revoked' });
      }
    });

    toast({ 
      title: 'Доступ обновлен',
      description: `Подрядчик получил доступ к ${selectedFacilities.size} объектам`
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Управление объектами: {contractor.contractorName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Параметры доступа</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Тип доступа</Label>
                <Select value={accessType} onValueChange={(v: any) => setAccessType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Полный доступ</SelectItem>
                    <SelectItem value="limited">Ограниченный</SelectItem>
                    <SelectItem value="temporary">Временный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Дата начала</Label>
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Дата окончания</Label>
                <Input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Номер пропуска</Label>
                <Input 
                  placeholder="Опционально"
                  value={permitNumber}
                  onChange={(e) => setPermitNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base">Выбор объектов</Label>
              <Badge variant="secondary">
                Выбрано: {selectedFacilities.size} из {tenantFacilities.length}
              </Badge>
            </div>
            
            <Input
              placeholder="Поиск объектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {filteredFacilities.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {tenantFacilities.length === 0 ? 'Нет доступных объектов' : 'Объекты не найдены'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredFacilities.map((facility) => {
                    const isSelected = selectedFacilities.has(facility.id);
                    const hasExistingAccess = existingFacilityIds.has(facility.id);
                    
                    return (
                      <div 
                        key={facility.id} 
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => toggleFacility(facility.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleFacility(facility.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{facility.fullName}</span>
                              {hasExistingAccess && (
                                <Badge variant="outline" className="text-xs">
                                  <Icon name="CheckCircle" size={10} className="mr-1" />
                                  Был доступ
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {facility.registrationNumber && (
                                <div>Рег. №: {facility.registrationNumber}</div>
                              )}
                              <div>{facility.address}</div>
                            </div>
                          </div>
                          <Badge variant={facility.type === 'opo' ? 'default' : 'secondary'}>
                            {facility.type === 'opo' ? 'ОПО' : 'ГТС'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              Сохранить изменения
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
