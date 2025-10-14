import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import type { DocumentCategory } from "@/types";

interface KnowledgeBaseTabsProps {
  activeTab: DocumentCategory;
  onTabChange: (tab: DocumentCategory) => void;
  stats: {
    regulatory: number;
    organization: number;
    platformInstructions: number;
  };
  children: React.ReactNode;
}

export default function KnowledgeBaseTabs({
  activeTab,
  onTabChange,
  stats,
  children,
}: KnowledgeBaseTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as DocumentCategory)}
      className="space-y-6"
    >
      <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0 w-full">
        <TabsTrigger
          value="regulatory"
          className="flex-col gap-1.5 sm:gap-2 h-16 sm:h-20 px-3 sm:px-6 flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Icon name="Scale" size={18} />
          <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
            <span className="text-[10px] sm:text-xs font-medium text-center">
              Нормативно-правовые документы
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] sm:text-xs h-4 px-1"
            >
              {stats.regulatory}
            </Badge>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="organization"
          className="flex-col gap-1.5 sm:gap-2 h-16 sm:h-20 px-3 sm:px-6 flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Icon name="Building2" size={18} />
          <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
            <span className="text-[10px] sm:text-xs font-medium text-center">
              Документы организации
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] sm:text-xs h-4 px-1"
            >
              {stats.organization}
            </Badge>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="platform_instruction"
          className="flex-col gap-1.5 sm:gap-2 h-16 sm:h-20 px-3 sm:px-6 flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Icon name="Shield" size={18} />
          <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
            <span className="text-[10px] sm:text-xs font-medium text-center">
              Инструкции платформы
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] sm:text-xs h-4 px-1"
            >
              {stats.platformInstructions}
            </Badge>
          </div>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}