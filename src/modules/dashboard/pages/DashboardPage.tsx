import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/layout/PageHeader';
import Icon from '@/components/ui/icon';

const stats = [
  {
    title: 'Активные сотрудники',
    value: '483',
    change: '+12%',
    trend: 'up',
    icon: 'Users',
    color: 'text-blue-600'
  },
  {
    title: 'Действующие аттестации',
    value: '875',
    change: '+8%',
    trend: 'up',
    icon: 'GraduationCap',
    color: 'text-emerald-600'
  },
  {
    title: 'Истекают в течение 30 дней',
    value: '42',
    change: '-15%',
    trend: 'down',
    icon: 'AlertTriangle',
    color: 'text-amber-600'
  },
  {
    title: 'Открытые инциденты',
    value: '8',
    change: '-25%',
    trend: 'down',
    icon: 'AlertCircle',
    color: 'text-red-600'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'certification',
    title: 'Аттестация по промбезопасности',
    user: 'Иванов И.И.',
    time: '2 часа назад',
    status: 'completed'
  },
  {
    id: 2,
    type: 'incident',
    title: 'Инцидент на объекте ОПО-125',
    user: 'Петров П.П.',
    time: '5 часов назад',
    status: 'pending'
  },
  {
    id: 3,
    type: 'task',
    title: 'Проверка КИП и А',
    user: 'Сидорова А.А.',
    time: '1 день назад',
    status: 'in_progress'
  },
  {
    id: 4,
    type: 'maintenance',
    title: 'Плановый ремонт котельной №3',
    user: 'Козлов В.В.',
    time: '1 день назад',
    status: 'completed'
  }
];

const upcomingCertifications = [
  { name: 'Иванов Иван', area: 'Промышленная безопасность', date: '2025-10-15', daysLeft: 10 },
  { name: 'Петрова Анна', area: 'Охрана труда', date: '2025-10-20', daysLeft: 15 },
  { name: 'Сидоров Петр', area: 'Энергобезопасность', date: '2025-10-25', daysLeft: 20 },
  { name: 'Козлова Мария', area: 'Экология', date: '2025-11-01', daysLeft: 27 }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Завершено';
    case 'in_progress': return 'В работе';
    case 'pending': return 'Ожидает';
    default: return status;
  }
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const tenants = useTenantStore((state) => state.tenants);

  return (
    <div>
      <PageHeader
        title={`Добро пожаловать, ${user?.name.split(' ')[0]}`}
        description="Обзор ключевых показателей системы безопасности"
        icon="LayoutDashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center`}>
                  <Icon name={stat.icon as any} className={stat.color} size={24} />
                </div>
                <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={20} className="text-emerald-600" />
                Последняя активность
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="mt-1">
                    <Icon 
                      name={
                        activity.type === 'certification' ? 'GraduationCap' :
                        activity.type === 'incident' ? 'AlertCircle' :
                        activity.type === 'task' ? 'ListTodo' : 'Wrench'
                      } 
                      size={18}
                      className="text-gray-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.user} • {activity.time}</p>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {getStatusLabel(activity.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={20} className="text-emerald-600" />
              Предстоящие аттестации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingCertifications.map((cert, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{cert.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{cert.area}</p>
                    </div>
                    <Badge variant={cert.daysLeft <= 15 ? 'destructive' : 'secondary'} className="text-xs">
                      {cert.daysLeft} дней
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>До истечения срока</span>
                      <span>{cert.date}</span>
                    </div>
                    <Progress value={(30 - cert.daysLeft) / 30 * 100} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role === 'SuperAdmin' && tenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" size={20} className="text-emerald-600" />
              Управление тенантами
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map((tenant) => {
                const daysUntilExpiry = Math.floor((new Date(tenant.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpiring = daysUntilExpiry <= 30;
                
                return (
                  <div key={tenant.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{tenant.name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">ИНН: {tenant.inn}</p>
                      </div>
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                        {tenant.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Icon name="Users" size={14} className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{tenant.adminName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Icon name="Calendar" size={14} className="text-gray-500" />
                        <span className={isExpiring ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}>
                          Истекает через {daysUntilExpiry} дней
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Модулей:</span>
                        <Badge variant="outline" className="text-xs">{tenant.modules.length}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
