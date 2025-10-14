import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  search?: {
    enabled: boolean;
    placeholder?: string;
  };
  filters: Array<{
    id: string;
    label: string;
    options: FilterOption[];
    width?: string;
  }>;
  actions?: Array<{
    id: string;
    label: string;
    icon: string;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    onClick: () => void;
  }>;
}

export interface FilterValues {
  search?: string;
  [key: string]: string | undefined;
}

interface DocumentFiltersProps {
  config: FilterConfig;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  className?: string;
}

export default function DocumentFilters({
  config,
  values,
  onChange,
  className = '',
}: DocumentFiltersProps) {
  const handleSearchChange = (value: string) => {
    onChange({ ...values, search: value });
  };

  const handleFilterChange = (filterId: string, value: string) => {
    onChange({ ...values, [filterId]: value });
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center ${className}`}>
      <div className="flex flex-1 gap-2 w-full sm:w-auto flex-wrap">
        {config.search?.enabled && (
          <div className="relative flex-1 min-w-[240px]">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder={config.search.placeholder || 'Поиск...'}
              value={values.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {config.filters.map((filter) => (
          <Select
            key={filter.id}
            value={values[filter.id] || 'all'}
            onValueChange={(value) => handleFilterChange(filter.id, value)}
          >
            <SelectTrigger className={filter.width || 'w-[180px]'}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {config.actions && config.actions.length > 0 && (
        <div className="flex gap-2">
          {config.actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              className="gap-2"
            >
              <Icon name={action.icon} size={16} />
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
