import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAttestationStore } from '@/stores/certificationStore';
import { useDpoQualificationStore } from '@/stores/dpoQualificationStore';
import { differenceInMonths, parseISO, isPast } from 'date-fns';

interface AreaRequirement {
  code: string;
  name: string;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  requiresDpo: boolean;
}

interface PersonnelComplianceCardProps {
  personnelId: string;
  personnelName: string;
  position: string;
  requiredAreas: AreaRequirement[];
}

interface AreaStatus {
  area: AreaRequirement;
  dpo: {
    exists: boolean;
    certificateNumber?: string;
    expiryDate?: string;
    isExpired: boolean;
    monthsUntilExpiry?: number;
  };
  attestation: {
    exists: boolean;
    protocolNumber?: string;
    expiryDate?: string;
    isExpired: boolean;
    monthsUntilExpiry?: number;
    type?: 'rostechnadzor' | 'company_commission';
  };
  overallStatus: 'compliant' | 'needs_dpo' | 'needs_attestation' | 'expired' | 'expiring_soon' | 'missing_all';
}

export default function PersonnelComplianceCard({
  personnelId,
  personnelName,
  position,
  requiredAreas
}: PersonnelComplianceCardProps) {
  const { attestations } = useAttestationStore();
  const { qualifications } = useDpoQualificationStore();

  const personnelAttestations = useMemo(
    () => attestations.filter(a => a.personnelId === personnelId),
    [attestations, personnelId]
  );

  const personnelQualifications = useMemo(
    () => qualifications.filter(q => q.personnelId === personnelId),
    [qualifications, personnelId]
  );

  const areasStatus: AreaStatus[] = useMemo(() => {
    return requiredAreas.map(area => {
      const dpoMatch = personnelQualifications.find(q => 
        q.programName.toLowerCase().includes(area.code.toLowerCase()) ||
        q.programName.toLowerCase().includes(area.name.toLowerCase())
      );

      const attestationMatch = personnelAttestations.find(a => 
        a.area.toLowerCase().includes(area.code.toLowerCase()) ||
        a.area.toLowerCase().includes(area.name.toLowerCase())
      );

      const today = new Date();
      
      const dpoStatus = {
        exists: !!dpoMatch,
        certificateNumber: dpoMatch?.certificateNumber,
        expiryDate: dpoMatch?.expiryDate,
        isExpired: dpoMatch ? isPast(parseISO(dpoMatch.expiryDate)) : false,
        monthsUntilExpiry: dpoMatch ? differenceInMonths(parseISO(dpoMatch.expiryDate), today) : undefined
      };

      const attestationStatus = {
        exists: !!attestationMatch,
        protocolNumber: attestationMatch?.protocolNumber,
        expiryDate: attestationMatch?.expiryDate,
        isExpired: attestationMatch ? isPast(parseISO(attestationMatch.expiryDate)) : false,
        monthsUntilExpiry: attestationMatch ? differenceInMonths(parseISO(attestationMatch.expiryDate), today) : undefined,
        type: attestationMatch?.attestationType
      };

      let overallStatus: AreaStatus['overallStatus'];
      
      if (!dpoStatus.exists && !attestationStatus.exists) {
        overallStatus = 'missing_all';
      } else if (!dpoStatus.exists) {
        overallStatus = 'needs_dpo';
      } else if (dpoStatus.isExpired) {
        overallStatus = 'expired';
      } else if (!attestationStatus.exists) {
        overallStatus = 'needs_attestation';
      } else if (attestationStatus.isExpired) {
        overallStatus = 'expired';
      } else if ((dpoStatus.monthsUntilExpiry !== undefined && dpoStatus.monthsUntilExpiry <= 3) || 
                 (attestationStatus.monthsUntilExpiry !== undefined && attestationStatus.monthsUntilExpiry <= 3)) {
        overallStatus = 'expiring_soon';
      } else {
        overallStatus = 'compliant';
      }

      return {
        area,
        dpo: dpoStatus,
        attestation: attestationStatus,
        overallStatus
      };
    });
  }, [requiredAreas, personnelQualifications, personnelAttestations]);

  const getStatusColor = (status: AreaStatus['overallStatus']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'needs_dpo':
      case 'needs_attestation':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expired':
      case 'missing_all':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getStatusLabel = (status: AreaStatus['overallStatus']) => {
    switch (status) {
      case 'compliant':
        return 'Соответствует';
      case 'expiring_soon':
        return 'Истекает скоро';
      case 'needs_dpo':
        return 'Нужно обучение';
      case 'needs_attestation':
        return 'Нужна аттестация';
      case 'expired':
        return 'Просрочено';
      case 'missing_all':
        return 'Нет документов';
    }
  };

  const getStatusIcon = (status: AreaStatus['overallStatus']) => {
    switch (status) {
      case 'compliant':
        return 'CheckCircle';
      case 'expiring_soon':
        return 'Clock';
      case 'needs_dpo':
        return 'BookOpen';
      case 'needs_attestation':
        return 'FileCheck';
      case 'expired':
        return 'XCircle';
      case 'missing_all':
        return 'AlertCircle';
    }
  };

  const overallCompliance = areasStatus.filter(a => a.overallStatus === 'compliant').length;
  const totalAreas = areasStatus.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{personnelName}</CardTitle>
            <CardDescription>{position}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {overallCompliance}/{totalAreas}
            </div>
            <div className="text-xs text-muted-foreground">Областей в норме</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {areasStatus.map((areaStatus, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {areaStatus.area.code}
                    </Badge>
                    <span className="font-medium">{areaStatus.area.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {areaStatus.area.category === 'industrial_safety' && 'Промышленная безопасность'}
                    {areaStatus.area.category === 'energy_safety' && 'Энергобезопасность'}
                    {areaStatus.area.category === 'labor_safety' && 'Охрана труда'}
                    {areaStatus.area.category === 'ecology' && 'Экология'}
                  </div>
                </div>
                <Badge className={getStatusColor(areaStatus.overallStatus)}>
                  <Icon name={getStatusIcon(areaStatus.overallStatus)} size={14} className="mr-1" />
                  {getStatusLabel(areaStatus.overallStatus)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Icon name="GraduationCap" size={14} />
                    Удостоверение ДПО
                  </div>
                  {areaStatus.dpo.exists ? (
                    <div className="text-sm">
                      <div className="font-medium">{areaStatus.dpo.certificateNumber}</div>
                      <div className={`text-xs ${areaStatus.dpo.isExpired ? 'text-red-600' : areaStatus.dpo.monthsUntilExpiry! <= 3 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                        До: {new Date(areaStatus.dpo.expiryDate!).toLocaleDateString('ru-RU')}
                        {areaStatus.dpo.isExpired && ' (просрочено)'}
                        {!areaStatus.dpo.isExpired && areaStatus.dpo.monthsUntilExpiry! <= 3 && ` (${areaStatus.dpo.monthsUntilExpiry} мес)`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <Icon name="X" size={14} />
                      Не пройдено
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Icon name="FileCheck" size={14} />
                    Аттестация
                  </div>
                  {areaStatus.attestation.exists ? (
                    <div className="text-sm">
                      <div className="font-medium flex items-center gap-1">
                        {areaStatus.attestation.protocolNumber}
                        {areaStatus.attestation.type === 'rostechnadzor' && (
                          <Badge variant="outline" className="text-xs px-1 py-0">РТН</Badge>
                        )}
                        {areaStatus.attestation.type === 'company_commission' && (
                          <Badge variant="outline" className="text-xs px-1 py-0">Комиссия</Badge>
                        )}
                      </div>
                      <div className={`text-xs ${areaStatus.attestation.isExpired ? 'text-red-600' : areaStatus.attestation.monthsUntilExpiry! <= 3 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                        До: {new Date(areaStatus.attestation.expiryDate!).toLocaleDateString('ru-RU')}
                        {areaStatus.attestation.isExpired && ' (просрочено)'}
                        {!areaStatus.attestation.isExpired && areaStatus.attestation.monthsUntilExpiry! <= 3 && ` (${areaStatus.attestation.monthsUntilExpiry} мес)`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-orange-600 flex items-center gap-1">
                      <Icon name="AlertCircle" size={14} />
                      {areaStatus.dpo.exists ? 'Не аттестован' : 'Сначала нужно ДПО'}
                    </div>
                  )}
                </div>
              </div>

              {areaStatus.overallStatus !== 'compliant' && (
                <div className="flex gap-2 pt-2 border-t">
                  {(!areaStatus.dpo.exists || areaStatus.dpo.isExpired || (areaStatus.dpo.monthsUntilExpiry !== undefined && areaStatus.dpo.monthsUntilExpiry <= 6)) && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Icon name="BookOpen" size={14} className="mr-1" />
                      Отправить на обучение
                    </Button>
                  )}
                  {areaStatus.dpo.exists && !areaStatus.dpo.isExpired && 
                   (!areaStatus.attestation.exists || areaStatus.attestation.isExpired || (areaStatus.attestation.monthsUntilExpiry !== undefined && areaStatus.attestation.monthsUntilExpiry <= 6)) && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Icon name="FileCheck" size={14} className="mr-1" />
                      Записать на аттестацию
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
