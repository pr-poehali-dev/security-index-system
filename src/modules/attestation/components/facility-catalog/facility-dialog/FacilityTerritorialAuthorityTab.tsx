import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TerritorialAuthority } from '@/types/facilities';
import Icon from '@/components/ui/icon';

interface FacilityTerritorialAuthorityTabProps {
  territorialAuthorityId?: string;
  territorialAuthorityName?: string;
  authorities: TerritorialAuthority[];
  onChange: (id: string, name: string) => void;
}

export default function FacilityTerritorialAuthorityTab({
  territorialAuthorityId,
  authorities,
  onChange,
}: FacilityTerritorialAuthorityTabProps) {
  const selectedAuthority = authorities.find(a => a.id === territorialAuthorityId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="territorialAuthority">Территориальный орган Ростехнадзора</Label>
        <Select
          value={territorialAuthorityId || ''}
          onValueChange={(value) => {
            const authority = authorities.find(a => a.id === value);
            onChange(value, authority?.fullName || '');
          }}
        >
          <SelectTrigger id="territorialAuthority">
            <SelectValue placeholder="Выберите территориальный орган" />
          </SelectTrigger>
          <SelectContent>
            {authorities.map((authority) => (
              <SelectItem key={authority.id} value={authority.id}>
                {authority.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAuthority && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Icon name="Building2" size={18} />
            Информация о территориальном органе
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Полное наименование:</span>
              <span className="col-span-2 font-medium">{selectedAuthority.fullName}</span>
            </div>
            
            {selectedAuthority.shortName && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Краткое наименование:</span>
                <span className="col-span-2">{selectedAuthority.shortName}</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Код:</span>
              <span className="col-span-2 font-mono">{selectedAuthority.code}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Регион:</span>
              <span className="col-span-2">{selectedAuthority.region}</span>
            </div>
            
            {selectedAuthority.address && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Адрес:</span>
                <span className="col-span-2">{selectedAuthority.address}</span>
              </div>
            )}
            
            {selectedAuthority.phone && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Телефон:</span>
                <span className="col-span-2">{selectedAuthority.phone}</span>
              </div>
            )}
            
            {selectedAuthority.email && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="col-span-2">{selectedAuthority.email}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
