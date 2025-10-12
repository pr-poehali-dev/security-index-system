import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface KnowledgeBaseStatsProps {
  userGuides: number;
  regulatory: number;
  organization: number;
  total: number;
}

export default function KnowledgeBaseStats({
  userGuides,
  regulatory,
  organization,
  total
}: KnowledgeBaseStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Icon name="BookOpen" size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold">{userGuides}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Инструкций</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
            <Icon name="Scale" size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold">{regulatory}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Нормативных</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
            <Icon name="Building2" size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold">{organization}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Документов</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
            <Icon name="FileText" size={18} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold">{total}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Всего</p>
          </div>
        </div>
      </Card>
    </div>
  );
}