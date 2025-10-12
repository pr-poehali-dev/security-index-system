import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ComplianceFiltersProps {
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  complianceFilter: string;
  setComplianceFilter: (value: string) => void;
  uniqueDepartments: string[];
}

export default function ComplianceFilters({
  selectedDepartment,
  setSelectedDepartment,
  complianceFilter,
  setComplianceFilter,
  uniqueDepartments,
}: ComplianceFiltersProps) {
  return (
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
  );
}
