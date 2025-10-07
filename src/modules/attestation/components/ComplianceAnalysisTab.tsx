import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAttestationStore } from '@/stores/attestationStore';
import { getPersonnelFullInfo, getCertificationStatus } from '@/lib/utils/personnelUtils';

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
  const { certifications } = useAttestationStore();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');

  const tenantPersonnel = useMemo(() => {
    return user?.tenantId ? personnel.filter(p => p.tenantId === user.tenantId) : [];
  }, [personnel, user?.tenantId]);

  const complianceData = useMemo(() => {
    return tenantPersonnel.map(p => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = departments.find(d => d.id === p.departmentId);
      
      const competency = competencies.find(c => c.positionId === p.positionId);
      const requiredAreas = competency?.requiredAreas.flatMap(ra => ra.areas) || [];
      
      const personnelCerts = certifications.filter(c => c.personnelId === p.id);
      const actualAreas = personnelCerts.map(c => c.area);
      
      const expiringAreas = personnelCerts
        .filter(c => {
          const { status } = getCertificationStatus(c.expiryDate);
          return status === 'expiring_soon';
        })
        .map(c => c.area);
      
      const missingAreas = requiredAreas.filter(ra => !actualAreas.includes(ra));
      
      const compliancePercent = requiredAreas.length > 0 
        ? Math.round((actualAreas.length / requiredAreas.length) * 100)
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
            <Button className="gap-2">
              <Icon name="Download" size={16} />
              Экспорт отчета
            </Button>
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

          <div className="space-y-4">
            {filteredData.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-2 flex items-center gap-1">
                        <Icon name="CheckCircle" size={14} className="text-emerald-600" />
                        Действующие ({item.actualCertifications.length})
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        {item.actualCertifications.map((cert, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-emerald-600 mt-0.5">•</span>
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {item.expiringCertifications.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 flex items-center gap-1">
                          <Icon name="AlertTriangle" size={14} className="text-amber-600" />
                          Истекают ({item.expiringCertifications.length})
                        </p>
                        <ul className="space-y-1 text-muted-foreground">
                          {item.expiringCertifications.map((cert, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-amber-600 mt-0.5">•</span>
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.missingCertifications.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 flex items-center gap-1">
                          <Icon name="XCircle" size={14} className="text-red-600" />
                          Отсутствуют ({item.missingCertifications.length})
                        </p>
                        <ul className="space-y-1 text-muted-foreground">
                          {item.missingCertifications.map((cert, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-red-600 mt-0.5">•</span>
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {(item.expiringCertifications.length > 0 || item.missingCertifications.length > 0) && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => {
                          toast({
                            title: "Формирование приказа",
                            description: `Приказ для ${item.personnelName} будет сформирован`,
                          });
                        }}
                      >
                        <Icon name="FileText" size={14} />
                        Сформировать приказ
                      </Button>
                      <Button 
                        size="sm" 
                        className="gap-2"
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
    </div>
  );
}