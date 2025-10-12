import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { DocumentCategory } from '@/types';

interface KnowledgeBaseTabsProps {
  activeTab: DocumentCategory;
  onTabChange: (tab: DocumentCategory) => void;
  stats: {
    userGuides: number;
    regulatory: number;
    organization: number;
  };
  children: React.ReactNode;
}

export default function KnowledgeBaseTabs({
  activeTab,
  onTabChange,
  stats,
  children
}: KnowledgeBaseTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as DocumentCategory)} className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger value="user_guide" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Icon name="BookOpen" size={20} />
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">Инструкции</span>
            <Badge variant="secondary" className="text-xs">{stats.userGuides}</Badge>
          </div>
        </TabsTrigger>
        <TabsTrigger value="regulatory" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Icon name="Scale" size={20} />
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">Нормативные</span>
            <Badge variant="secondary" className="text-xs">{stats.regulatory}</Badge>
          </div>
        </TabsTrigger>
        <TabsTrigger value="organization" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Icon name="Building2" size={20} />
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">Документы</span>
            <Badge variant="secondary" className="text-xs">{stats.organization}</Badge>
          </div>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
