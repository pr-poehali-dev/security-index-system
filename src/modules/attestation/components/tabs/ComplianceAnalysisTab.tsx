import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      const requiredAreas = competency?.requiredAreas.flatMap(ra => ra.areas) || [];
      
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Users" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{stats.totalEmployees}</span>
            </div>
            <p className="text-sm text-muted-foreground">Всего сотрудников</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{stats.fullCompliance}</span>
            </div>
            <p className="text-sm text-muted-foreground">Полное соответствие</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">{stats.partialCompliance}</span>
            </div>
            <p className="text-sm text-muted-foreground">Частичное соответствие</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Target" className="text-purple-600" size={24} />
              <span className="text-2xl font-bold">{stats.avgCompliance}%</span>
            </div>
            <p className="text-sm text-muted-foreground">Средний уровень</p>
          </CardContent>
        </Card>
      </div>

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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Подразделение" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все подразделения</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Уровень соответствия" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="full">Полное соответствие</SelectItem>
                <SelectItem value="partial">Частичное</SelectItem>
                <SelectItem value="none">Не соответствует</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPersonnelIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPersonnelIds.size === filteredData.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    Выбрано сотрудников: {selectedPersonnelIds.size}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (будут добавлены только недостающие области аттестации)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPersonnelIds(new Set())}
                  className="gap-2"
                >
                  <Icon name="X" size={14} />
                  Отменить выбор
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredData.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Checkbox
                      checked={selectedPersonnelIds.has(item.personnelId)}
                      onCheckedChange={(checked) => handleSelectPersonnel(item.personnelId, checked as boolean)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <h3 className="font-semibold">{item.personnelName}</h3>
                      <p className="text-sm text-muted-foreground">{item.position} • {item.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl font-bold ${
                        item.compliancePercent === 100 ? 'text-emerald-600' :
                        item.compliancePercent >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {item.compliancePercent}%
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.compliancePercent === 100 ? 'bg-emerald-600' :
                        item.compliancePercent >= 50 ? 'bg-amber-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${item.compliancePercent}%` }}
                    />
                  </div>

                  <div className="space-y-4">
                    {item.requiredCertifications.length > 0 ? (
                      <>
                        <div>
                          <p className="font-medium mb-3 flex items-center gap-2">
                            <Icon name="ClipboardCheck" size={16} className="text-muted-foreground" />
                            Требуемые области аттестации ({item.requiredCertifications.length})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.requiredCertifications.map((cert, i) => {
                              const hasValidCert = item.actualCertifications.includes(cert);
                              const isExpiring = item.expiringCertifications.includes(cert);
                              
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                                    hasValidCert && !isExpiring
                                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
                                      : isExpiring
                                      ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
                                      : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                                  }`}
                                >
                                  {hasValidCert && !isExpiring ? (
                                    <Icon name="CheckCircle2" size={16} className="text-emerald-600 flex-shrink-0" />
                                  ) : isExpiring ? (
                                    <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0" />
                                  ) : (
                                    <Icon name="XCircle" size={16} className="text-red-600 flex-shrink-0" />
                                  )}
                                  <span className={`text-sm flex-1 ${
                                    hasValidCert && !isExpiring
                                      ? 'text-emerald-900 dark:text-emerald-100 font-medium'
                                      : isExpiring
                                      ? 'text-amber-900 dark:text-amber-100 font-medium'
                                      : 'text-red-900 dark:text-red-100 font-medium'
                                  }`}>
                                    {cert}
                                  </span>
                                  {isExpiring && (
                                    <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                                      Истекает
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle2" size={14} className="text-emerald-600" />
                            <span className="text-muted-foreground">
                              Действительные: <span className="font-medium text-emerald-600">
                                {item.actualCertifications.filter(a => !item.expiringCertifications.includes(a)).length}
                              </span>
                            </span>
                          </div>
                          {item.expiringCertifications.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Icon name="AlertTriangle" size={14} className="text-amber-600" />
                              <span className="text-muted-foreground">
                                Истекает: <span className="font-medium text-amber-600">{item.expiringCertifications.length}</span>
                              </span>
                            </div>
                          )}
                          {item.missingCertifications.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Icon name="XCircle" size={14} className="text-red-600" />
                              <span className="text-muted-foreground">
                                Отсутствует: <span className="font-medium text-red-600">{item.missingCertifications.length}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm bg-muted/50 rounded-md">
                        Для должности "{item.position}" не определены требуемые области аттестации
                      </div>
                    )}
                  </div>

                  {(item.expiringCertifications.length > 0 || item.missingCertifications.length > 0) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Массовые действия:</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => {
                            const areas = [...new Set([...item.missingCertifications, ...item.expiringCertifications])];
                            toast({
                              title: "Добавление в приказ",
                              description: `${areas.length} областей аттестации добавлено в приказ на подготовку для ${item.personnelName}`,
                            });
                          }}
                        >
                          <Icon name="FilePlus" size={14} />
                          Добавить все в приказ ({item.missingCertifications.length + item.expiringCertifications.length})
                        </Button>
                        {item.missingCertifications.length > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              toast({
                                title: "Добавление недостающих",
                                description: `${item.missingCertifications.length} недостающих областей добавлено в приказ для ${item.personnelName}`,
                              });
                            }}
                          >
                            <Icon name="XCircle" size={14} />
                            Только недостающие ({item.missingCertifications.length})
                          </Button>
                        )}
                        {item.expiringCertifications.length > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => {
                              toast({
                                title: "Добавление истекающих",
                                description: `${item.expiringCertifications.length} истекающих областей добавлено в приказ для ${item.personnelName}`,
                              });
                            }}
                          >
                            <Icon name="AlertTriangle" size={14} />
                            Только истекающие ({item.expiringCertifications.length})
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="gap-2 ml-auto"
                          onClick={() => {
                            toast({
                              title: "Направление на обучение",
                              description: `${item.personnelName} направлен на обучение`,
                            });
                          }}
                        >
                          <Icon name="GraduationCap" size={14} />
                          Направить на обучение
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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