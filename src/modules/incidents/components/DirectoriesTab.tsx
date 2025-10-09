import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SourcesDirectory from './SourcesDirectory';
import DirectionsDirectory from './DirectionsDirectory';
import FundingTypesDirectory from './FundingTypesDirectory';
import CategoriesDirectory from './CategoriesDirectory';

export default function DirectoriesTab() {
  return (
    <Tabs defaultValue="sources" className="space-y-6">
      <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger value="sources" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Icon name="Inbox" size={20} />
          <span className="text-xs font-medium">Источники</span>
        </TabsTrigger>
        <TabsTrigger value="directions" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Icon name="Compass" size={20} />
          <span className="text-xs font-medium">Направления</span>
        </TabsTrigger>
        <TabsTrigger value="funding" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Icon name="Wallet" size={20} />
          <span className="text-xs font-medium text-center leading-tight">Обеспечение<br/>работ</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Icon name="FolderTree" size={20} />
          <span className="text-xs font-medium">Категории</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sources">
        <SourcesDirectory />
      </TabsContent>

      <TabsContent value="directions">
        <DirectionsDirectory />
      </TabsContent>

      <TabsContent value="funding">
        <FundingTypesDirectory />
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesDirectory />
      </TabsContent>
    </Tabs>
  );
}