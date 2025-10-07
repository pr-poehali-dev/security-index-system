import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CertificationType {
  id: string;
  name: string;
  description: string;
  validityPeriod: number;
  category: string;
}

interface TrainingOrganization {
  id: string;
  name: string;
  inn: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

interface RequirementTemplate {
  id: string;
  positionName: string;
  department: string;
  requiredCertifications: string[];
}

const mockCertTypes: CertificationType[] = [
  {
    id: '1',
    name: 'Электробезопасность II группа',
    description: 'До 1000 В',
    validityPeriod: 12,
    category: 'Электробезопасность'
  },
  {
    id: '2',
    name: 'Электробезопасность III группа',
    description: 'До 1000 В',
    validityPeriod: 12,
    category: 'Электробезопасность'
  },
  {
    id: '3',
    name: 'Работы на высоте 1 группа',
    description: 'Без применения средств подмащивания',
    validityPeriod: 36,
    category: 'Работы на высоте'
  },
  {
    id: '4',
    name: 'Промышленная безопасность',
    description: 'Опасные производственные объекты',
    validityPeriod: 60,
    category: 'Промышленная безопасность'
  },
];

const mockOrganizations: TrainingOrganization[] = [
  {
    id: '1',
    name: 'УЦ "Профессионал"',
    inn: '7701234567',
    contactPerson: 'Сидорова Елена Петровна',
    phone: '+7 (495) 123-45-67',
    email: 'info@professional.ru',
    address: 'г. Москва, ул. Ленина, д. 10'
  },
  {
    id: '2',
    name: 'Центр охраны труда',
    inn: '7702345678',
    contactPerson: 'Иванов Петр Сергеевич',
    phone: '+7 (495) 234-56-78',
    email: 'ot@center.ru',
    address: 'г. Москва, пр-т Мира, д. 25'
  },
];

const mockTemplates: RequirementTemplate[] = [
  {
    id: '1',
    positionName: 'Инженер электрик',
    department: 'Энергетика',
    requiredCertifications: ['Электробезопасность IV группа', 'Работы на высоте 2 группа']
  },
  {
    id: '2',
    positionName: 'Техник',
    department: 'Ремонт',
    requiredCertifications: ['Электробезопасность III группа', 'Промышленная безопасность']
  },
];

export default function DirectoriesTab() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cert-types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cert-types" className="gap-2">
            <Icon name="Award" size={16} />
            Виды аттестаций
          </TabsTrigger>
          <TabsTrigger value="organizations" className="gap-2">
            <Icon name="Building2" size={16} />
            Учебные центры
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Icon name="FileCheck" size={16} />
            Шаблоны требований
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cert-types">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Виды аттестаций и допусков</CardTitle>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Добавить вид
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {mockCertTypes.map((cert) => (
                  <Card key={cert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{cert.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30">
                              {cert.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{cert.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="Clock" size={14} />
                              Срок действия: {cert.validityPeriod} мес.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Учебные центры и организации</CardTitle>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Добавить организацию
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию или ИНН..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {mockOrganizations.map((org) => (
                  <Card key={org.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{org.name}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="FileText" size={14} />
                              ИНН: {org.inn}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={14} />
                              {org.contactPerson}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Phone" size={14} />
                              {org.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Mail" size={14} />
                              {org.email}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                            <Icon name="MapPin" size={14} className="mt-0.5" />
                            {org.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Шаблоны требований по должностям</CardTitle>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Создать шаблон
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по должности..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {mockTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{template.positionName}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30">
                              {template.department}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Требуемые аттестации:</p>
                            <ul className="space-y-1">
                              {template.requiredCertifications.map((cert, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Icon name="CheckCircle2" size={14} className="text-emerald-600" />
                                  {cert}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Copy" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                        О шаблонах требований
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Создайте шаблоны требований для каждой должности, чтобы автоматически отслеживать
                        соответствие аттестаций сотрудников требованиям их должностей.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
