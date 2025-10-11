import { useState, useMemo } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import AuditFiltersCard from './AuditFiltersCard';
import AuditHistoryCard from './AuditHistoryCard';
import { generateAuditReportPrint, generateAuditReportPDF } from '../utils/auditReportGenerator';

export default function AuditHistoryTab() {
  const { audits, checklists } = useChecklistsStore();
  const { organizations } = useOrganizationsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [checklistFilter, setChecklistFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateeTo] = useState('');

  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const checklist = checklists.find(c => c.id === audit.checklistId);
      const organization = organizations.find(o => o.id === audit.organizationId);

      const matchesSearch = 
        checklist?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organization?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
      const matchesOrganization = organizationFilter === 'all' || audit.organizationId === organizationFilter;
      const matchesChecklist = checklistFilter === 'all' || audit.checklistId === checklistFilter;

      const matchesDateFrom = !dateFrom || new Date(audit.scheduledDate) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(audit.scheduledDate) <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesOrganization && matchesChecklist && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => {
      const dateA = new Date(a.completedDate || a.scheduledDate);
      const dateB = new Date(b.completedDate || b.scheduledDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [audits, checklists, organizations, searchQuery, statusFilter, organizationFilter, checklistFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setOrganizationFilter('all');
    setChecklistFilter('all');
    setDateFrom('');
    setDateeTo('');
  };

  const handlePrintReport = (audit: typeof audits[0]) => {
    const checklist = checklists.find(c => c.id === audit.checklistId);
    const organization = organizations.find(o => o.id === audit.organizationId);
    generateAuditReportPrint(audit, checklist, organization);
  };

  const handleDownloadPDF = (audit: typeof audits[0]) => {
    const checklist = checklists.find(c => c.id === audit.checklistId);
    const organization = organizations.find(o => o.id === audit.organizationId);
    generateAuditReportPDF(audit, checklist, organization);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">История аудитов</h2>
        
        <AuditFiltersCard
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          organizationFilter={organizationFilter}
          checklistFilter={checklistFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          filteredCount={filteredAudits.length}
          totalCount={audits.length}
          organizations={organizations}
          checklists={checklists}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onOrganizationChange={setOrganizationFilter}
          onChecklistChange={setChecklistFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateeTo}
          onClearFilters={clearFilters}
        />
      </div>

      <div className="space-y-4">
        {filteredAudits.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="Search" className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Аудиты не найдены</p>
              <p className="text-sm text-gray-400 mt-2">Попробуйте изменить параметры фильтрации</p>
            </CardContent>
          </Card>
        ) : (
          filteredAudits.map(audit => {
            const checklist = checklists.find(c => c.id === audit.checklistId);
            const organization = organizations.find(o => o.id === audit.organizationId);

            return (
              <AuditHistoryCard
                key={audit.id}
                audit={audit}
                checklist={checklist}
                organization={organization}
                onPrintReport={handlePrintReport}
                onDownloadPDF={handleDownloadPDF}
              />
            );
          })
        )}
      </div>
    </div>
  );
}