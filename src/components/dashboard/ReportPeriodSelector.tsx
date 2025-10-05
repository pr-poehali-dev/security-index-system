import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import type { ReportPeriod } from '@/utils/reportGenerator';

interface ReportPeriodSelectorProps {
  onGenerateReport: (period: ReportPeriod) => void;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const periodLabels: Record<ReportPeriod, string> = {
  week: 'За неделю',
  month: 'За месяц',
  quarter: 'За квартал',
  all: 'За все время'
};

export default function ReportPeriodSelector({
  onGenerateReport,
  variant = 'default',
  size = 'default',
  showLabel = true
}: ReportPeriodSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (period: ReportPeriod) => {
    onGenerateReport(period);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={showLabel ? 'gap-2' : ''}>
          <Icon name="FileText" size={size === 'sm' ? 14 : 18} />
          {showLabel && 'Сформировать отчет'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(periodLabels) as ReportPeriod[]).map((period) => (
          <DropdownMenuItem
            key={period}
            onClick={() => handleSelect(period)}
            className="cursor-pointer"
          >
            <Icon name="Calendar" size={16} className="mr-2" />
            {periodLabels[period]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
