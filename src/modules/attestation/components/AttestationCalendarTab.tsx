import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const getMonthCertifications = (month: number) => {
    return filteredCertifications.filter(cert => {
      const expiryDate = new Date(cert.expiryDate);
      return expiryDate.getFullYear() === selectedYear && expiryDate.getMonth() === month;
    });
  };

  const monthData = viewType === 'month' ? getMonthData(selectedYear, selectedMonth) : [];
  const yearData = viewType === 'year' ? getYearData() : [];

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

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

  const selectedDayCerts = selectedDay ? getDayCertifications(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CalendarClock" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{statistics.thisMonth}</span>
            </div>
            <p className="text-sm text-muted-foreground">Истекает в этом месяце</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Calendar" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">{statistics.nextMonth}</span>
            </div>
            <p className="text-sm text-muted-foreground">Истекает в следующем</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Clock" className="text-orange-600" size={24} />
              <span className="text-2xl font-bold">{statistics.upcoming}</span>
            </div>
            <p className="text-sm text-muted-foreground">Ближайшие 90 дней</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="TrendingUp" className="text-purple-600" size={24} />
              <span className="text-2xl font-bold">{statistics.thisYear}</span>
            </div>
            <p className="text-sm text-muted-foreground">Всего в этом году</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Календарь аттестаций</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все подразделения</SelectItem>
                  {departments.map(dep => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewType === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('month')}
                  className="gap-1"
                >
                  <Icon name="Calendar" size={14} />
                  Месяц
                </Button>
                <Button
                  variant={viewType === 'year' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('year')}
                  className="gap-1"
                >
                  <Icon name="CalendarDays" size={14} />
                  Год
                </Button>
              </div>
            </div>
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
                      onClick={() => day.date && handleDayClick(day.date)}
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
            )}

            {viewType === 'year' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {yearData.map((month) => (
                  <Card
                    key={month.month}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedMonth(month.month);
                      setViewType('month');
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base capitalize">{month.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Всего</span>
                        <Badge variant="outline">{month.total}</Badge>
                      </div>
                      {month.total > 0 && (
                        <>
                          {month.expired > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-red-600 dark:text-red-400">Просрочено</span>
                              <span className="font-medium text-red-600 dark:text-red-400">{month.expired}</span>
                            </div>
                          )}
                          {month.expiring > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-amber-600 dark:text-amber-400">Истекает</span>
                              <span className="font-medium text-amber-600 dark:text-amber-400">{month.expiring}</span>
                            </div>
                          )}
                          {month.valid > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-emerald-600 dark:text-emerald-400">Действует</span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">{month.valid}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t">
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                              {month.expired > 0 && (
                                <div
                                  className="bg-red-500"
                                  style={{ width: `${(month.expired / month.total) * 100}%` }}
                                />
                              )}
                              {month.expiring > 0 && (
                                <div
                                  className="bg-amber-500"
                                  style={{ width: `${(month.expiring / month.total) * 100}%` }}
                                />
                              )}
                              {month.valid > 0 && (
                                <div
                                  className="bg-emerald-500"
                                  style={{ width: `${(month.valid / month.total) * 100}%` }}
                                />
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ближайшие аттестации (90 дней)</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingCertifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Calendar" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Нет аттестаций в ближайшие 90 дней</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingCertifications.map(cert => (
                <div
                  key={cert.id}
                  className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                    cert.status === 'expired'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                      : cert.status === 'expiring_soon'
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                      : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{cert.employeeName}</p>
                      <Badge variant="outline" className="text-xs">
                        {cert.employeePosition}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{cert.area}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Building2" size={12} />
                        {cert.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Tag" size={12} />
                        {cert.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium mb-1">
                      {new Date(cert.expiryDate).toLocaleDateString('ru-RU')}
                    </p>
                    <Badge
                      variant={
                        cert.status === 'expired'
                          ? 'destructive'
                          : cert.status === 'expiring_soon'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {cert.daysLeft > 0 ? `${cert.daysLeft} дн.` : `${Math.abs(cert.daysLeft)} дн. назад`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Аттестации на {selectedDay?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogTitle>
            <DialogDescription>
              Всего аттестаций: {selectedDayCerts.length}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedDayCerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Нет аттестаций на эту дату</p>
              </div>
            ) : (
              selectedDayCerts.map(cert => (
                <div
                  key={cert.id}
                  className={`p-4 rounded-lg border ${
                    cert.status === 'expired'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                      : cert.status === 'expiring_soon'
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                      : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-medium">{cert.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{cert.employeePosition}</p>
                    </div>
                    <Badge
                      variant={
                        cert.status === 'expired'
                          ? 'destructive'
                          : cert.status === 'expiring_soon'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {cert.status === 'expired' ? 'Просрочен' : cert.status === 'expiring_soon' ? 'Истекает' : 'Действует'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Building2" size={14} />
                      {cert.department}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Tag" size={14} />
                      {cert.category}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Award" size={14} />
                      {cert.area}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
