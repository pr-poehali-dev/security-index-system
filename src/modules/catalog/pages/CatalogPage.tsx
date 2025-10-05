import { useState, useMemo } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from '@/components/ui/search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ObjectCard from '../components/ObjectCard';
import OrganizationCard from '../components/OrganizationCard';
import CreateObjectDialog from '../components/CreateObjectDialog';

export default function CatalogPage() {
  const { organizations, objects, addObject } = useCatalogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [orgSearchQuery, setOrgSearchQuery] = useState('');

  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => {
      const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           obj.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || obj.category === categoryFilter;
      const matchesOrg = organizationFilter === 'all' || obj.organizationId === organizationFilter;
      return matchesSearch && matchesCategory && matchesOrg;
    });
  }, [objects, searchQuery, categoryFilter, organizationFilter]);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => 
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
      org.inn?.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );
  }, [organizations, orgSearchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(objects.map(obj => obj.category));
    return Array.from(cats);
  }, [objects]);

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
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск по названию или рег. номеру..."
              className="flex-1"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Организация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все организации</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {filteredObjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Объекты не найдены</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{filteredObjects.length} объект(ов)</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredObjects.map((obj) => (
                  <ObjectCard key={obj.id} object={obj} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <div className="mb-4">
            <SearchBar
              value={orgSearchQuery}
              onChange={setOrgSearchQuery}
              placeholder="Поиск по названию или ИНН..."
            />
          </div>
          
          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Организации не найдены</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{filteredOrganizations.length} организаций</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrganizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    objectsCount={objects.filter(o => o.organizationId === org.id).length}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}