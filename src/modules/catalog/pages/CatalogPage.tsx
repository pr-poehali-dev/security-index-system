import { useCatalogStore } from '@/stores/catalogStore';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ObjectCard from '../components/ObjectCard';
import OrganizationCard from '../components/OrganizationCard';
import CreateObjectDialog from '../components/CreateObjectDialog';

export default function CatalogPage() {
  const { organizations, objects, addObject } = useCatalogStore();

  return (
    <div>
      <PageHeader
        title="Каталог объектов"
        description="Учет опасных производственных объектов и оборудования"
        icon="Building"
        action={
          <CreateObjectDialog
            organizations={organizations}
            onSubmit={addObject}
          />
        }
      />

      <Tabs defaultValue="objects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="objects">Объекты ({objects.length})</TabsTrigger>
          <TabsTrigger value="organizations">Организации ({organizations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="objects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objects.map((obj) => (
              <ObjectCard key={obj.id} object={obj} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                objectsCount={objects.filter(o => o.organizationId === org.id).length}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
