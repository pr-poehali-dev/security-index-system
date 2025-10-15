import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCatalogStore } from '@/stores/catalogStore';
import type { IndustrialObject, ObjectType } from '@/types/catalog';

type DataStatus = 'sufficient' | 'insufficient';

interface OpoCharacteristic {
  objectId: string;
  organizationName: string;
  objectType: ObjectType;
  objectName: string;
  registrationNumber: string;
  dataStatus: DataStatus;
  completeness: number;
  missingFields: string[];
}

const objectTypeLabels: Record<ObjectType, string> = {
  opo: 'ОПО',
  gts: 'ГТС',
  building: 'Здание/Сооружение',
};

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

  const calculateDataStatus = (obj: IndustrialObject): OpoCharacteristic => {
    const missingFields: string[] = [];
    let filledFields = 0;
    const totalFields = 20;

    if (!obj.registrationNumber) missingFields.push('Регистрационный номер');
    else filledFields++;

    if (!obj.commissioningDate) missingFields.push('Дата ввода в эксплуатацию');
    else filledFields++;

    if (!obj.hazardClass) missingFields.push('Класс опасности');
    else filledFields++;

    if (!obj.location.address) missingFields.push('Адрес расположения');
    else filledFields++;

    if (!obj.responsiblePerson) missingFields.push('Ответственное лицо');
    else filledFields++;

    if (!obj.detailedAddress?.region) missingFields.push('Субъект РФ');
    else filledFields++;

    if (!obj.detailedAddress?.oktmo) missingFields.push('Код ОКТМО');
    else filledFields++;

    if (!obj.industryCode) missingFields.push('Код отрасли');
    else filledFields++;

    if (!obj.dangerSigns || obj.dangerSigns.length === 0) missingFields.push('Признаки опасности');
    else filledFields++;

    if (!obj.classifications || obj.classifications.length === 0) missingFields.push('Классификация ОПО');
    else filledFields++;

    if (!obj.hazardClassJustification) missingFields.push('Обоснование класса опасности');
    else filledFields++;

    if (!obj.licensedActivities || obj.licensedActivities.length === 0) missingFields.push('Лицензируемая деятельность');
    else filledFields++;

    if (!obj.registrationDate) missingFields.push('Дата регистрации в РТН');
    else filledFields++;

    if (!obj.rtnDepartmentId) missingFields.push('Орган РТН');
    else filledFields++;

    if (!obj.nextExpertiseDate) missingFields.push('Дата следующей экспертизы');
    else filledFields++;

    if (!obj.nextDiagnosticDate) missingFields.push('Дата следующей диагностики');
    else filledFields++;

    if (!obj.documents || obj.documents.length === 0) missingFields.push('Документы ОПО');
    else filledFields++;

    if (!obj.detailedAddress?.postalCode) missingFields.push('Почтовый индекс');
    else filledFields++;

    if (!obj.location.coordinates) missingFields.push('GPS координаты');
    else filledFields++;

    if (!obj.ownerId) missingFields.push('Владелец объекта');
    else filledFields++;

    const completeness = Math.round((filledFields / totalFields) * 100);
    const dataStatus: DataStatus = completeness >= 80 ? 'sufficient' : 'insufficient';

    return {
      objectId: obj.id,
      organizationName: getOrganizationName(obj.organizationId),
      objectType: obj.type,
      objectName: obj.name,
      registrationNumber: obj.registrationNumber,
      dataStatus,
      completeness,
      missingFields,
    };
  };

  const characteristicsData = useMemo(() => {
    return objects.map(calculateDataStatus);
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
    const sufficientObjects = characteristicsData.filter((item) => item.dataStatus === 'sufficient');
    
    if (sufficientObjects.length === 0) {
      alert('Нет объектов с достаточными данными для формирования');
      return;
    }

    try {
      const zip = await import('jszip');
      const JSZip = zip.default;
      const zipFile = new JSZip();

      sufficientObjects.forEach((item) => {
        const obj = objects.find((o) => o.id === item.objectId);
        if (!obj) return;

        const content = `СВЕДЕНИЯ, ХАРАКТЕРИЗУЮЩИЕ ОПАСНЫЙ ПРОИЗВОДСТВЕННЫЙ ОБЪЕКТ

` +
          `Регистрационный номер: ${obj.registrationNumber}
` +
          `Наименование: ${obj.name}
` +
          `Организация: ${item.organizationName}
` +
          `Тип объекта: ${objectTypeLabels[obj.type]}
` +
          `Класс опасности: ${obj.hazardClass || '-'}
` +
          `Адрес: ${obj.location.address}
` +
          `Субъект РФ: ${obj.detailedAddress?.region || '-'}
` +
          `Код ОКТМО: ${obj.detailedAddress?.oktmo || '-'}
` +
          `Почтовый индекс: ${obj.detailedAddress?.postalCode || '-'}
` +
          `GPS координаты: ${obj.location.coordinates || '-'}
` +
          `Дата ввода в эксплуатацию: ${obj.commissioningDate || '-'}
` +
          `Ответственное лицо: ${obj.responsiblePerson || '-'}
` +
          `Владелец: ${obj.ownerId || '-'}
` +
          `Код отрасли: ${obj.industryCode || '-'}
` +
          `Признаки опасности: ${obj.dangerSigns?.join(', ') || '-'}
` +
          `Классификация: ${obj.classifications?.join(', ') || '-'}
` +
          `Обоснование класса опасности: ${obj.hazardClassJustification || '-'}
` +
          `Лицензируемая деятельность: ${obj.licensedActivities?.join(', ') || '-'}
` +
          `Дата регистрации в РТН: ${obj.registrationDate || '-'}
` +
          `Орган РТН: ${obj.rtnDepartmentId || '-'}
` +
          `Дата следующей экспертизы: ${obj.nextExpertiseDate || '-'}
` +
          `Дата следующей диагностики: ${obj.nextDiagnosticDate || '-'}
` +
          `Документы: ${obj.documents?.length || 0} шт.`;

        const fileName = `${obj.registrationNumber || obj.id}_${obj.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.txt`;
        zipFile.file(fileName, content);
      });

      const blob = await zipFile.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `сведения_ОПО_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка формирования архива:', error);
      alert('Произошла ошибка при формировании архива');
    }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего объектов</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Icon name="Building" size={24} className="text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Данных достаточно</p>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.sufficient}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Данных недостаточно</p>
                <p className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">{stats.insufficient}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Icon name="AlertCircle" size={24} className="text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Средняя полнота</p>
                <p className="text-2xl font-bold mt-1">{stats.avgCompleteness}%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Icon name="BarChart3" size={24} className="text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, организации, рег. номеру..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Все организации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все организации</SelectItem>
                {uniqueOrganizations.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="opo">ОПО</SelectItem>
                <SelectItem value="gts">ГТС</SelectItem>
                <SelectItem value="building">Здание/Сооружение</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="sufficient">Данных достаточно</SelectItem>
                <SelectItem value="insufficient">Данных недостаточно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Организация</TableHead>
                  <TableHead className="w-[120px]">Тип объекта</TableHead>
                  <TableHead>Наименование объекта</TableHead>
                  <TableHead className="w-[150px]">Рег. номер</TableHead>
                  <TableHead className="w-[180px]">Статус</TableHead>
                  <TableHead className="w-[100px] text-center">Полнота</TableHead>
                  <TableHead className="w-[180px] text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Нет данных для отображения
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.objectId}>
                      <TableCell className="font-medium text-sm">{item.organizationName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{objectTypeLabels[item.objectType]}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.objectName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.registrationNumber}
                      </TableCell>
                      <TableCell>
                        {item.dataStatus === 'sufficient' ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <Icon name="CheckCircle" size={14} className="mr-1" />
                            Данных достаточно
                          </Badge>
                        ) : (
                          <div className="space-y-1">
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                              <Icon name="AlertCircle" size={14} className="mr-1" />
                              Данных недостаточно
                            </Badge>
                            {item.missingFields.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Не хватает: {item.missingFields.slice(0, 2).join(', ')}
                                {item.missingFields.length > 2 && ` +${item.missingFields.length - 2}`}
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-medium">{item.completeness}%</span>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                item.completeness >= 80
                                  ? 'bg-green-500'
                                  : item.completeness >= 50
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${item.completeness}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item.objectId)}
                          >
                            <Icon name="Edit" size={14} />
                            Редактировать
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGenerate(item.objectId)}
                            disabled={item.dataStatus === 'insufficient'}
                          >
                            <Icon name="FileDown" size={14} />
                            Сформировать
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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