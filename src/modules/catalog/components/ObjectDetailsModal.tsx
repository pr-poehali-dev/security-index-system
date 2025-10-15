import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useCatalogStore } from '@/stores/catalogStore';
import ObjectGeneralTab from './ObjectGeneralTab';
import ObjectDatesTab from './ObjectDatesTab';
import ObjectDocumentsViewTab from './ObjectDocumentsViewTab';
import ObjectPersonnelWidget from './contractors/ObjectPersonnelWidget';
import type { IndustrialObject } from '@/types/catalog';
import { HAZARD_CLASS_SHORT_LABELS } from '@/constants/hazardClass';

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

export default function ObjectDetailsModal({ open, onOpenChange, object, onEdit }: ObjectDetailsModalProps) {
  const organizations = useCatalogStore((state) => state.organizations);
  const documents = useCatalogStore((state) => state.documents);
  
  const organization = object ? organizations.find(org => org.id === object.organizationId) : undefined;
  const allDocuments = useMemo(() => {
    if (!object) return [];
    const storeDocuments = documents.filter(doc => doc.objectId === object.id);
    const objectDocuments = object.documents || [];
    return [...storeDocuments, ...objectDocuments];
  }, [documents, object?.id, object?.documents]);
  
  if (!object) return null;

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
                  <Badge variant="outline">{HAZARD_CLASS_SHORT_LABELS[object.hazardClass]}</Badge>
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
          <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="general" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Info" size={20} />
              <span className="text-xs font-medium">Основное</span>
            </TabsTrigger>
            <TabsTrigger value="dates" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Calendar" size={20} />
              <span className="text-xs font-medium text-center leading-tight">Контроль<br/>сроков</span>
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Users" size={20} />
              <span className="text-xs font-medium">Персонал</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="FileText" size={20} />
              <span className="text-xs font-medium">Документы ({allDocuments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <ObjectGeneralTab object={object} organization={organization} />
          </TabsContent>

          <TabsContent value="dates" className="mt-4">
            <ObjectDatesTab object={object} />
          </TabsContent>

          <TabsContent value="personnel" className="mt-4">
            <ObjectPersonnelWidget 
              objectId={object.id} 
              objectName={object.name}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <ObjectDocumentsViewTab 
              documents={allDocuments}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}