import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Organization, ProductionSite } from '@/types';

interface BasicInfoSectionProps {
  organizationId: string;
  productionSiteId: string;
  reportDate: string;
  sourceId: string;
  organizations: Organization[];
  sites: ProductionSite[];
  sources: Array<{ id: string; name: string }>;
  onUpdate: (field: string, value: string) => void;
}

export default function BasicInfoSection({
  organizationId,
  productionSiteId,
  reportDate,
  sourceId,
  organizations,
  sites,
  sources,
  onUpdate
}: BasicInfoSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="organizationId">Организация *</Label>
        <Select value={organizationId} onValueChange={(v) => onUpdate('organizationId', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите организацию" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="productionSiteId">Производственная площадка *</Label>
        <Select value={productionSiteId} onValueChange={(v) => onUpdate('productionSiteId', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите площадку" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
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
          value={reportDate}
          onChange={(e) => onUpdate('reportDate', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceId">Источник сообщения *</Label>
        <Select value={sourceId} onValueChange={(v) => onUpdate('sourceId', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите источник" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
