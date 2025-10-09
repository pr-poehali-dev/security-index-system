import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SourcesDirectory from './SourcesDirectory';
import DirectionsDirectory from './DirectionsDirectory';
import FundingTypesDirectory from './FundingTypesDirectory';
import CategoriesDirectory from './CategoriesDirectory';

export default function DirectoriesTab() {
  return (
    <Tabs defaultValue="sources" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="sources" className="gap-2">
          <Icon name="Inbox" size={14} />
          Источники
        </TabsTrigger>
        <TabsTrigger value="directions" className="gap-2">
          <Icon name="Compass" size={14} />
          Направления
        </TabsTrigger>
        <TabsTrigger value="funding" className="gap-2">
          <Icon name="Wallet" size={14} />
          Обеспечение работ
        </TabsTrigger>
        <TabsTrigger value="categories" className="gap-2">
          <Icon name="FolderTree" size={14} />
          Категории
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
