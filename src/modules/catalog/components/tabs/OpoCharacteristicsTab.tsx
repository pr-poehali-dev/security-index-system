import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useCatalogStore } from '@/stores/catalogStore';
import OpoStatsCards from '../characteristics/OpoStatsCards';
import OpoTableFilters from '../characteristics/OpoTableFilters';
import OpoDataTable from '../characteristics/OpoDataTable';
import { calculateDataStatus, generateZipArchive } from '../characteristics/utils';
import { objectTypeLabels } from '../characteristics/types';
import type { OpoCharacteristic } from '../characteristics/types';

export default function OpoCharacteristicsTab() {
  const { objects, organizations } = useCatalogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getOrganizationName = (organizationId: string) => {
    const org = organizations.find((o) => o.id === organizationId);
    return org?.name || 'Не указана';
  };

  const characteristicsData = useMemo(() => {
    return objects.map((obj) => calculateDataStatus(obj, getOrganizationName));
  }, [objects, organizations]);

  const filteredData = useMemo(() => {
    return characteristicsData.filter((item) => {
      const matchesSearch =
        item.objectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOrg = organizationFilter === 'all' || item.organizationName === organizationFilter;
      const matchesType = typeFilter === 'all' || item.objectType === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.dataStatus === statusFilter;

      return matchesSearch && matchesOrg && matchesType && matchesStatus;
    });
  }, [characteristicsData, searchQuery, organizationFilter, typeFilter, statusFilter]);

  const uniqueOrganizations = useMemo(() => {
    return Array.from(new Set(characteristicsData.map((item) => item.organizationName)));
  }, [characteristicsData]);

  const stats = useMemo(() => {
    const total = characteristicsData.length;
    const sufficient = characteristicsData.filter((item) => item.dataStatus === 'sufficient').length;
    const insufficient = total - sufficient;
    const avgCompleteness = Math.round(
      characteristicsData.reduce((sum, item) => sum + item.completeness, 0) / (total || 1)
    );

    return { total, sufficient, insufficient, avgCompleteness };
  }, [characteristicsData]);

  const handleEdit = (objectId: string) => {
    console.log('Редактировать объект:', objectId);
  };

  const handleGenerate = (objectId: string) => {
    console.log('Сформировать сведения для РТН:', objectId);
  };

  const handleGenerateAll = async () => {
    await generateZipArchive(characteristicsData, objects, objectTypeLabels);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Сведения характеризующие ОПО</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Контрольный перечень для предоставления в Ростехнадзор
          </p>
        </div>
        <Button
          onClick={handleGenerateAll}
          disabled={stats.sufficient === 0}
        >
          <Icon name="PackageCheck" size={16} />
          Сформировать все ({stats.sufficient})
        </Button>
      </div>

      <OpoStatsCards stats={stats} />

      <Card>
        <CardContent className="pt-6">
          <OpoTableFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            organizationFilter={organizationFilter}
            onOrganizationChange={setOrganizationFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            uniqueOrganizations={uniqueOrganizations}
          />

          <OpoDataTable
            data={filteredData}
            onEdit={handleEdit}
            onGenerate={handleGenerate}
          />

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>
              Показано {filteredData.length} из {characteristicsData.length} объектов
            </div>
            {filteredData.some((item) => item.dataStatus === 'insufficient') && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Icon name="Info" size={14} />
                <span>
                  Заполните недостающие данные для формирования сведений
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
