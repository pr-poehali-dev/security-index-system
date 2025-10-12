import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import CertificateTableRow from './CertificateTableRow';
import type { IssuedCertificate } from '@/stores/trainingCenterStore';
import type { Organization, Personnel } from '@/types';

interface GroupedCertificatesViewProps {
  groupedByOrganization: Record<string, IssuedCertificate[]>;
  organizations: Organization[];
  personnel: Personnel[];
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  categoryLabels: Record<string, string>;
  onViewDocument: (url: string) => void;
  onSync: (id: string) => void;
}

export default function GroupedCertificatesView({
  groupedByOrganization,
  organizations,
  personnel,
  statusLabels,
  statusColors,
  categoryLabels,
  onViewDocument,
  onSync
}: GroupedCertificatesViewProps) {
  return (
    <div className="space-y-6">
      {Object.entries(groupedByOrganization).map(([orgId, certs]) => {
        const org = organizations.find(o => o.id === orgId);
        const orgName = org?.name || (orgId === 'no-org' ? 'Без организации' : 'Не указана');
        
        return (
          <div key={orgId} className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Icon name="Building2" size={18} />
              <h3 className="font-semibold">{orgName}</h3>
              <Badge variant="secondary" className="ml-2">
                {certs.length} {certs.length === 1 ? 'удостоверение' : 'удостоверений'}
              </Badge>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата выдачи</TableHead>
                    <TableHead>ФИО обучающегося</TableHead>
                    <TableHead>Программа</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Номер удостоверения</TableHead>
                    <TableHead>Протокол</TableHead>
                    <TableHead>Срок действия</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Документы</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.map((cert) => (
                    <CertificateTableRow
                      key={cert.id}
                      cert={cert}
                      organizations={organizations}
                      personnel={personnel}
                      statusLabels={statusLabels}
                      statusColors={statusColors}
                      categoryLabels={categoryLabels}
                      onViewDocument={onViewDocument}
                      onSync={onSync}
                      showOrganization={false}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
