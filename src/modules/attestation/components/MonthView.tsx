interface Certification {
  id: string;
  employeeName: string;
  employeePosition: string;
  department: string;
  category: string;
  area: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
}

interface DayData {
  date: Date | null;
  certifications: Certification[];
}

interface MonthViewProps {
  monthData: DayData[];
  onDayClick: (date: Date) => void;
}

export default function MonthView({ monthData, onDayClick }: MonthViewProps) {
  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-900">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthData.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] p-2 border-r border-b last:border-r-0 ${
              !day.date ? 'bg-slate-50 dark:bg-slate-950' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900'
            } ${
              day.date && day.date.toDateString() === new Date().toDateString()
                ? 'bg-blue-50 dark:bg-blue-950/30'
                : ''
            }`}
            onClick={() => day.date && onDayClick(day.date)}
          >
            {day.date && (
              <>
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                {day.certifications.length > 0 && (
                  <div className="space-y-1">
                    {day.certifications.slice(0, 2).map(cert => (
                      <div
                        key={cert.id}
                        className={`text-xs p-1 rounded truncate ${
                          cert.status === 'expired'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : cert.status === 'expiring_soon'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}
                        title={`${cert.employeeName} - ${cert.area}`}
                      >
                        {cert.employeeName.split(' ')[0]}
                      </div>
                    ))}
                    {day.certifications.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{day.certifications.length - 2} ещё
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
