import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateOrderDialog from '../CreateOrderDialog';
import CreateTrainingDialog from '../CreateTrainingDialog';
import SendToTrainingCenterDialog from '../SendToTrainingCenterDialog';
import { useAuthStore } from '@/stores/authStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useTrainingsAttestationStore } from '@/stores/trainingsAttestationStore';
import { useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { createOrderHandlers } from '../orders/orderHandlers';
import { createTrainingHandlers } from '../orders/trainingHandlers';
import { generateOrderAppendix, generateFullOrderReport } from '../../utils/orderExport';
import type { Order } from '@/stores/ordersStore';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';

type DocumentType = 'order' | 'attestation-order' | 'training';

interface UnifiedDocument {
  id: string;
  type: DocumentType;
  title: string;
  number: string;
  date: string;
  status: string;
  description?: string;
  employeeCount: number;
  data: any;
}

export default function OrdersTrainingTab() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { orders, getOrdersByTenant } = useOrdersStore();
  const { trainings, getTrainingsByTenant } = useTrainingsAttestationStore();
  const { getOrdersByTenant: getAttestationOrders } = useAttestationOrdersStore();
  const { personnel, people, positions, getContractorsByType } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [showCreateTrainingDialog, setShowCreateTrainingDialog] = useState(false);
  const [showSendToTCDialog, setShowSendToTCDialog] = useState(false);
  const [selectedOrderForTC, setSelectedOrderForTC] = useState<Order | null>(null);

  const tenantOrders = user?.tenantId ? getOrdersByTenant(user.tenantId) : [];
  const tenantTrainings = user?.tenantId ? getTrainingsByTenant(user.tenantId) : [];
  const attestationOrders = user?.tenantId ? getAttestationOrders(user.tenantId) : [];
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

  const unifiedDocuments = useMemo<UnifiedDocument[]>(() => {
    const docs: UnifiedDocument[] = [];

    tenantOrders.forEach(order => {
      docs.push({
        id: order.id,
        type: 'order',
        title: order.title,
        number: order.number,
        date: order.date,
        status: order.status,
        description: order.description,
        employeeCount: order.employeeIds.length,
        data: order
      });
    });

    attestationOrders.forEach(order => {
      docs.push({
        id: order.id,
        type: 'attestation-order',
        title: `Приказ на аттестацию ${order.certificationAreaCode}`,
        number: order.orderNumber,
        date: order.orderDate,
        status: order.status || 'draft',
        description: order.certificationAreaName,
        employeeCount: order.personnel.length,
        data: order
      });
    });

    tenantTrainings.forEach(training => {
      const org = trainingOrgs.find(o => o.id === training.organizationId);
      docs.push({
        id: training.id,
        type: 'training',
        title: training.title,
        number: `ОБ-${training.id.slice(0, 8)}`,
        date: training.startDate,
        status: training.status,
        description: org?.name || '',
        employeeCount: training.employeeIds.length,
        data: training
      });
    });

    return docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tenantOrders, attestationOrders, tenantTrainings, trainingOrgs]);

  const filteredDocuments = useMemo(() => {
    return unifiedDocuments.filter(doc => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [unifiedDocuments, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: unifiedDocuments.length,
      orders: unifiedDocuments.filter(d => d.type === 'order').length,
      attestationOrders: unifiedDocuments.filter(d => d.type === 'attestation-order').length,
      trainings: unifiedDocuments.filter(d => d.type === 'training').length,
    };
  }, [unifiedDocuments]);

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'order': return 'Приказ';
      case 'attestation-order': return 'Приказ на аттестацию';
      case 'training': return 'Обучение';
    }
  };

  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800';
      case 'attestation-order': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Черновик',
      prepared: 'Подготовлен',
      approved: 'Согласован',
      active: 'Активен',
      completed: 'Выполнен',
      planned: 'Запланировано',
      in_progress: 'В процессе',
      cancelled: 'Отменен'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'prepared': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportToExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    
    const exportData = filteredDocuments.map(doc => ({
      'Тип': getTypeLabel(doc.type),
      'Номер': doc.number,
      'Дата': new Date(doc.date).toLocaleDateString('ru'),
      'Название': doc.title,
      'Статус': getStatusLabel(doc.status),
      'Количество сотрудников': doc.employeeCount,
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
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Поиск по названию, номеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Тип документа" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="order">Приказы</SelectItem>
              <SelectItem value="attestation-order">Приказы на аттестацию</SelectItem>
              <SelectItem value="training">Обучения</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="draft">Черновик</SelectItem>
              <SelectItem value="prepared">Подготовлен</SelectItem>
              <SelectItem value="approved">Согласован</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="completed">Выполнен</SelectItem>
              <SelectItem value="planned">Запланировано</SelectItem>
              <SelectItem value="in_progress">В процессе</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}>
            <Icon name={viewMode === 'cards' ? 'Table' : 'LayoutGrid'} size={16} />
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportToExcel}>
            <Icon name="Download" size={16} className="mr-2" />
            Excel
          </Button>

          <Button onClick={() => setShowCreateOrderDialog(true)} className="gap-2">
            <Icon name="Plus" size={16} />
            Создать приказ
          </Button>

          <Button onClick={() => setShowCreateTrainingDialog(true)} className="gap-2">
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
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {getStatusLabel(doc.status)}
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
                        {doc.employeeCount}
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
                  {doc.type === 'order' && (
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
                  {doc.type === 'training' && (
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

      <CreateOrderDialog
        open={showCreateOrderDialog}
        onOpenChange={setShowCreateOrderDialog}
      />

      <CreateTrainingDialog
        open={showCreateTrainingDialog}
        onOpenChange={setShowCreateTrainingDialog}
      />

      <SendToTrainingCenterDialog
        open={showSendToTCDialog}
        onOpenChange={setShowSendToTCDialog}
        order={selectedOrderForTC}
      />
    </div>
  );
}
