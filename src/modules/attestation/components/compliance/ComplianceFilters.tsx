import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ComplianceFiltersProps {
  selectedOrganization: string;
  setSelectedOrganization: (value: string) => void;
  selectedProductionSite: string;
  setSelectedProductionSite: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  complianceFilter: string;
  setComplianceFilter: (value: string) => void;
  organizations: { id: string; name: string }[];
  productionSites: { id: string; name: string; organizationId: string }[];
  uniqueDepartments: string[];
}

export default function ComplianceFilters({
  selectedOrganization,
  setSelectedOrganization,
  selectedProductionSite,
  setSelectedProductionSite,
  selectedDepartment,
  setSelectedDepartment,
  complianceFilter,
  setComplianceFilter,
  organizations,
  productionSites,
  uniqueDepartments,
}: ComplianceFiltersProps) {
  const filteredProductionSites = selectedOrganization === 'all'
    ? productionSites
    : productionSites.filter(ps => ps.organizationId === selectedOrganization);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Select value={selectedOrganization} onValueChange={(value) => {
        setSelectedOrganization(value);
        setSelectedProductionSite('all');
        setSelectedDepartment('all');
      }}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Организация" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все организации</SelectItem>
          {organizations.map(org => (
            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedProductionSite} onValueChange={(value) => {
        setSelectedProductionSite(value);
        setSelectedDepartment('all');
      }}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Производственная площадка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все площадки</SelectItem>
          {filteredProductionSites.map(ps => (
            <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
  );
}
