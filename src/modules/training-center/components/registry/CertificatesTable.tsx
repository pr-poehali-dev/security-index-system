import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CertificateTableRow from './CertificateTableRow';
import type { IssuedCertificate } from '@/stores/trainingCenterStore';
import type { Organization, Personnel } from '@/types';

interface CertificatesTableProps {
  certificates: IssuedCertificate[];
  organizations: Organization[];
  personnel: Personnel[];
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  categoryLabels: Record<string, string>;
  onViewDocument: (url: string) => void;
  onSync: (id: string) => void;
  selectedCertIds?: string[];
  onToggleSelection?: (certId: string) => void;
}

export default function CertificatesTable({
  certificates,
  organizations,
  personnel,
  statusLabels,
  statusColors,
  categoryLabels,
  onViewDocument,
  onSync,
  selectedCertIds = [],
  onToggleSelection
}: CertificatesTableProps) {
  const showCheckboxes = onToggleSelection !== undefined;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && <TableHead className="w-12"></TableHead>}
            <TableHead>Дата выдачи</TableHead>
            <TableHead>ФИО обучающегося</TableHead>
            <TableHead>Организация</TableHead>
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
          {certificates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCheckboxes ? 12 : 11} className="text-center py-8 text-muted-foreground">
                Удостоверения не найдены
              </TableCell>
            </TableRow>
          ) : (
            certificates.map((cert) => (
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
                showOrganization={true}
                isSelected={selectedCertIds.includes(cert.id)}
                onToggleSelection={onToggleSelection}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}