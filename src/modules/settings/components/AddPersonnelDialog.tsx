import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { EducationLevel, PersonnelType } from '@/types';

interface AddPersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CertificationForm {
  competencyId: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber: string;
  issuedBy: string;
}

export default function AddPersonnelDialog({ open, onOpenChange }: AddPersonnelDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { 
    addPerson, 
    addPersonnel,
    addCertification,
    getOrganizationsByTenant,
    getExternalOrganizationsByType,
    getDepartmentsByOrganization,
    getPositionsByTenant,
    getCompetenciesDirByTenant
  } = useSettingsStore();
  const { toast } = useToast();

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);
  const contractorOrgs = getExternalOrganizationsByType(user!.tenantId!, 'contractor');
  const tenantPositions = getPositionsByTenant(user!.tenantId!);
  const tenantCompetencies = getCompetenciesDirByTenant(user!.tenantId!);

  const [personnelType, setPersonnelType] = useState<PersonnelType>('employee');

  const [personData, setPersonData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    snils: '',
    inn: '',
    email: '',
    phone: '',
    address: '',
    educationLevel: 'no_data' as EducationLevel
  });

  const [personnelData, setPersonnelData] = useState({
    organizationId: '',
    departmentId: '',
    positionId: '',
    role: 'Manager' as 'Auditor' | 'Manager' | 'Director' | 'Contractor',
    hireDate: '',
    requiredCompetencies: [] as string[]
  });

  const [certifications, setCertifications] = useState<CertificationForm[]>([]);

  const departments = personnelData.organizationId 
    ? getDepartmentsByOrganization(personnelData.organizationId)
    : [];

  const addCertificationRow = () => {
    setCertifications([...certifications, {
      competencyId: '',
      issueDate: '',
      expiryDate: '',
      protocolNumber: '',
      issuedBy: ''
    }]);
  };

  const removeCertificationRow = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, field: keyof CertificationForm, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personData.lastName || !personData.firstName || !personnelData.positionId || !personnelData.organizationId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля: Фамилия, Имя, Организация, Должность',
        variant: 'destructive'
      });
      return;
    }

    const personId = `person-${Date.now()}`;
    
    addPerson({
      ...personData,
      tenantId: user!.tenantId!,
      status: 'active'
    });

    addPersonnel({
      tenantId: user!.tenantId!,
      personId,
      positionId: personnelData.positionId,
      organizationId: personnelData.organizationId,
      departmentId: personnelData.departmentId || undefined,
      personnelType,
      role: personnelType === 'contractor' ? 'Contractor' : personnelData.role,
      requiredCompetencies: personnelData.requiredCompetencies.length > 0 ? personnelData.requiredCompetencies : undefined,
      status: 'active',
      hireDate: personnelData.hireDate || undefined
    });

    certifications.forEach(cert => {
      if (cert.competencyId && cert.issueDate && cert.expiryDate && cert.protocolNumber) {
        addCertification({
          tenantId: user!.tenantId!,
          personId,
          competencyId: cert.competencyId,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          protocolNumber: cert.protocolNumber,
          issuedBy: cert.issuedBy || undefined
        });
      }
    });

    toast({
      title: 'Успешно',
      description: personnelType === 'employee' ? 'Сотрудник добавлен в систему' : 'Сотрудник подрядчика добавлен в систему'
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setPersonnelType('employee');
    setPersonData({
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: '',
      snils: '',
      inn: '',
      email: '',
      phone: '',
      address: '',
      educationLevel: 'no_data'
    });
    setPersonnelData({
      organizationId: '',
      departmentId: '',
      positionId: '',
      role: 'Manager',
      hireDate: '',
      requiredCompetencies: []
    });
    setCertifications([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить сотрудника</DialogTitle>
          <DialogDescription>
            Заполните личные данные, должность и аттестации сотрудника
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label className="text-base font-semibold mb-3 block">Тип персонала</Label>
            <RadioGroup value={personnelType} onValueChange={(value: PersonnelType) => {
              setPersonnelType(value);
              setPersonnelData({ ...personnelData, organizationId: '', departmentId: '', role: value === 'contractor' ? 'Contractor' : 'Manager' });
            }}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent" onClick={() => {
                  setPersonnelType('employee');
                  setPersonnelData({ ...personnelData, organizationId: '', departmentId: '', role: 'Manager' });
                }}>
                  <RadioGroupItem value="employee" id="employee" />
                  <div className="flex-1">
                    <Label htmlFor="employee" className="cursor-pointer font-medium">Штатный сотрудник</Label>
                    <p className="text-xs text-muted-foreground mt-1">Сотрудник вашей организации</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent" onClick={() => {
                  setPersonnelType('contractor');
                  setPersonnelData({ ...personnelData, organizationId: '', departmentId: '', role: 'Contractor' });
                }}>
                  <RadioGroupItem value="contractor" id="contractor" />
                  <div className="flex-1">
                    <Label htmlFor="contractor" className="cursor-pointer font-medium">Сотрудник подрядчика</Label>
                    <p className="text-xs text-muted-foreground mt-1">Работник внешней организации</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="personal" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="User" size={20} />
                <span className="text-xs font-medium text-center leading-tight">Личные<br/>данные</span>
              </TabsTrigger>
              <TabsTrigger value="position" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="Briefcase" size={20} />
                <span className="text-xs font-medium">Должность</span>
              </TabsTrigger>
              <TabsTrigger value="certifications" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="Award" size={20} />
                <span className="text-xs font-medium">Аттестации</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия <span className="text-destructive">*</span></Label>
                  <Input
                    id="lastName"
                    value={personData.lastName}
                    onChange={(e) => setPersonData({ ...personData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя <span className="text-destructive">*</span></Label>
                  <Input
                    id="firstName"
                    value={personData.firstName}
                    onChange={(e) => setPersonData({ ...personData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    value={personData.middleName}
                    onChange={(e) => setPersonData({ ...personData, middleName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Дата рождения</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={personData.birthDate}
                    onChange={(e) => setPersonData({ ...personData, birthDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Образование</Label>
                  <Select
                    value={personData.educationLevel}
                    onValueChange={(value: EducationLevel) => setPersonData({ ...personData, educationLevel: value })}
                  >
                    <SelectTrigger id="educationLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="higher">Высшее</SelectItem>
                      <SelectItem value="secondary">Среднее</SelectItem>
                      <SelectItem value="no_data">Нет данных</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="snils">СНИЛС</Label>
                  <Input
                    id="snils"
                    value={personData.snils}
                    onChange={(e) => setPersonData({ ...personData, snils: e.target.value })}
                    placeholder="123-456-789 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН</Label>
                  <Input
                    id="inn"
                    value={personData.inn}
                    onChange={(e) => setPersonData({ ...personData, inn: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personData.email}
                    onChange={(e) => setPersonData({ ...personData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={personData.phone}
                    onChange={(e) => setPersonData({ ...personData, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  value={personData.address}
                  onChange={(e) => setPersonData({ ...personData, address: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="position" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationId">
                    {personnelType === 'employee' ? 'Организация' : 'Организация-подрядчик'} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={personnelData.organizationId}
                    onValueChange={(value) => setPersonnelData({ ...personnelData, organizationId: value, departmentId: '' })}
                    required
                  >
                    <SelectTrigger id="organizationId">
                      <SelectValue placeholder={personnelType === 'employee' ? 'Выберите организацию' : 'Выберите подрядчика'} />
                    </SelectTrigger>
                    <SelectContent>
                      {personnelType === 'employee' 
                        ? tenantOrgs.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))
                        : contractorOrgs.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {personnelType === 'employee' && (
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Подразделение</Label>
                    <Select
                      value={personnelData.departmentId}
                      onValueChange={(value) => setPersonnelData({ ...personnelData, departmentId: value })}
                      disabled={!personnelData.organizationId}
                    >
                      <SelectTrigger id="departmentId">
                        <SelectValue placeholder="Выберите подразделение" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positionId">Должность <span className="text-destructive">*</span></Label>
                  <Select
                    value={personnelData.positionId}
                    onValueChange={(value) => setPersonnelData({ ...personnelData, positionId: value })}
                    required
                  >
                    <SelectTrigger id="positionId">
                      <SelectValue placeholder="Выберите должность" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenantPositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Роль в системе</Label>
                  {personnelType === 'contractor' ? (
                    <Input
                      id="role"
                      value="Подрядчик (только чтение)"
                      disabled
                      className="bg-muted"
                    />
                  ) : (
                    <Select
                      value={personnelData.role}
                      onValueChange={(value: 'Auditor' | 'Manager' | 'Director') => setPersonnelData({ ...personnelData, role: value })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Менеджер</SelectItem>
                        <SelectItem value="Director">Руководитель</SelectItem>
                        <SelectItem value="Auditor">Аудитор</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Дата приема</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={personnelData.hireDate}
                  onChange={(e) => setPersonnelData({ ...personnelData, hireDate: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Аттестации сотрудника</h4>
                  <p className="text-sm text-muted-foreground">Добавьте аттестации по областям</p>
                </div>
                <Button type="button" size="sm" onClick={addCertificationRow}>
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить
                </Button>
              </div>

              {certifications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Нет аттестаций. Нажмите "Добавить" для создания.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {certifications.map((cert, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Аттестация #{index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertificationRow(index)}
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label>Область аттестации</Label>
                          <Select
                            value={cert.competencyId}
                            onValueChange={(value) => updateCertification(index, 'competencyId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите область" />
                            </SelectTrigger>
                            <SelectContent>
                              {tenantCompetencies.map((comp) => (
                                <SelectItem key={comp.id} value={comp.id}>
                                  {comp.code} — {comp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Дата аттестации</Label>
                            <Input
                              type="date"
                              value={cert.issueDate}
                              onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Срок окончания</Label>
                            <Input
                              type="date"
                              value={cert.expiryDate}
                              onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Номер протокола</Label>
                            <Input
                              value={cert.protocolNumber}
                              onChange={(e) => updateCertification(index, 'protocolNumber', e.target.value)}
                              placeholder="№ 123/2024"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Кем выдано</Label>
                            <Input
                              value={cert.issuedBy}
                              onChange={(e) => updateCertification(index, 'issuedBy', e.target.value)}
                              placeholder="Ростехнадзор"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить сотрудника
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}