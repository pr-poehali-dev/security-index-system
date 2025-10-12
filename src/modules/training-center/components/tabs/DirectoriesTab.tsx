import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LocationsDirectory from '../locations/LocationsDirectory';
import InstructorsDirectory from '../instructors/InstructorsDirectory';

export default function DirectoriesTab() {
  const [activeTab, setActiveTab] = useState('locations');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="locations">Места проведения</TabsTrigger>
          <TabsTrigger value="instructors">Преподаватели</TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <LocationsDirectory />
        </TabsContent>

        <TabsContent value="instructors">
          <InstructorsDirectory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
