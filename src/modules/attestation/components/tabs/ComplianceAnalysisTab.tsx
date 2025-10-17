import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAttestationStore } from '@/stores/certificationStore';
import { useComplianceCalculations } from '../../hooks/useComplianceCalculations';
import { useComplianceSelection } from '../../hooks/useComplianceSelection';
import MassActionDialog from '../orders/MassActionDialog';
import ComplianceStatisticsCards from '../compliance/ComplianceStatisticsCards';
import ComplianceFilters from '../compliance/ComplianceFilters';
import ComplianceSelectionBar from '../compliance/ComplianceSelectionBar';
import CompliancePersonnelCard from '../compliance/CompliancePersonnelCard';

export default function ComplianceAnalysisTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { personnel, people, positions, departments, competencies } = useSettingsStore();
  const { attestations } = useAttestationStore();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [showMassActionDialog, setShowMassActionDialog] = useState(false);
  const [massActionType, setMassActionType] = useState<string>('');

  const tenantPersonnel = useMemo(() => {
    return user?.tenantId 
      ? personnel.filter(p => p.tenantId === user.tenantId && p.personnelType === 'employee') 
      : [];
  }, [personnel, user?.tenantId]);

  const { complianceData, stats, uniqueDepartments } = useComplianceCalculations({
    personnel: tenantPersonnel,
    people,
    positions,
    departments,
    competencies,
    certifications: attestations
  });

  const filteredData = complianceData.filter(item => {
    const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchesCompliance = complianceFilter === 'all' ||
      (complianceFilter === 'full' && item.compliancePercent === 100) ||
      (complianceFilter === 'partial' && item.compliancePercent > 0 && item.compliancePercent < 100) ||
      (complianceFilter === 'none' && item.compliancePercent === 0);
    return matchesDepartment && matchesCompliance;
  });

  const {
    selectedPersonnelIds,
    handleSelectPersonnel,
    handleSelectAll,
    clearSelection,
    selectedEmployees
  } = useComplianceSelection(filteredData);

  const handleCreateOrder = (type: string) => {
    setMassActionType(type);
    setShowMassActionDialog(true);
  };

  const handleToast = (title: string, description: string) => {
    toast({ title, description });
  };

  return (
    <div className="space-y-6">
      <ComplianceStatisticsCards stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Анализ соответствия требованиям</CardTitle>
            <div className="flex items-center gap-2">
              {selectedPersonnelIds.size > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" className="gap-2">
                      <Icon name="FileText" size={18} />
                      Сформировать приказ ({selectedPersonnelIds.size})
                      <Icon name="ChevronDown" size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[320px]">
                    <DropdownMenuItem onClick={() => handleCreateOrder('sdo')}>
                      <Icon name="Monitor" size={16} className="mr-2" />
                      О подготовке в СДО Интеллектуальная система
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreateOrder('training_center')}>
                      <Icon name="School" size={16} className="mr-2" />
                      О подготовке в учебный центр
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreateOrder('internal_attestation')}>
                      <Icon name="ClipboardCheck" size={16} className="mr-2" />
                      О аттестации в ЕПТ организации
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreateOrder('rostechnadzor')}>
                      <Icon name="Building2" size={16} className="mr-2" />
                      О направлении на аттестацию в Ростехнадзор
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button className="gap-2">
                <Icon name="Download" size={16} />
                Экспорт отчета
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ComplianceFilters
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            complianceFilter={complianceFilter}
            setComplianceFilter={setComplianceFilter}
            uniqueDepartments={uniqueDepartments}
          />

          <ComplianceSelectionBar
            selectedCount={selectedPersonnelIds.size}
            totalCount={filteredData.length}
            isAllSelected={selectedPersonnelIds.size === filteredData.length && filteredData.length > 0}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
          />

          <div className="space-y-4">
            {filteredData.map((item, idx) => (
              <CompliancePersonnelCard
                key={idx}
                item={item}
                isSelected={selectedPersonnelIds.has(item.personnelId)}
                onSelect={handleSelectPersonnel}
                onToast={handleToast}
              />
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Данные не найдены
            </div>
          )}
        </CardContent>
      </Card>

      <MassActionDialog
        open={showMassActionDialog}
        onOpenChange={setShowMassActionDialog}
        actionType={massActionType}
        employees={selectedEmployees}
      />
    </div>
  );
}