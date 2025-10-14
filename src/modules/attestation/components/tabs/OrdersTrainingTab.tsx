import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import DocumentFilters, { FilterValues } from '@/components/shared/DocumentFilters';
import { documentsFilterConfig } from '@/modules/attestation/utils/filterConfigs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnifiedDocumentDialog from '../UnifiedDocumentDialog';
import SendToTrainingCenterDialog from '../SendToTrainingCenterDialog';
import { useAuthStore } from '@/stores/authStore';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useTrainingsAttestationStore } from '@/stores/trainingsAttestationStore';
import { useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { migrateAllDocuments } from '@/utils/documentMigration';
import { statusLabels, statusColors } from '@/types/documentStatus';
import type { Document } from '@/stores/documentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { createOrderHandlers } from '../orders/orderHandlers';
import { createTrainingHandlers } from '../orders/trainingHandlers';
import { generateOrderAppendix, generateFullOrderReport } from '../../utils/orderExport';
import type { Order } from '@/stores/ordersStore';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';



export default function OrdersTrainingTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { documents, getDocumentsByTenant } = useDocumentsStore();
  const { orders, getOrdersByTenant } = useOrdersStore();
  const { trainings, getTrainingsByTenant } = useTrainingsAttestationStore();
  const { getOrdersByTenant: getAttestationOrders } = useAttestationOrdersStore();
  const { personnel, people, positions, getContractorsByType } = useSettingsStore();
  
  const legacyOrders = user?.tenantId ? getOrdersByTenant(user.tenantId) : [];
  const legacyTrainings = user?.tenantId ? getTrainingsByTenant(user.tenantId) : [];
  const legacyAttestationOrders = user?.tenantId ? getAttestationOrders(user.tenantId) : [];
  
  const migratedDocuments = useMemo(() => {
    if (documents.length === 0 && (legacyOrders.length > 0 || legacyTrainings.length > 0 || legacyAttestationOrders.length > 0)) {
      return migrateAllDocuments(legacyOrders, legacyTrainings, legacyAttestationOrders);
    }
    return user?.tenantId ? getDocumentsByTenant(user.tenantId) : [];
  }, [documents, legacyOrders, legacyTrainings, legacyAttestationOrders, user?.tenantId, getDocumentsByTenant]);
  
  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: '',
    type: 'all',
    status: 'all',
    sortBy: 'date',
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<'order' | 'training' | undefined>(undefined);
  const [showSendToTCDialog, setShowSendToTCDialog] = useState(false);
  const [selectedOrderForTC, setSelectedOrderForTC] = useState<Order | null>(null);

  const trainingOrgs = user?.tenantId ? getContractorsByType(user.tenantId, 'training_center') : [];

  const orderHandlers = createOrderHandlers(
    orders,
    personnel,
    people,
    positions,
    toast,
    user?.tenantId
  );

  const trainingHandlers = createTrainingHandlers(trainings, toast);

  const unifiedDocuments = useMemo(() => {
    return migratedDocuments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [migratedDocuments]);

  const filteredDocuments = useMemo(() => {
    const searchQuery = filterValues.search || '';
    const typeFilter = filterValues.type || 'all';
    const statusFilter = filterValues.status || 'all';
    const sortBy = filterValues.sortBy || 'date';

    const filtered = unifiedDocuments.filter(doc => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      let compareResult = 0;
      
      if (sortBy === 'date') {
        compareResult = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'status') {
        compareResult = a.status.localeCompare(b.status);
      } else if (sortBy === 'type') {
        compareResult = a.type.localeCompare(b.type);
      }
      
      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [unifiedDocuments, filterValues, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: unifiedDocuments.length,
      orders: unifiedDocuments.filter(d => d.type === 'order').length,
      attestationOrders: unifiedDocuments.filter(d => d.type === 'attestation').length,
      trainings: unifiedDocuments.filter(d => d.type === 'training').length,
    };
  }, [unifiedDocuments]);

  const getTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'order': return 'Приказ';
      case 'attestation': return 'Приказ на аттестацию';
      case 'training': return 'Обучение';
    }
  };

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'attestation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'training': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };



  const handleExportToExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    
    const exportData = filteredDocuments.map(doc => ({
      'Тип': getTypeLabel(doc.type),
      'Номер': doc.number,
      'Дата': new Date(doc.date).toLocaleDateString('ru'),
      'Название': doc.title,
      'Статус': statusLabels[doc.status],
      'Количество сотрудников': doc.employeeIds.length,
      'Описание': doc.description || ''
    }));

    const ws = utils.json_to_sheet(exportData);
    
    const colWidths = [
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 50 },
      { wch: 15 },
      { wch: 22 },
      { wch: 50 }
    ];
    ws['!cols'] = colWidths;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Документы');

    const fileName = `Приказы_и_обучения_${new Date().toLocaleDateString('ru')}.xlsx`;
    writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего документов</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Приказы</CardDescription>
            <CardTitle className="text-3xl">{stats.orders}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Приказы на аттестацию</CardDescription>
            <CardTitle className="text-3xl">{stats.attestationOrders}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Обучения</CardDescription>
            <CardTitle className="text-3xl">{stats.trainings}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <DocumentFilters
          config={documentsFilterConfig(
            handleExportToExcel,
            filterValues.sortBy || 'date',
            sortOrder,
            (value) => setFilterValues({ ...filterValues, sortBy: value }),
            () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
          )}
          values={filterValues}
          onChange={setFilterValues}
          className="flex-1"
        />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}>
            <Icon name={viewMode === 'cards' ? 'Table' : 'LayoutGrid'} size={16} />
          </Button>

          <Button 
            onClick={() => {
              setCreateDialogType('order');
              setShowCreateDialog(true);
            }} 
            className="gap-2"
          >
            <Icon name="Plus" size={16} />
            Создать приказ
          </Button>

          <Button 
            onClick={() => {
              setCreateDialogType('training');
              setShowCreateDialog(true);
            }} 
            className="gap-2"
          >
            <Icon name="GraduationCap" size={16} />
            Создать обучение
          </Button>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icon name="FileX" size={48} className="text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Документы не найдены</p>
            <p className="text-sm text-muted-foreground">Попробуйте изменить параметры поиска</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-2'}>
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={getTypeColor(doc.type)}>
                        {getTypeLabel(doc.type)}
                      </Badge>
                      <Badge variant="outline" className={statusColors[doc.status]}>
                        {statusLabels[doc.status]}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Icon name="Hash" size={12} />
                        {doc.number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={12} />
                        {new Date(doc.date).toLocaleDateString('ru')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Users" size={12} />
                        {doc.employeeIds.length}
                      </span>
                    </CardDescription>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-2">{doc.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  {doc.type === 'order' && doc.id.startsWith('order-') && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => orderHandlers.handleViewOrder(doc.id)}>
                        <Icon name="Eye" size={14} className="mr-1" />
                        Просмотр
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => orderHandlers.handleEditOrder(doc.id)}>
                        <Icon name="Edit" size={14} className="mr-1" />
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => orderHandlers.handleDownloadOrderPDF(doc.id)}>
                        <Icon name="Download" size={14} className="mr-1" />
                        PDF
                      </Button>
                    </>
                  )}
                  {doc.type === 'training' && doc.id.startsWith('training-') && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => trainingHandlers.handleViewTraining(doc.id)}>
                        <Icon name="Eye" size={14} className="mr-1" />
                        Просмотр
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => trainingHandlers.handleEditTraining(doc.id)}>
                        <Icon name="Edit" size={14} className="mr-1" />
                        Изменить
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => trainingHandlers.handleViewDocuments(doc.id)}>
                        <Icon name="FileText" size={14} className="mr-1" />
                        Документы
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UnifiedDocumentDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setCreateDialogType(undefined);
        }}
        documentType={createDialogType}
      />

      <SendToTrainingCenterDialog
        open={showSendToTCDialog}
        onOpenChange={setShowSendToTCDialog}
        order={selectedOrderForTC}
      />
    </div>
  );
}