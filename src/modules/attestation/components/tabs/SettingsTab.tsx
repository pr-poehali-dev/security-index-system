import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import DirectoriesTab from './DirectoriesTab';
import NotificationsTab from './NotificationsTab';

const SettingsTab = memo(function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Настройки модуля</h2>
        
        <Tabs defaultValue="directories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="directories" className="gap-2">
              <Icon name="BookOpen" size={18} />
              Справочники
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Icon name="Bell" size={18} />
              Уведомления
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directories">
            <DirectoriesTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
});

export default SettingsTab;
