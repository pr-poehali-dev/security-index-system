import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import { useCertificationStore } from '@/stores/certificationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import BulkIssueCertificatesDialog from './BulkIssueCertificatesDialog';
import ManualCertificateDialog from './ManualCertificateDialog';
import CertificatesFilters from '../registry/CertificatesFilters';
import CertificatesTable from '../registry/CertificatesTable';
import GroupedCertificatesView from '../registry/GroupedCertificatesView';
import DocumentViewerDialog from '../registry/DocumentViewerDialog';
import { useCertificatesExport } from '../registry/useCertificatesExport';

const statusLabels = {
  issued: 'Выдано',
  delivered: 'Передано клиенту',
  synced: 'Синхронизировано'
};

const statusColors = {
  issued: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  synced: 'bg-emerald-100 text-emerald-800'
};

const categoryLabels = {
  industrial_safety: 'Промбезопасность',
  energy_safety: 'Энергобезопасность',
  labor_safety: 'Охрана труда',
  ecology: 'Экология'
};

export default function IssuedCertificatesRegistry() {
  const { issuedCertificates, syncCertificateToAttestation } = useTrainingCenterStore();
  const { addCertification } = useCertificationStore();
  const { organizations = [], personnel = [] } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [groupByOrganization, setGroupByOrganization] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);

  const filteredCertificates = issuedCertificates.filter((cert) => {
    const matchesSearch = 
      cert.personnelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.programName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || cert.category === categoryFilter;
    const matchesOrganization = organizationFilter === 'all' || cert.organizationId === organizationFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesOrganization;
  });

  const groupedByOrganization = groupByOrganization
    ? filteredCertificates.reduce((acc, cert) => {
        const orgId = cert.organizationId || 'no-org';
        if (!acc[orgId]) {
          acc[orgId] = [];
        }
        acc[orgId].push(cert);
        return acc;
      }, {} as Record<string, typeof filteredCertificates>)
    : null;

  const uniqueOrganizations = Array.from(
    new Set(
      issuedCertificates
        .filter(cert => cert.organizationId)
        .map(cert => cert.organizationId)
    )
  )
    .map(orgId => organizations.find(org => org.id === orgId))
    .filter(Boolean);

  const handleSync = (certificateId: string) => {
    const attestationCert = syncCertificateToAttestation(certificateId);
    if (attestationCert) {
      addCertification(attestationCert);
      alert('Удостоверение успешно синхронизировано в систему учета аттестаций!');
    }
  };

  const { handleExport } = useCertificatesExport(filteredCertificates, organizations, personnel);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Award" size={24} />
              Реестр выданных удостоверений
            </CardTitle>
            <CardDescription>
              Список всех удостоверений, выданных учебным центром
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Icon name="Download" size={18} />
              Экспорт
            </Button>
            <Button onClick={() => setManualDialogOpen(true)} variant="outline" className="gap-2">
              <Icon name="Plus" size={18} />
              Добавить вручную
            </Button>
            <Button onClick={() => setBulkDialogOpen(true)} className="gap-2">
              <Icon name="Upload" size={18} />
              Массовая загрузка
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CertificatesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          organizationFilter={organizationFilter}
          setOrganizationFilter={setOrganizationFilter}
          groupByOrganization={groupByOrganization}
          setGroupByOrganization={setGroupByOrganization}
          uniqueOrganizations={uniqueOrganizations}
        />

        {groupByOrganization && groupedByOrganization ? (
          <GroupedCertificatesView
            groupedByOrganization={groupedByOrganization}
            organizations={organizations}
            personnel={personnel}
            statusLabels={statusLabels}
            statusColors={statusColors}
            categoryLabels={categoryLabels}
            onViewDocument={setViewDocumentUrl}
            onSync={handleSync}
          />
        ) : (
          <CertificatesTable
            certificates={filteredCertificates}
            organizations={organizations}
            personnel={personnel}
            statusLabels={statusLabels}
            statusColors={statusColors}
            categoryLabels={categoryLabels}
            onViewDocument={setViewDocumentUrl}
            onSync={handleSync}
          />
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          Всего удостоверений: <span className="font-medium">{filteredCertificates.length}</span>
        </div>
      </CardContent>

      <BulkIssueCertificatesDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />
      
      <ManualCertificateDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        trainingCenterId="training-center-1"
      />

      <DocumentViewerDialog
        documentUrl={viewDocumentUrl}
        onClose={() => setViewDocumentUrl(null)}
      />
    </Card>
  );
}
