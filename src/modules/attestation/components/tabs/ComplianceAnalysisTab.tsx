import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setLoadingProgress(0);

    const steps = [
      { progress: 20, delay: 50 },
      { progress: 40, delay: 100 },
      { progress: 60, delay: 150 },
      { progress: 80, delay: 200 },
      { progress: 100, delay: 250 }
    ];

    const timers = steps.map(({ progress, delay }) =>
      setTimeout(() => setLoadingProgress(progress), delay)
    );

    const finalTimer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, [personnel, people, positions, departments, competencies, attestations]);

  const tenantPersonnel = useMemo(() => {
    if (!Array.isArray(personnel) || !user?.tenantId) {
      return [];
    }
    return personnel.filter(p => p.tenantId === user.tenantId && p.personnelType === 'employee');
  }, [personnel, user?.tenantId]);

  const { complianceData, stats, uniqueDepartments } = useComplianceCalculations({
    personnel: tenantPersonnel,
    people: people || [],
    positions: positions || [],
    departments: departments || [],
    competencies: competencies || [],
    certifications: attestations || []
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

  if (!user?.tenantId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">Данные недоступны. Пожалуйста, войдите в систему.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Icon name="BarChart3" size={24} className="text-primary" />
                  <p className="font-medium text-lg">Обработка данных</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Анализируем соответствие требованиям
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Прогресс анализа</span>
                  <span className="font-medium tabular-nums">{loadingProgress}%</span>
                </div>
                <Progress value={loadingProgress} className="h-2" />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span>Обработано {loadingProgress === 100 ? 'всех' : Math.floor(loadingProgress / 20)} из 5 этапов</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ComplianceStatisticsCards stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Анализ соответствия требованиям</CardTitle>
            <div className="flex items-center gap-2">
              {selectedPersonnelIds.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Icon name="Send" size={18} />
                        Создать заявку ({selectedPersonnelIds.size})
                        <Icon name="ChevronDown" size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px]">
                      <DropdownMenuItem onClick={() => handleCreateOrder('sdo')}>
                        <Icon name="Monitor" size={16} className="mr-2" />
                        На обучение в СДО
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateOrder('training_center')}>
                        <Icon name="School" size={16} className="mr-2" />
                        В учебный центр
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" className="gap-2">
                        <Icon name="FileText" size={18} />
                        Сформировать приказ ({selectedPersonnelIds.size})
                        <Icon name="ChevronDown" size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px]">
                      <DropdownMenuItem onClick={() => handleCreateOrder('internal_attestation')}>
                        <Icon name="ClipboardCheck" size={16} className="mr-2" />
                        На аттестацию в ЕПТ
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateOrder('rostechnadzor')}>
                        <Icon name="Building2" size={16} className="mr-2" />
                        В Ростехнадзор
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              <Button variant="outline" className="gap-2">
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