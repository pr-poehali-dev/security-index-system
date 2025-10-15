import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCatalogStore } from '@/stores/catalogStore';

interface CharacteristicSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: CharacteristicField[];
}

interface CharacteristicField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  unit?: string;
  options?: string[];
}

const characteristicSections: CharacteristicSection[] = [
  {
    id: 'general',
    title: 'Общие сведения',
    description: 'Основная информация об ОПО',
    icon: 'Info',
    fields: [
      { id: 'reg_number', label: 'Регистрационный номер в реестре ОПО', type: 'text', required: true },
      { id: 'rtn_number', label: 'Номер в территориальном органе РТН', type: 'text' },
      { id: 'commissioning_date', label: 'Дата ввода в эксплуатацию', type: 'date', required: true },
      { id: 'last_change_date', label: 'Дата последнего изменения', type: 'date' },
      { id: 'owner', label: 'Эксплуатирующая организация', type: 'text', required: true },
      { id: 'owner_inn', label: 'ИНН организации', type: 'text', required: true },
    ],
  },
  {
    id: 'technical',
    title: 'Технические характеристики',
    description: 'Параметры оборудования и технологических процессов',
    icon: 'Settings',
    fields: [
      { id: 'capacity', label: 'Производственная мощность', type: 'number', unit: 'т/год' },
      { id: 'max_pressure', label: 'Максимальное рабочее давление', type: 'number', unit: 'МПа' },
      { id: 'max_temperature', label: 'Максимальная температура', type: 'number', unit: '°C' },
      { id: 'volume', label: 'Объем резервуаров/аппаратов', type: 'number', unit: 'м³' },
      { id: 'power', label: 'Установленная мощность', type: 'number', unit: 'кВт' },
      { id: 'equipment_count', label: 'Количество единиц оборудования', type: 'number' },
    ],
  },
  {
    id: 'substances',
    title: 'Опасные вещества',
    description: 'Перечень и количество обращающихся опасных веществ',
    icon: 'Flask',
    fields: [
      { id: 'substance_name', label: 'Наименование вещества', type: 'text', required: true },
      { id: 'substance_class', label: 'Класс опасности', type: 'select', options: ['I', 'II', 'III', 'IV'], required: true },
      { id: 'max_amount', label: 'Максимальное количество', type: 'number', unit: 'тонн', required: true },
      { id: 'storage_conditions', label: 'Условия хранения', type: 'text' },
      { id: 'cas_number', label: 'CAS-номер', type: 'text' },
    ],
  },
  {
    id: 'safety',
    title: 'Системы безопасности',
    description: 'Технические средства обеспечения безопасности',
    icon: 'ShieldCheck',
    fields: [
      { id: 'fire_system', label: 'Система пожаротушения', type: 'select', options: ['Автоматическая', 'Ручная', 'Комбинированная', 'Отсутствует'] },
      { id: 'gas_detection', label: 'Система газоанализа', type: 'select', options: ['Установлена', 'Не требуется', 'Планируется'] },
      { id: 'emergency_shutdown', label: 'Система ПАЗ', type: 'select', options: ['Автоматическая', 'Ручная', 'Отсутствует'] },
      { id: 'safety_valves', label: 'Предохранительные клапаны', type: 'number', unit: 'шт' },
      { id: 'monitoring_system', label: 'АСУТП/SCADA', type: 'select', options: ['Установлена', 'Частично', 'Отсутствует'] },
    ],
  },
  {
    id: 'documentation',
    title: 'Документация',
    description: 'Наличие и актуальность документов по ОПО',
    icon: 'FileText',
    fields: [
      { id: 'safety_declaration', label: 'Декларация промышленной безопасности', type: 'select', options: ['Действующая', 'Требует обновления', 'Не требуется'] },
      { id: 'expertise_date', label: 'Дата последней экспертизы ПБ', type: 'date' },
      { id: 'expertise_next', label: 'Следующая экспертиза ПБ', type: 'date' },
      { id: 'passport', label: 'Технический паспорт', type: 'select', options: ['Имеется', 'Требует обновления', 'Отсутствует'] },
      { id: 'instructions', label: 'Производственные инструкции', type: 'select', options: ['Актуальные', 'Требуют пересмотра'] },
    ],
  },
  {
    id: 'location',
    title: 'Расположение',
    description: 'Территориальное размещение ОПО',
    icon: 'MapPin',
    fields: [
      { id: 'region', label: 'Субъект РФ', type: 'text', required: true },
      { id: 'district', label: 'Район', type: 'text' },
      { id: 'city', label: 'Населенный пункт', type: 'text', required: true },
      { id: 'street', label: 'Улица, дом', type: 'text' },
      { id: 'coordinates_lat', label: 'Широта', type: 'number' },
      { id: 'coordinates_lng', label: 'Долгота', type: 'number' },
      { id: 'oktmo', label: 'Код ОКТМО', type: 'text' },
    ],
  },
];

export default function OpoCharacteristicsTab() {
  const { objects } = useCatalogStore();
  const [selectedObject, setSelectedObject] = useState<string | null>(
    objects.length > 0 ? objects[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredObjects = objects.filter((obj) =>
    obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    obj.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOpo = objects.find((obj) => obj.id === selectedObject);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Сведения характеризующие ОПО</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Детальная информация об опасных производственных объектах для РТН
          </p>
        </div>
        <Button>
          <Icon name="Download" size={16} />
          Выгрузить в РТН
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Выбор объекта</CardTitle>
            <CardDescription>Список ОПО для заполнения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск объекта..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredObjects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObject(obj.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedObject === obj.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon name="Building" size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{obj.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {obj.registrationNumber}
                      </div>
                      <Badge variant="outline" className="mt-1.5 text-xs">
                        {obj.hazardClass ? `Класс ${obj.hazardClass}` : 'Не указан'}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
              {filteredObjects.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Объекты не найдены
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {selectedOpo ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{selectedOpo.name}</CardTitle>
                    <CardDescription className="mt-1.5">
                      Рег. № {selectedOpo.registrationNumber} • {selectedOpo.location.address}
                    </CardDescription>
                  </div>
                  <Badge className="ml-4">
                    {selectedOpo.hazardClass ? `Класс ${selectedOpo.hazardClass}` : 'Не указан'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList className="w-full flex-wrap h-auto justify-start">
                    {characteristicSections.map((section) => (
                      <TabsTrigger key={section.id} value={section.id} className="gap-2">
                        <Icon name={section.icon} size={14} />
                        {section.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {characteristicSections.map((section) => (
                    <TabsContent key={section.id} value={section.id} className="space-y-4">
                      <div>
                        <h3 className="font-medium text-sm mb-1">{section.title}</h3>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                              {field.label}
                              {field.required && <span className="text-destructive">*</span>}
                            </label>
                            {field.type === 'select' ? (
                              <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                <option value="">Выберите...</option>
                                {field.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="relative">
                                <Input
                                  type={field.type}
                                  placeholder={`Введите ${field.label.toLowerCase()}`}
                                  className={field.unit ? 'pr-20' : ''}
                                />
                                {field.unit && (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {field.unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          Отменить
                        </Button>
                        <Button size="sm">
                          <Icon name="Save" size={14} />
                          Сохранить раздел
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Icon name="Building" size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Выберите объект</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Для заполнения сведений выберите ОПО из списка слева
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
