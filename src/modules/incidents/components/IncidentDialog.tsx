import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Incident } from '@/types';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';

interface IncidentDialogProps {
  incident?: Incident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IncidentDialog({ incident, open, onOpenChange }: IncidentDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const { addIncident, updateIncident, sources, directions, fundingTypes, categories, subcategories, getSubcategoriesByCategory } = useIncidentsStore();
  const { organizations, productionSites, personnel, people, positions } = useSettingsStore();

  const [formData, setFormData] = useState({
    organizationId: '',
    productionSiteId: '',
    reportDate: '',
    sourceId: '',
    directionId: '',
    description: '',
    correctiveAction: '',
    fundingTypeId: '',
    categoryId: '',
    subcategoryId: '',
    responsiblePersonnelId: '',
    plannedDate: '',
    completedDate: '',
    notes: ''
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        organizationId: incident.organizationId,
        productionSiteId: incident.productionSiteId,
        reportDate: incident.reportDate,
        sourceId: incident.sourceId,
        directionId: incident.directionId,
        description: incident.description,
        correctiveAction: incident.correctiveAction,
        fundingTypeId: incident.fundingTypeId,
        categoryId: incident.categoryId,
        subcategoryId: incident.subcategoryId,
        responsiblePersonnelId: incident.responsiblePersonnelId,
        plannedDate: incident.plannedDate,
        completedDate: incident.completedDate || '',
        notes: incident.notes || ''
      });
    } else {
      setFormData({
        organizationId: '',
        productionSiteId: '',
        reportDate: new Date().toISOString().split('T')[0],
        sourceId: '',
        directionId: '',
        description: '',
        correctiveAction: '',
        fundingTypeId: '',
        categoryId: '',
        subcategoryId: '',
        responsiblePersonnelId: '',
        plannedDate: '',
        completedDate: '',
        notes: ''
      });
    }
  }, [incident]);

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
    ? getSubcategoriesByCategory(formData.categoryId).filter(s => s.status === 'active')
    : [];

  const handleSubmit = () => {
    if (!user?.tenantId) return;

    if (!formData.organizationId || !formData.productionSiteId || !formData.reportDate || 
        !formData.sourceId || !formData.directionId || !formData.description || 
        !formData.correctiveAction || !formData.fundingTypeId || !formData.categoryId || 
        !formData.subcategoryId || !formData.responsiblePersonnelId || !formData.plannedDate) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    const data = {
      tenantId: user.tenantId,
      organizationId: formData.organizationId,
      productionSiteId: formData.productionSiteId,
      reportDate: formData.reportDate,
      sourceId: formData.sourceId,
      directionId: formData.directionId,
      description: formData.description,
      correctiveAction: formData.correctiveAction,
      fundingTypeId: formData.fundingTypeId,
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId,
      responsiblePersonnelId: formData.responsiblePersonnelId,
      plannedDate: formData.plannedDate,
      completedDate: formData.completedDate || undefined,
      notes: formData.notes
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

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, categoryId, subcategoryId: '' });
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
          <div className="space-y-2">
            <Label htmlFor="organizationId">Организация *</Label>
            <Select value={formData.organizationId} onValueChange={(v) => setFormData({ ...formData, organizationId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите организацию" />
              </SelectTrigger>
              <SelectContent>
                {tenantOrganizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionSiteId">Производственная площадка *</Label>
            <Select value={formData.productionSiteId} onValueChange={(v) => setFormData({ ...formData, productionSiteId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите площадку" />
              </SelectTrigger>
              <SelectContent>
                {tenantSites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportDate">Дата сообщения *</Label>
            <Input
              id="reportDate"
              type="date"
              value={formData.reportDate}
              onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceId">Источник сообщения *</Label>
            <Select value={formData.sourceId} onValueChange={(v) => setFormData({ ...formData, sourceId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите источник" />
              </SelectTrigger>
              <SelectContent>
                {activeSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="directionId">Направление деятельности *</Label>
            <Select value={formData.directionId} onValueChange={(v) => setFormData({ ...formData, directionId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите направление" />
              </SelectTrigger>
              <SelectContent>
                {activeDirections.map((dir) => (
                  <SelectItem key={dir.id} value={dir.id}>{dir.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Описание несоответствия *</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Подробное описание выявленного отклонения"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="correctiveAction">Корректирующее действие *</Label>
            <Textarea
              id="correctiveAction"
              rows={3}
              value={formData.correctiveAction}
              onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
              placeholder="Описание мероприятий по устранению"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fundingTypeId">Обеспечение выполнения работ *</Label>
            <Select value={formData.fundingTypeId} onValueChange={(v) => setFormData({ ...formData, fundingTypeId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {activeFundingTypes.map((fund) => (
                  <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Категория несоответствия *</Label>
            <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {activeCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="subcategoryId">Подкатегория несоответствия *</Label>
            <Select 
              value={formData.subcategoryId} 
              onValueChange={(v) => setFormData({ ...formData, subcategoryId: v })}
              disabled={!formData.categoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.categoryId ? "Выберите подкатегорию" : "Сначала выберите категорию"} />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="responsiblePersonnelId">Ответственный за выполнение *</Label>
            <Select value={formData.responsiblePersonnelId} onValueChange={(v) => setFormData({ ...formData, responsiblePersonnelId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {tenantPersonnel.map((pers) => {
                  const info = getPersonnelFullInfo(pers, people, positions);
                  return (
                    <SelectItem key={pers.id} value={pers.id}>
                      {info.fullName} — {info.position}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedDate">Плановая дата закрытия *</Label>
            <Input
              id="plannedDate"
              type="date"
              value={formData.plannedDate}
              onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completedDate">Фактическая дата выполнения</Label>
            <Input
              id="completedDate"
              type="date"
              value={formData.completedDate}
              onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="notes">Примечание</Label>
            <Textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация"
            />
          </div>
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