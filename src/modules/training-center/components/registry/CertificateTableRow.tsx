import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { IssuedCertificate } from '@/stores/trainingCenterStore';
import type { Organization, Personnel } from '@/types';

interface CertificateTableRowProps {
  cert: IssuedCertificate;
  organizations: Organization[];
  personnel: Personnel[];
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  categoryLabels: Record<string, string>;
  onViewDocument: (url: string) => void;
  onSync: (id: string) => void;
  showOrganization?: boolean;
}

const statusLabelsDefault = {
  issued: 'Выдано',
  delivered: 'Передано клиенту',
  synced: 'Синхронизировано'
};

const statusColorsDefault = {
  issued: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  synced: 'bg-emerald-100 text-emerald-800'
};

const categoryLabelsDefault = {
  industrial_safety: 'Промбезопасность',
  energy_safety: 'Энергобезопасность',
  labor_safety: 'Охрана труда',
  ecology: 'Экология'
};

export default function CertificateTableRow({
  cert,
  organizations,
  personnel,
  statusLabels = statusLabelsDefault,
  statusColors = statusColorsDefault,
  categoryLabels = categoryLabelsDefault,
  onViewDocument,
  onSync,
  showOrganization = true
}: CertificateTableRowProps) {
  const person = personnel.find(p => p.id === cert.personnelId);
  const organization = person?.organizationId 
    ? organizations.find(o => o.id === person.organizationId)
    : organizations.find(o => o.id === cert.organizationId);

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        {format(new Date(cert.issueDate), 'dd.MM.yyyy', { locale: ru })}
      </TableCell>
      <TableCell className="font-medium">{cert.personnelName}</TableCell>
      {showOrganization && (
        <TableCell>
          <div className="max-w-[200px]">
            <div className="font-medium truncate">
              {organization?.name || cert.organizationName || 'Не указана'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {organization?.inn || cert.organizationInn ? `ИНН: ${organization?.inn || cert.organizationInn}` : ''}
            </div>
          </div>
        </TableCell>
      )}
      <TableCell>
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{cert.programName}</div>
          <div className="text-xs text-muted-foreground truncate">{cert.area}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {categoryLabels[cert.category]}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-sm">{cert.certificateNumber}</TableCell>
      <TableCell>
        <div className="text-sm">
          <div className="font-medium">{cert.protocolNumber}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(cert.protocolDate), 'dd.MM.yyyy', { locale: ru })}
          </div>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {format(new Date(cert.expiryDate), 'dd.MM.yyyy', { locale: ru })}
      </TableCell>
      <TableCell>
        <Badge className={statusColors[cert.status]}>
          {statusLabels[cert.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {cert.certificateFileUrl && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => onViewDocument(cert.certificateFileUrl!)}
              title="Просмотр удостоверения"
            >
              <Icon name="FileText" size={16} />
            </Button>
          )}
          {cert.protocolFileUrl && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => onViewDocument(cert.protocolFileUrl!)}
              title="Просмотр протокола"
            >
              <Icon name="ScrollText" size={16} />
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {cert.status !== 'synced' && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => onSync(cert.id)}
          >
            <Icon name="RefreshCw" size={14} />
            Синхронизировать
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
