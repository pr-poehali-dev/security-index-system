import { useTenantStore } from '@/stores/tenantStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon, { type IconName } from '@/components/ui/icon';

export default function StatisticsTab() {
  const { tenants } = useTenantStore();

  const activeTenantsCount = tenants.filter(t => t.status === 'active').length;
  const inactiveTenantsCount = tenants.filter(t => t.status === 'inactive').length;
  
  const expiringTenantsCount = tenants.filter(t => {
    const daysLeft = Math.floor((new Date(t.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft >= 0;
  }).length;

  const expiredTenantsCount = tenants.filter(t => {
    const daysLeft = Math.floor((new Date(t.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft < 0;
  }).length;

  const stats: Array<{
    title: string;
    value: number;
    icon: IconName;
    color: string;
    bgColor: string;
  }> = [
    {
      title: 'Всего тенантов',
      value: tenants.length,
      icon: 'Building2',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Активные',
      value: activeTenantsCount,
      icon: 'CheckCircle',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
    },
    {
      title: 'Неактивные',
      value: inactiveTenantsCount,
      icon: 'XCircle',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20'
    },
    {
      title: 'Истекают скоро',
      value: expiringTenantsCount,
      icon: 'AlertTriangle',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    {
      title: 'Истекли',
      value: expiredTenantsCount,
      icon: 'AlertCircle',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon name={stat.icon} className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Распределение по статусу</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Активные</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {activeTenantsCount} ({tenants.length > 0 ? Math.round((activeTenantsCount / tenants.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${tenants.length > 0 ? (activeTenantsCount / tenants.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Неактивные</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {inactiveTenantsCount} ({tenants.length > 0 ? Math.round((inactiveTenantsCount / tenants.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full transition-all"
                    style={{ width: `${tenants.length > 0 ? (inactiveTenantsCount / tenants.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Сроки действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Истекают в течение 30 дней</span>
                  <span className="text-sm font-medium text-amber-600">
                    {expiringTenantsCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${tenants.length > 0 ? (expiringTenantsCount / tenants.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Уже истекли</span>
                  <span className="text-sm font-medium text-red-600">
                    {expiredTenantsCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${tenants.length > 0 ? (expiredTenantsCount / tenants.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}