import { useState, useEffect } from 'react';
import { useContractorsStore } from '../../stores/contractorsStore';
import { useCatalogStore } from '@/stores/catalogStore';
import Icon from '@/components/ui/icon';
import AccessFilters from './AccessFilters';
import AccessTable from './AccessTable';
import AccessEmptyState from './AccessEmptyState';
import GrantAccessDialog from './GrantAccessDialog';
import RevokeAccessDialog from './RevokeAccessDialog';
import type { ContractorEmployeeObject } from '../../types/contractors';

const ObjectAccessManagement = () => {
  const {
    objectAccess,
    employees,
    contractors,
    fetchObjectAccess,
    grantObjectAccess,
    revokeObjectAccess,
    fetchEmployees,
    fetchContractors,
    loading,
  } = useContractorsStore();

  const { objects: catalogObjects, organizations } = useCatalogStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterObject, setFilterObject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<ContractorEmployeeObject | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    objectId: '',
    accessStart: new Date().toISOString().split('T')[0],
    accessEnd: '',
    workType: '',
    notes: '',
  });

  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    fetchObjectAccess();
    fetchEmployees();
    fetchContractors();
  }, [fetchObjectAccess, fetchEmployees, fetchContractors]);

  const handleGrantAccess = async () => {
    if (!formData.employeeId || !formData.objectId) return;

    await grantObjectAccess(formData);
    setIsGrantDialogOpen(false);
    resetForm();
  };

  const handleRevokeAccess = async () => {
    if (!selectedAccess) return;

    await revokeObjectAccess(selectedAccess.id, revokeReason);
    setIsRevokeDialogOpen(false);
    setSelectedAccess(null);
    setRevokeReason('');
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      objectId: '',
      accessStart: new Date().toISOString().split('T')[0],
      accessEnd: '',
      workType: '',
      notes: '',
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRevokeClick = (access: ContractorEmployeeObject) => {
    setSelectedAccess(access);
    setIsRevokeDialogOpen(true);
  };

  const handleCancelGrant = () => {
    setIsGrantDialogOpen(false);
    resetForm();
  };

  const handleCancelRevoke = () => {
    setSelectedAccess(null);
    setRevokeReason('');
  };

  const filteredAccess = objectAccess.filter((access) => {
    const employee = employees.find((e) => e.id === access.employeeId);
    const object = catalogObjects.find((o) => o.id === access.objectId);

    const matchesSearch =
      employee?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object?.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesObject = filterObject === 'all' || access.objectId === filterObject;
    const matchesStatus = filterStatus === 'all' || access.accessStatus === filterStatus;

    return matchesSearch && matchesObject && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AccessFilters
        searchQuery={searchQuery}
        filterObject={filterObject}
        filterStatus={filterStatus}
        catalogObjects={catalogObjects}
        onSearchChange={setSearchQuery}
        onObjectFilterChange={setFilterObject}
        onStatusFilterChange={setFilterStatus}
        onGrantAccess={() => setIsGrantDialogOpen(true)}
      />

      {filteredAccess.length === 0 ? (
        <AccessEmptyState onGrantAccess={() => setIsGrantDialogOpen(true)} />
      ) : (
        <AccessTable
          filteredAccess={filteredAccess}
          employees={employees}
          contractors={contractors}
          catalogObjects={catalogObjects}
          onRevokeClick={handleRevokeClick}
        />
      )}

      <GrantAccessDialog
        open={isGrantDialogOpen}
        onOpenChange={setIsGrantDialogOpen}
        formData={formData}
        employees={employees}
        contractors={contractors}
        catalogObjects={catalogObjects}
        organizations={organizations}
        onFormChange={handleFormChange}
        onSubmit={handleGrantAccess}
        onCancel={handleCancelGrant}
      />

      <RevokeAccessDialog
        open={isRevokeDialogOpen}
        onOpenChange={setIsRevokeDialogOpen}
        revokeReason={revokeReason}
        onReasonChange={setRevokeReason}
        onConfirm={handleRevokeAccess}
        onCancel={handleCancelRevoke}
      />
    </div>
  );
};

export default ObjectAccessManagement;