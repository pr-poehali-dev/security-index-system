import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useCatalogStore } from '@/stores/catalogStore';
import type { IndustrialObject } from '@/types/catalog';

interface ObjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  object: IndustrialObject | null;
  onEdit?: (object: IndustrialObject) => void;
}

const getStatusColor = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'conservation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'liquidated': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
};

const getStatusLabel = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'Активен';
    case 'conservation': return 'На консервации';
    case 'liquidated': return 'Ликвидирован';
  }
};

const getTypeLabel = (type: IndustrialObject['type']) => {
  switch (type) {
    case 'opo': return 'ОПО';
    case 'gts': return 'ГТС';
    case 'building': return 'Здание';
  }
};

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string | undefined }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon name={icon} size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
};

export default function ObjectDetailsModal({ open, onOpenChange, object, onEdit }: ObjectDetailsModalProps) {
  const { organizations, getDocumentsByObject } = useCatalogStore();
  
  if (!object) return null;
  
  const organization = organizations.find(org => org.id === object.organizationId);
  const documents = getDocumentsByObject(object.id);

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isDateExpired = (date: string | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isDateSoon = (date: string | undefined) => {
    if (!date) return false;
    const diffDays = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays >= 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{object.name}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{object.registrationNumber}</Badge>
                <Badge variant="outline">{getTypeLabel(object.type)}</Badge>
                {object.hazardClass && (
                  <Badge variant="outline">Класс {object.hazardClass}</Badge>
                )}
                <Badge className={getStatusColor(object.status)}>
                  {getStatusLabel(object.status)}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(object)}
            >
              <Icon name="Edit" className="mr-2" size={16} />
              Редактировать
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Основное</TabsTrigger>
            <TabsTrigger value="dates">Контроль сроков</TabsTrigger>
            <TabsTrigger value="documents">
              Документы
              {documents.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {documents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Info" size={18} />
                  Общая информация
                </h3>
                <div className="space-y-1 divide-y">
                  <InfoRow
                    icon="Building"
                    label="Организация"
                    value={organization?.name}
                  />
                  <InfoRow
                    icon="Tag"
                    label="Категория"
                    value={object.category}
                  />
                  <InfoRow
                    icon="Calendar"
                    label="Дата ввода в эксплуатацию"
                    value={formatDate(object.commissioningDate)}
                  />
                  <InfoRow
                    icon="User"
                    label="Ответственное лицо"
                    value={object.responsiblePerson}
                  />
                  {object.description && (
                    <InfoRow
                      icon="FileText"
                      label="Описание"
                      value={object.description}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="MapPin" size={18} />
                  Местоположение
                </h3>
                <div className="space-y-1 divide-y">
                  <InfoRow
                    icon="MapPin"
                    label="Адрес"
                    value={object.location.address}
                  />
                  {object.location.coordinates && (
                    <>
                      <InfoRow
                        icon="Navigation"
                        label="Координаты"
                        value={`${object.location.coordinates.lat.toFixed(6)}, ${object.location.coordinates.lng.toFixed(6)}`}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Calendar" size={18} />
                  Даты экспертиз и диагностики
                </h3>
                <div className="space-y-4">
                  {object.nextExpertiseDate && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <Icon 
                        name="FileCheck" 
                        size={24} 
                        className={`flex-shrink-0 mt-0.5 ${
                          isDateExpired(object.nextExpertiseDate) 
                            ? 'text-red-500' 
                            : isDateSoon(object.nextExpertiseDate) 
                            ? 'text-amber-500' 
                            : 'text-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">Экспертиза промышленной безопасности (ЭПБ)</p>
                        <p className={`text-lg font-semibold mt-1 ${
                          isDateExpired(object.nextExpertiseDate) 
                            ? 'text-red-600' 
                            : isDateSoon(object.nextExpertiseDate) 
                            ? 'text-amber-600' 
                            : ''
                        }`}>
                          {formatDate(object.nextExpertiseDate)}
                        </p>
                        {isDateExpired(object.nextExpertiseDate) && (
                          <Badge className="mt-2 bg-red-100 text-red-700">
                            <Icon name="AlertCircle" size={12} className="mr-1" />
                            Просрочено
                          </Badge>
                        )}
                        {isDateSoon(object.nextExpertiseDate) && !isDateExpired(object.nextExpertiseDate) && (
                          <Badge className="mt-2 bg-amber-100 text-amber-700">
                            <Icon name="Clock" size={12} className="mr-1" />
                            Скоро истекает
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {object.nextDiagnosticDate && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <Icon 
                        name="Stethoscope" 
                        size={24} 
                        className={`flex-shrink-0 mt-0.5 ${
                          isDateExpired(object.nextDiagnosticDate) 
                            ? 'text-red-500' 
                            : isDateSoon(object.nextDiagnosticDate) 
                            ? 'text-amber-500' 
                            : 'text-green-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">Техническое диагностирование</p>
                        <p className={`text-lg font-semibold mt-1 ${
                          isDateExpired(object.nextDiagnosticDate) 
                            ? 'text-red-600' 
                            : isDateSoon(object.nextDiagnosticDate) 
                            ? 'text-amber-600' 
                            : ''
                        }`}>
                          {formatDate(object.nextDiagnosticDate)}
                        </p>
                        {isDateExpired(object.nextDiagnosticDate) && (
                          <Badge className="mt-2 bg-red-100 text-red-700">
                            <Icon name="AlertCircle" size={12} className="mr-1" />
                            Просрочено
                          </Badge>
                        )}
                        {isDateSoon(object.nextDiagnosticDate) && !isDateExpired(object.nextDiagnosticDate) && (
                          <Badge className="mt-2 bg-amber-100 text-amber-700">
                            <Icon name="Clock" size={12} className="mr-1" />
                            Скоро истекает
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {object.nextTestDate && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <Icon 
                        name="Gauge" 
                        size={24} 
                        className={`flex-shrink-0 mt-0.5 ${
                          isDateExpired(object.nextTestDate) 
                            ? 'text-red-500' 
                            : isDateSoon(object.nextTestDate) 
                            ? 'text-amber-500' 
                            : 'text-purple-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">Испытания</p>
                        <p className={`text-lg font-semibold mt-1 ${
                          isDateExpired(object.nextTestDate) 
                            ? 'text-red-600' 
                            : isDateSoon(object.nextTestDate) 
                            ? 'text-amber-600' 
                            : ''
                        }`}>
                          {formatDate(object.nextTestDate)}
                        </p>
                        {isDateExpired(object.nextTestDate) && (
                          <Badge className="mt-2 bg-red-100 text-red-700">
                            <Icon name="AlertCircle" size={12} className="mr-1" />
                            Просрочено
                          </Badge>
                        )}
                        {isDateSoon(object.nextTestDate) && !isDateExpired(object.nextTestDate) && (
                          <Badge className="mt-2 bg-amber-100 text-amber-700">
                            <Icon name="Clock" size={12} className="mr-1" />
                            Скоро истекает
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {!object.nextExpertiseDate && !object.nextDiagnosticDate && !object.nextTestDate && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="Calendar" className="mx-auto mb-2" size={48} />
                      <p>Даты не указаны</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Icon name="FileText" size={18} />
                    Документация
                  </h3>
                  <Button size="sm" variant="outline">
                    <Icon name="Upload" className="mr-2" size={16} />
                    Загрузить документ
                  </Button>
                </div>

                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Icon name="File" size={24} className="text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.documentNumber && `№ ${doc.documentNumber} • `}
                            Выдан: {formatDate(doc.issueDate)}
                            {doc.expiryDate && ` • Действителен до: ${formatDate(doc.expiryDate)}`}
                          </p>
                          {doc.expiryDate && (
                            <Badge className={`mt-2 ${
                              doc.status === 'expired' 
                                ? 'bg-red-100 text-red-700' 
                                : doc.status === 'expiring_soon' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {doc.status === 'expired' && 'Истек'}
                              {doc.status === 'expiring_soon' && 'Истекает скоро'}
                              {doc.status === 'valid' && 'Действителен'}
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Icon name="Download" size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="FileText" className="mx-auto mb-2" size={48} />
                    <p>Документы не загружены</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
