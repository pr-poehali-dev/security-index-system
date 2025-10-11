import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Organization, Department, Position, PersonnelType } from '@/types';

interface PositionDataTabProps {
  personnelType: PersonnelType;
  personnelData: {
    organizationId: string;
    departmentId: string;
    positionId: string;
    role: 'Auditor' | 'Manager' | 'Director' | 'Contractor';
    hireDate: string;
  };
  tenantOrgs: Organization[];
  contractorOrgs: Organization[];
  departments: Department[];
  tenantPositions: Position[];
  onUpdate: (field: string, value: string) => void;
  onOrganizationChange: (value: string) => void;
}

export default function PositionDataTab({
  personnelType,
  personnelData,
  tenantOrgs,
  contractorOrgs,
  departments,
  tenantPositions,
  onUpdate,
  onOrganizationChange
}: PositionDataTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organizationId">
            {personnelType === 'employee' ? 'Организация' : 'Организация-подрядчик'} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={personnelData.organizationId}
            onValueChange={onOrganizationChange}
            required
          >
            <SelectTrigger id="organizationId">
              <SelectValue placeholder={personnelType === 'employee' ? 'Выберите организацию' : 'Выберите подрядчика'} />
            </SelectTrigger>
            <SelectContent>
              {personnelType === 'employee' 
                ? tenantOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))
                : contractorOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>

        {personnelType === 'employee' && (
          <div className="space-y-2">
            <Label htmlFor="departmentId">Подразделение</Label>
            <Select
              value={personnelData.departmentId}
              onValueChange={(value) => onUpdate('departmentId', value)}
              disabled={!personnelData.organizationId}
            >
              <SelectTrigger id="departmentId">
                <SelectValue placeholder="Выберите подразделение" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="positionId">Должность <span className="text-destructive">*</span></Label>
          <Select
            value={personnelData.positionId}
            onValueChange={(value) => onUpdate('positionId', value)}
            required
          >
            <SelectTrigger id="positionId">
              <SelectValue placeholder="Выберите должность" />
            </SelectTrigger>
            <SelectContent>
              {tenantPositions.map((pos) => (
                <SelectItem key={pos.id} value={pos.id}>
                  {pos.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Роль в системе</Label>
          {personnelType === 'contractor' ? (
            <Input
              id="role"
              value="Подрядчик (только чтение)"
              disabled
              className="bg-muted"
            />
          ) : (
            <Select
              value={personnelData.role}
              onValueChange={(value: 'Auditor' | 'Manager' | 'Director') => onUpdate('role', value)}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Менеджер</SelectItem>
                <SelectItem value="Director">Руководитель</SelectItem>
                <SelectItem value="Auditor">Аудитор</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hireDate">Дата приема</Label>
        <Input
          id="hireDate"
          type="date"
          value={personnelData.hireDate}
          onChange={(e) => onUpdate('hireDate', e.target.value)}
        />
      </div>
    </div>
  );
}
