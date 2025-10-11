import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import CalendarStatisticsCards from './CalendarStatisticsCards';
import CalendarFilters from './CalendarFilters';
import MonthView from './MonthView';
import YearView from './YearView';
import UpcomingCertificationsList from './UpcomingCertificationsList';
import DayCertificationsDialog from './DayCertificationsDialog';

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

const mockCertifications: Certification[] = [
  {
    id: '1',
    employeeName: 'Иванов Иван Иванович',
    employeePosition: 'Инженер',
    department: 'Производство',
    category: 'Промышленная безопасность',
    area: 'А.1 Основы промышленной безопасности',
    expiryDate: '2028-01-01',
    status: 'valid',
    daysLeft: 1182
  },
  {
    id: '2',
    employeeName: 'Петрова Анна Сергеевна',
    employeePosition: 'Начальник участка',
    department: 'Производство',
    category: 'Электробезопасность',
    area: 'IV группа до 1000В',
    expiryDate: '2025-12-20',
    status: 'expiring_soon',
    daysLeft: 74
  },
  {
    id: '3',
    employeeName: 'Сидоров Петр Николаевич',
    employeePosition: 'Техник',
    department: 'Ремонт',
    category: 'Работа на высоте',
    area: '3 группа',
    expiryDate: '2025-11-15',
    status: 'expiring_soon',
    daysLeft: 39
  },
  {
    id: '4',
    employeeName: 'Козлов Михаил Андреевич',
    employeePosition: 'Электромонтёр',
    department: 'Энергоцех',
    category: 'Электробезопасность',
    area: 'V группа до и выше 1000В',
    expiryDate: '2025-10-25',
    status: 'expiring_soon',
    daysLeft: 18
  },
  {
    id: '5',
    employeeName: 'Морозова Елена Викторовна',
    employeePosition: 'Лаборант',
    department: 'Лаборатория',
    category: 'Промышленная безопасность',
    area: 'Б.7 Эксплуатация газового оборудования',
    expiryDate: '2025-08-14',
    status: 'expired',
    daysLeft: -67
  },
  {
    id: '6',
    employeeName: 'Новиков Алексей Сергеевич',
    employeePosition: 'Оператор',
    department: 'Производство',
    category: 'Промышленная безопасность',
    area: 'А.1 Основы промышленной безопасности',
    expiryDate: '2026-03-10',
    status: 'valid',
    daysLeft: 154
  },
  {
    id: '7',
    employeeName: 'Соколова Мария Петровна',
    employeePosition: 'Мастер',
    department: 'Производство',
    category: 'Работа на высоте',
    area: '2 группа',
    expiryDate: '2026-01-22',
    status: 'valid',
    daysLeft: 107
  },
];

export default function AttestationCalendarTab() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState<'month' | 'year'>('year');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const departments = Array.from(new Set(mockCertifications.map(c => c.department)));
  const categories = Array.from(new Set(mockCertifications.map(c => c.category)));

  const filteredCertifications = useMemo(() => {
    return mockCertifications.filter(cert => {
      const matchesDepartment = filterDepartment === 'all' || cert.department === filterDepartment;
      const matchesCategory = filterCategory === 'all' || cert.category === filterCategory;
      return matchesDepartment && matchesCategory;
    });
  }, [filterDepartment, filterCategory]);

  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, certifications: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const certs = filteredCertifications.filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        return expiryDate.toDateString() === date.toDateString();
      });
      days.push({ date, certifications: certs });
    }

    return days;
  };

  const getYearData = () => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(selectedYear, month, 1);
      const certs = filteredCertifications.filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        return expiryDate.getFullYear() === selectedYear && expiryDate.getMonth() === month;
      });
      
      const expired = certs.filter(c => c.status === 'expired').length;
      const expiring = certs.filter(c => c.status === 'expiring_soon').length;
      const valid = certs.filter(c => c.status === 'valid').length;

      months.push({
        month,
        name: monthDate.toLocaleDateString('ru-RU', { month: 'long' }),
        total: certs.length,
        expired,
        expiring,
        valid,
        certifications: certs
      });
    }
    return months;
  };

  const getDayCertifications = (date: Date) => {
    return filteredCertifications.filter(cert => {
      const expiryDate = new Date(cert.expiryDate);
      return expiryDate.toDateString() === date.toDateString();
    });
  };

  const monthData = viewType === 'month' ? getMonthData(selectedYear, selectedMonth) : [];
  const yearData = viewType === 'year' ? getYearData() : [];

  const upcomingCertifications = useMemo(() => {
    const today = new Date();
    const next90Days = new Date(today);
    next90Days.setDate(today.getDate() + 90);

    return filteredCertifications
      .filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        return expiryDate >= today && expiryDate <= next90Days;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [filteredCertifications]);

  const statistics = useMemo(() => {
    const today = new Date();
    const thisMonth = filteredCertifications.filter(cert => {
      const expiry = new Date(cert.expiryDate);
      return expiry.getMonth() === today.getMonth() && expiry.getFullYear() === today.getFullYear();
    });
    
    const nextMonth = filteredCertifications.filter(cert => {
      const expiry = new Date(cert.expiryDate);
      const next = new Date(today);
      next.setMonth(today.getMonth() + 1);
      return expiry.getMonth() === next.getMonth() && expiry.getFullYear() === next.getFullYear();
    });

    const thisYear = filteredCertifications.filter(cert => {
      const expiry = new Date(cert.expiryDate);
      return expiry.getFullYear() === today.getFullYear();
    });

    return {
      thisMonth: thisMonth.length,
      nextMonth: nextMonth.length,
      thisYear: thisYear.length,
      upcoming: upcomingCertifications.length,
    };
  }, [filteredCertifications, upcomingCertifications]);

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
  };

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
    setViewType('month');
  };

  const selectedDayCerts = selectedDay ? getDayCertifications(selectedDay) : [];

  return (
    <div className="space-y-6">
      <CalendarStatisticsCards statistics={statistics} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Календарь аттестаций</CardTitle>
            <CalendarFilters
              filterDepartment={filterDepartment}
              setFilterDepartment={setFilterDepartment}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              departments={departments}
              categories={categories}
              viewType={viewType}
              setViewType={setViewType}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewType === 'month') {
                      const newDate = new Date(selectedYear, selectedMonth - 1);
                      setSelectedMonth(newDate.getMonth());
                      setSelectedYear(newDate.getFullYear());
                    } else {
                      setSelectedYear(selectedYear - 1);
                    }
                  }}
                >
                  <Icon name="ChevronLeft" size={16} />
                </Button>
                <h3 className="text-lg font-semibold">
                  {viewType === 'month' 
                    ? new Date(selectedYear, selectedMonth).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
                    : selectedYear
                  }
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewType === 'month') {
                      const newDate = new Date(selectedYear, selectedMonth + 1);
                      setSelectedMonth(newDate.getMonth());
                      setSelectedYear(newDate.getFullYear());
                    } else {
                      setSelectedYear(selectedYear + 1);
                    }
                  }}
                >
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setSelectedMonth(today.getMonth());
                  setSelectedYear(today.getFullYear());
                }}
              >
                Сегодня
              </Button>
            </div>

            {viewType === 'month' && (
              <MonthView
                monthData={monthData}
                onDayClick={handleDayClick}
              />
            )}

            {viewType === 'year' && (
              <YearView
                yearData={yearData}
                onMonthClick={handleMonthClick}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <UpcomingCertificationsList certifications={upcomingCertifications} />

      <DayCertificationsDialog
        selectedDay={selectedDay}
        certifications={selectedDayCerts}
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
