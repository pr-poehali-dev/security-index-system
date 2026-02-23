import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTrainingRequestsStore } from '@/stores/trainingRequestsStore';
import { useTrainingCentersStore } from '@/stores/trainingCentersStore';
import { useQualificationRenewalStore } from '@/stores/qualificationRenewalStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { TrainingRequest } from '@/types/attestation';
import { useToast } from '@/hooks/use-toast';
import TrainingRequestsStatistics from '../training-requests/TrainingRequestsStatistics';
import TrainingRequestsFilters from '../training-requests/TrainingRequestsFilters';
import TrainingRequestsTable from '../training-requests/TrainingRequestsTable';
import TrainingResultsDialog from '../training-requests/TrainingResultsDialog';
import CreateTrainingRequestDialog from '../training-requests/CreateTrainingRequestDialog';

interface TrainingResult {
  id: string;
  organization: string;
  fullName: string;
  position: string;
  attestationArea: string;
  certificateNumber: string;
  certificateDate: string;
}

const mockTrainingResults: TrainingResult[] = [
  {
    id: '1',
    organization: 'ООО "Энерго"',
    fullName: 'Петров Петр Петрович',
    position: 'Инженер по ТБ',
    attestationArea: 'А.1 Общие требования промышленной безопасности',
    certificateNumber: 'ДПО-2024-123',
    certificateDate: '2024-03-15',
  },
  {
    id: '2',
    organization: 'ООО "Энерго"',
    fullName: 'Сидорова Анна Ивановна',
    position: 'Инженер-энергетик',
    attestationArea: 'Б.3 Эксплуатация электроустановок',
    certificateNumber: 'ДПО-2024-124',
    certificateDate: '2024-03-15',
  },
];

export default function TrainingRequestsTab() {
  const user = useAuthStore((state) => state.user);
  const { organizations, productionSites, departments } = useSettingsStore();
  const { getRequestsByTenant, updateRequest } = useTrainingRequestsStore();
  const { getActiveConnections, addCenterRequest } = useTrainingCentersStore();
  const { autoCreateRenewal } = useQualificationRenewalStore();
  const { addNotification } = useNotificationsStore();
  const { addOrder, addOrderEmployee } = useAttestationOrdersStore();
  const requests = user?.tenantId ? getRequestsByTenant(user.tenantId) : [];
  const activeConnections = user?.tenantId ? getActiveConnections(user.tenantId).filter(c => c.autoSendRequests) : [];
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [productionSiteFilter, setProductionSiteFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [showCreateOrderPrompt, setShowCreateOrderPrompt] = useState(false);
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [completedResults, setCompletedResults] = useState<TrainingResult[]>([]);
  const [completedRequest, setCompletedRequest] = useState<TrainingRequest | null>(null);
  const [attestationTypes, setAttestationTypes] = useState<Record<string, 'rostechnadzor' | 'company_commission'>>({});

  const tenantOrganizations = useMemo(() => {
    if (!Array.isArray(organizations) || !user?.tenantId) return [];
    return organizations.filter(o => o.tenantId === user.tenantId);
  }, [organizations, user?.tenantId]);

  const tenantProductionSites = useMemo(() => {
    if (!Array.isArray(productionSites) || !user?.tenantId) return [];
    return productionSites.filter(ps => ps.tenantId === user.tenantId);
  }, [productionSites, user?.tenantId]);

  const tenantDepartments = useMemo(() => {
    if (!Array.isArray(departments) || !user?.tenantId) return [];
    return departments.filter(d => d.tenantId === user.tenantId);
  }, [departments, user?.tenantId]);

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
    if (organizationFilter !== 'all') {
      const org = tenantOrganizations.find(o => o.id === organizationFilter);
      if (org && req.organizationName !== org.name) return false;
    }
    if (departmentFilter !== 'all') {
      return false;
    }
    return true;
  });

  const handleApprove = (id: string) => {
    const request = requests.find(r => r.id === id);
    updateRequest(id, {
      status: 'approved',
      approvedBy: user?.name,
      approvedDate: new Date().toISOString()
    });
    
    if (request && activeConnections.length > 0) {
      activeConnections.forEach(conn => {
        addCenterRequest({
          tenantId: request.tenantId,
          trainingCenterTenantId: conn.trainingCenterTenantId,
          trainingCenterName: conn.trainingCenterName,
          trainingRequestId: request.id,
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          position: request.position,
          organizationName: request.organizationName,
          programName: request.programName,
          sendDate: new Date().toISOString(),
          status: 'sent'
        });
      });
      toast({ 
        title: 'Заявка согласована', 
        description: `Автоматически отправлена в ${activeConnections.length} учебных центров` 
      });
    } else {
      toast({ title: 'Заявка согласована' });
    }
  };

  const handleReject = (id: string) => {
    updateRequest(id, {
      status: 'rejected',
      approvedBy: user?.name,
      approvedDate: new Date().toISOString()
    });
    toast({ title: 'Заявка отклонена' });
  };

  const handleViewResults = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setShowResultsDialog(true);
  };

  const handleConfirmResults = (selectedIds: string[]) => {
    if (!selectedRequest) return;

    const selectedResultsData = mockTrainingResults.filter(r => selectedIds.includes(r.id));
    
    selectedResultsData.forEach(result => {
      autoCreateRenewal(
        selectedRequest.tenantId,
        selectedRequest.employeeId,
        selectedRequest.employeeName,
        selectedRequest.position,
        result.attestationArea,
        {
          number: result.certificateNumber,
          issueDate: result.certificateDate,
          validUntil: new Date(new Date(result.certificateDate).setFullYear(new Date(result.certificateDate).getFullYear() + 5)).toISOString(),
          issuedBy: 'Учебный центр',
          scanUrl: ''
        }
      );
    });

    updateRequest(selectedRequest.id, { status: 'completed' });

    if (user?.tenantId) {
      addNotification({
        tenantId: user.tenantId,
        type: 'success',
        source: 'training_center',
        title: 'Обучение завершено',
        message: `Сотрудник ${selectedRequest.employeeName} завершил обучение по программе "${selectedRequest.programName}". Загружено ${selectedIds.length} сертификатов.`,
        link: '/attestation',
        isRead: false
      });
    }

    toast({
      title: 'Результаты загружены',
      description: `Добавлено ${selectedIds.length} сертификатов. Автоматически созданы задачи на продление.`
    });

    setShowResultsDialog(false);
    setCompletedResults(selectedResultsData);
    setCompletedRequest(selectedRequest);
    setSelectedRequest(null);
    setShowCreateOrderPrompt(true);
  };

  const handleOpenCreateOrderDialog = () => {
    setShowCreateOrderPrompt(false);
    const defaults: Record<string, 'rostechnadzor' | 'company_commission'> = {};
    completedResults.forEach(r => {
      defaults[r.id] = 'company_commission';
    });
    setAttestationTypes(defaults);
    setShowCreateOrderDialog(true);
  };

  const handleCreateAttestationOrder = () => {
    if (!completedRequest || !user?.tenantId) return;

    const byType: Record<string, TrainingResult[]> = {};
    completedResults.forEach(r => {
      const type = attestationTypes[r.id] || 'company_commission';
      if (!byType[type]) byType[type] = [];
      byType[type].push(r);
    });

    Object.entries(byType).forEach(([type, results]) => {
      const attestationType = type as 'rostechnadzor' | 'company_commission';
      const typeLabel = attestationType === 'rostechnadzor' ? 'РТН' : 'ЕПТ';
      const orderNumber = `ПА-${typeLabel}-${Date.now().toString().slice(-4)}`;

      const orderId = addOrder({
        tenantId: user.tenantId!,
        number: orderNumber,
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        attestationType,
        employeeIds: [completedRequest.employeeId],
        trainingRequestIds: [completedRequest.id],
        notes: `Создан после завершения обучения по программе "${completedRequest.programName}"`
      });

      results.forEach(result => {
        addOrderEmployee({
          orderId,
          personnelId: completedRequest.employeeId,
          organizationName: result.organization,
          fullName: result.fullName,
          position: result.position,
          attestationArea: result.attestationArea,
          certificateNumber: result.certificateNumber,
          certificateDate: result.certificateDate
        });
      });
    });

    addNotification({
      tenantId: user.tenantId,
      type: 'info',
      source: 'attestation',
      title: 'Создан приказ на аттестацию',
      message: `Приказ на аттестацию создан для ${completedRequest.employeeName} после завершения обучения по программе "${completedRequest.programName}".`,
      link: '/attestation',
      isRead: false
    });

    toast({
      title: 'Приказ создан',
      description: `Приказ на аттестацию создан для ${completedResults.length} записей`
    });

    setShowCreateOrderDialog(false);
    setCompletedResults([]);
    setCompletedRequest(null);
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      <TrainingRequestsStatistics stats={stats} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Заявки на обучение</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать заявку
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrainingRequestsFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            organizationFilter={organizationFilter}
            productionSiteFilter={productionSiteFilter}
            departmentFilter={departmentFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onOrganizationChange={setOrganizationFilter}
            onProductionSiteChange={setProductionSiteFilter}
            onDepartmentChange={setDepartmentFilter}
            organizations={tenantOrganizations}
            productionSites={tenantProductionSites}
            departments={tenantDepartments}
          />
          
          <TrainingRequestsTable
            requests={filteredRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewResults={handleViewResults}
          />
        </CardContent>
      </Card>

      <TrainingResultsDialog
        open={showResultsDialog}
        onOpenChange={setShowResultsDialog}
        request={selectedRequest}
        results={mockTrainingResults}
        onConfirm={handleConfirmResults}
      />

      <CreateTrainingRequestDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <Dialog open={showCreateOrderPrompt} onOpenChange={setShowCreateOrderPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Обучение завершено</DialogTitle>
            <DialogDescription>
              Результаты обучения загружены. Хотите создать приказ на аттестацию для данных сотрудников?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <Icon name="CheckCircle2" size={16} className="text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-900 dark:text-green-100">
              Сотрудник: {completedRequest?.employeeName} — {completedRequest?.programName}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateOrderPrompt(false); setCompletedResults([]); setCompletedRequest(null); }}>
              Позже
            </Button>
            <Button onClick={handleOpenCreateOrderDialog}>
              <Icon name="FileText" size={16} className="mr-2" />
              Создать приказ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создание приказа на аттестацию</DialogTitle>
            <DialogDescription>
              Выберите тип аттестации для каждого сотрудника
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Icon name="AlertCircle" size={16} className="text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Программа обучения: {completedRequest?.programName}
              </p>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Область аттестации</TableHead>
                    <TableHead>№ удостоверения</TableHead>
                    <TableHead>Тип аттестации</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.fullName}</TableCell>
                      <TableCell>{result.position}</TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">{result.attestationArea}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.certificateNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attestationTypes[result.id] || 'company_commission'}
                          onValueChange={(value: 'rostechnadzor' | 'company_commission') =>
                            setAttestationTypes(prev => ({ ...prev, [result.id]: value }))
                          }
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company_commission">
                              <div className="flex items-center gap-2">
                                <Icon name="Building2" size={14} />
                                Комиссия организации (ЕПТ)
                              </div>
                            </SelectItem>
                            <SelectItem value="rostechnadzor">
                              <div className="flex items-center gap-2">
                                <Icon name="Award" size={14} />
                                Ростехнадзор
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Комиссия организации (ЕПТ)</Label>
                <p className="text-sm font-medium">
                  {completedResults.filter(r => (attestationTypes[r.id] || 'company_commission') === 'company_commission').length} сотрудников
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ростехнадзор</Label>
                <p className="text-sm font-medium">
                  {completedResults.filter(r => attestationTypes[r.id] === 'rostechnadzor').length} сотрудников
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateOrderDialog(false); setCompletedResults([]); setCompletedRequest(null); }}>
              Отмена
            </Button>
            <Button onClick={handleCreateAttestationOrder} disabled={completedResults.length === 0}>
              <Icon name="Check" size={16} className="mr-2" />
              Создать приказ ({completedResults.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}