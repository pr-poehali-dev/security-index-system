import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Incident } from '@/types';
import { useIncidentForm } from '../hooks/useIncidentForm';
import BasicInfoSection from './incident-form/BasicInfoSection';
import DescriptionSection from './incident-form/DescriptionSection';
import CategorySection from './incident-form/CategorySection';
import ResponsibilitySection from './incident-form/ResponsibilitySection';

interface IncidentDialogProps {
  incident?: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IncidentDialog({ incident, open, onOpenChange }: IncidentDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const addIncident = useIncidentsStore((state) => state.addIncident);
  const updateIncident = useIncidentsStore((state) => state.updateIncident);
  const sources = useIncidentsStore((state) => state.sources);
  const directions = useIncidentsStore((state) => state.directions);
  const fundingTypes = useIncidentsStore((state) => state.fundingTypes);
  const categories = useIncidentsStore((state) => state.categories);
  const subcategories = useIncidentsStore((state) => state.subcategories);
  const { organizations, productionSites, personnel, people, positions } = useSettingsStore();

  const { formData, updateField, handleCategoryChange, validateForm } = useIncidentForm(incident);

  const tenantOrganizations = user?.tenantId 
    ? organizations.filter(o => o.tenantId === user.tenantId && o.status === 'active')
    : [];

  const tenantSites = user?.tenantId
    ? productionSites.filter(s => s.tenantId === user.tenantId)
    : [];

  const tenantPersonnel = user?.tenantId
    ? personnel.filter(p => p.tenantId === user.tenantId && p.personnelType === 'employee' && p.status === 'active')
    : [];

  const activeSources = sources.filter(s => s.status === 'active');
  const activeDirections = directions.filter(d => d.status === 'active');
  const activeFundingTypes = fundingTypes.filter(f => f.status === 'active');
  const activeCategories = categories.filter(c => c.status === 'active');
  
  const availableSubcategories = formData.categoryId 
    ? subcategories.filter(s => s.categoryId === formData.categoryId && s.status === 'active')
    : [];

  const handleSubmit = () => {
    if (!user?.tenantId) return;

    if (!validateForm()) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    const data = {
      tenantId: user.tenantId,
      ...formData,
      completedDate: formData.completedDate || undefined,
    };

    if (incident) {
      updateIncident(incident.id, data);
      toast({ title: 'Инцидент обновлен' });
    } else {
      addIncident(data);
      toast({ title: 'Инцидент добавлен' });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{incident ? 'Редактировать инцидент' : 'Добавить инцидент'}</DialogTitle>
          <DialogDescription>
            Заполните информацию о выявленном несоответствии/отклонении
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <BasicInfoSection
            organizationId={formData.organizationId}
            productionSiteId={formData.productionSiteId}
            reportDate={formData.reportDate}
            sourceId={formData.sourceId}
            organizations={tenantOrganizations}
            sites={tenantSites}
            sources={activeSources}
            onUpdate={updateField}
          />

          <DescriptionSection
            directionId={formData.directionId}
            description={formData.description}
            correctiveAction={formData.correctiveAction}
            notes={formData.notes}
            directions={activeDirections}
            onUpdate={updateField}
          />

          <CategorySection
            categoryId={formData.categoryId}
            subcategoryId={formData.subcategoryId}
            fundingTypeId={formData.fundingTypeId}
            categories={activeCategories}
            subcategories={availableSubcategories}
            fundingTypes={activeFundingTypes}
            onCategoryChange={handleCategoryChange}
            onUpdate={updateField}
          />

          <ResponsibilitySection
            responsiblePersonnelId={formData.responsiblePersonnelId}
            plannedDate={formData.plannedDate}
            completedDate={formData.completedDate}
            personnel={tenantPersonnel}
            people={people}
            positions={positions}
            onUpdate={updateField}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            {incident ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}