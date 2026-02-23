import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrainingRequestsFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  organizationFilter: string;
  productionSiteFilter: string;
  departmentFilter: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onProductionSiteChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  organizations: { id: string; name: string }[];
  productionSites: { id: string; name: string; organizationId: string }[];
  departments: { id: string; name: string; organizationId: string }[];
}

export default function TrainingRequestsFilters({
  statusFilter,
  priorityFilter,
  organizationFilter,
  productionSiteFilter,
  departmentFilter,
  onStatusChange,
  onPriorityChange,
  onOrganizationChange,
  onProductionSiteChange,
  onDepartmentChange,
  organizations,
  productionSites,
  departments,
}: TrainingRequestsFiltersProps) {
  const filteredProductionSites = organizationFilter === 'all'
    ? productionSites
    : productionSites.filter(ps => ps.organizationId === organizationFilter);

  const filteredDepartments = organizationFilter === 'all'
    ? departments
    : departments.filter(d => d.organizationId === organizationFilter);

  return (
    <div className="flex flex-wrap gap-4">
      <Select value={organizationFilter} onValueChange={(value) => {
        onOrganizationChange(value);
        onProductionSiteChange('all');
        onDepartmentChange('all');
      }}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Организация" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все организации</SelectItem>
          {organizations.map(org => (
            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={productionSiteFilter} onValueChange={(value) => {
        onProductionSiteChange(value);
        onDepartmentChange('all');
      }}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Производственная площадка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все площадки</SelectItem>
          {filteredProductionSites.map(ps => (
            <SelectItem key={ps.id} value={ps.id}>{ps.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={departmentFilter} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Подразделение" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все подразделения</SelectItem>
          {filteredDepartments.map(dept => (
            <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="pending">На рассмотрении</SelectItem>
          <SelectItem value="approved">Согласовано</SelectItem>
          <SelectItem value="rejected">Отклонено</SelectItem>
          <SelectItem value="in_progress">В процессе</SelectItem>
          <SelectItem value="completed">Завершено</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Приоритет" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все приоритеты</SelectItem>
          <SelectItem value="high">Высокий</SelectItem>
          <SelectItem value="medium">Средний</SelectItem>
          <SelectItem value="low">Низкий</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
