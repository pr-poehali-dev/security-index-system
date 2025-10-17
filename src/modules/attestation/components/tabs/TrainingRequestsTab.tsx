import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingRequestsStore } from '@/stores/trainingRequestsStore';
import { useTrainingCentersStore } from '@/stores/trainingCentersStore';
import { useQualificationRenewalStore } from '@/stores/qualificationRenewalStore';
import { TrainingRequest } from '@/types/attestation';
import { useToast } from '@/hooks/use-toast';
import TrainingRequestsStatistics from '../training-requests/TrainingRequestsStatistics';
import TrainingRequestsFilters from '../training-requests/TrainingRequestsFilters';
import TrainingRequestsTable from '../training-requests/TrainingRequestsTable';
import TrainingResultsDialog from '../training-requests/TrainingResultsDialog';

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
  const { getRequestsByTenant, updateRequest } = useTrainingRequestsStore();
  const { getActiveConnections, addCenterRequest } = useTrainingCentersStore();
  const { autoCreateRenewal } = useQualificationRenewalStore();
  const requests = user?.tenantId ? getRequestsByTenant(user.tenantId) : [];
  const activeConnections = user?.tenantId ? getActiveConnections(user.tenantId).filter(c => c.autoSendRequests) : [];
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    const request = requests.find(r => r.id === id);
    updateRequest(id, {
      status: 'approved',
      approvedBy: user?.fullName,
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
      approvedBy: user?.fullName,
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
    
    toast({
      title: 'Результаты загружены',
      description: `Добавлено ${selectedIds.length} сертификатов. Автоматически созданы задачи на продление.`
    });

    setShowResultsDialog(false);
    setSelectedRequest(null);
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
        <CardHeader>
          <CardTitle>Заявки на обучение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrainingRequestsFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
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
    </div>
  );
}
