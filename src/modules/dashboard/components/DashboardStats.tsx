import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon, { type IconName } from '@/components/ui/icon';

interface StatItem {
  title: string;
  value: string;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
  icon: IconName;
  color: string;
  bgColor: string;
  badge?: {
    text: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  onClick: () => void;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

const DashboardStats = memo(function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="hover-scale cursor-pointer transition-all hover:border-primary/50"
          onClick={stat.onClick}
        >
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon name={stat.icon} className={stat.color} size={20} />
              </div>
              {stat.badge && (
                <Badge variant={stat.badge.variant} className="text-[10px] sm:text-xs">
                  {stat.badge.text}
                </Badge>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">{stat.value}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{stat.title}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

export default DashboardStats;