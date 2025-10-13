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
import { useCertificationStore } from '@/stores/certificationStore';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/utils/personnelUtils';
import { getCategoryForArea } from '@/stores/mockData/certificationAreas';
import MassActionDialog from '../orders/MassActionDialog';
import ComplianceStatisticsCards from '../compliance/ComplianceStatisticsCards';
import ComplianceFilters from '../compliance/ComplianceFilters';
import ComplianceSelectionBar from '../compliance/ComplianceSelectionBar';
import CompliancePersonnelCard from '../compliance/CompliancePersonnelCard';

interface ComplianceData {
  personnelId: string;
  personnelName: string;
  position: string;
  department: string;
  requiredCertifications: string[];
  actualCertifications: string[];
  expiringCertifications: string[];
  missingCertifications: string[];
  compliancePercent: number;
}

export default function ComplianceAnalysisTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { personnel, people, positions, departments, competencies } = useSettingsStore();
  const { certifications } = useCertificationStore();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<Set<string>>(new Set());
  const [showMassActionDialog, setShowMassActionDialog] = useState(false);
  const [massActionType, setMassActionType] = useState<string>('');

  const tenantPersonnel = useMemo(() => {
    return user?.tenantId 
      ? personnel.filter(p => p.tenantId === user.tenantId && p.personnelType === 'employee') 
      : [];
  }, [personnel, user?.tenantId]);

  const complianceData = useMemo(() => {
    return tenantPersonnel.map(p => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = departments.find(d => d.id === p.departmentId);
      
      const competency = competencies.find(c => c.positionId === p.positionId);
      const requiredAreas = competency?.requiredAreas?.flatMap(ra => ra.areas) || [];
      
      const personnelCerts = certifications.filter(c => c.personnelId === p.id);
      
      const validCerts = personnelCerts.filter(c => {
        const { status } = getCertificationStatus(c.expiryDate);
        return status === 'valid' || status === 'expiring_soon';
      });
      
      const actualAreas = validCerts.map(c => c.area);
      
      const expiringAreas = personnelCerts
        .filter(c => {
          const { status } = getCertificationStatus(c.expiryDate);
          return status === 'expiring_soon';
        })
        .map(c => c.area);
      
      const missingAreas = requiredAreas.filter(ra => !actualAreas.includes(ra));
      
      const validRequiredAreas = requiredAreas.filter(ra => 
        actualAreas.includes(ra) && !expiringAreas.includes(ra)
      );
      
      const compliancePercent = requiredAreas.length > 0 
        ? Math.round((validRequiredAreas.length / requiredAreas.length) * 100)
        : 0;

      return {
        personnelId: p.id,
        personnelName: info.fullName,
        position: info.position,
        department: dept?.name || '—',
        requiredCertifications: requiredAreas,
        actualCertifications: actualAreas,
        expiringCertifications: expiringAreas,
        missingCertifications: missingAreas,
        compliancePercent
      };
    });
  }, [tenantPersonnel, people, positions, departments, competencies, certifications]);

  const filteredData = complianceData.filter(item => {
    const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchesCompliance = complianceFilter === 'all' ||
      (complianceFilter === 'full' && item.compliancePercent === 100) ||
      (complianceFilter === 'partial' && item.compliancePercent > 0 && item.compliancePercent < 100) ||
      (complianceFilter === 'none' && item.compliancePercent === 0);
    return matchesDepartment && matchesCompliance;
  });

  const stats = useMemo(() => ({
    totalEmployees: complianceData.length,
    fullCompliance: complianceData.filter(d => d.compliancePercent === 100).length,
    partialCompliance: complianceData.filter(d => d.compliancePercent > 0 && d.compliancePercent < 100).length,
    nonCompliant: complianceData.filter(d => d.compliancePercent === 0).length,
    avgCompliance: complianceData.length > 0 
      ? Math.round(complianceData.reduce((acc, d) => acc + d.compliancePercent, 0) / complianceData.length)
      : 0
  }), [complianceData]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(complianceData.map(d => d.department))).filter(d => d !== '—');
  }, [complianceData]);

  const handleSelectPersonnel = (personnelId: string, checked: boolean) => {
    const newSelected = new Set(selectedPersonnelIds);
    if (checked) {
      newSelected.add(personnelId);
    } else {
      newSelected.delete(personnelId);
    }
    setSelectedPersonnelIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPersonnelIds(new Set(filteredData.map(item => item.personnelId)));
    } else {
      setSelectedPersonnelIds(new Set());
    }
  };

  const handleCreateOrder = (type: string) => {
    setMassActionType(type);
    setShowMassActionDialog(true);
  };

  const handleToast = (title: string, description: string) => {
    toast({ title, description });
  };

  const selectedEmployees = useMemo(() => {
    return filteredData
      .filter(item => selectedPersonnelIds.has(item.personnelId))
      .map(item => ({
        id: item.personnelId,
        name: item.personnelName,
        position: item.position,
        department: item.department,
        organization: '—',
        certifications: item.missingCertifications.map(area => ({
          id: `missing-${area}`,
          category: getCategoryForArea(area),
          area: area,
          issueDate: '',
          expiryDate: new Date(Date.now() - 86400000).toISOString(),
          protocolNumber: '',
          protocolDate: '',
          verified: false,
          verifiedDate: undefined,
          status: 'expired' as const,
          daysLeft: -1
        }))
      }));
  }, [filteredData, selectedPersonnelIds]);

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
            onClearSelection={() => setSelectedPersonnelIds(new Set())}
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