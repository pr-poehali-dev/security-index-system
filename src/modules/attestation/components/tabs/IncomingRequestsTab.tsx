import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingCentersStore } from '@/stores/trainingCentersStore';
import { useDpoQualificationStore } from '@/stores/dpoQualificationStore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TrainingCenterRequest } from '@/types/attestation';

export default function IncomingRequestsTab() {
  const user = useAuthStore((state) => state.user);
  const { getCenterRequestsByTrainingCenter, updateCenterRequest } = useTrainingCentersStore();
  const { addQualification } = useDpoQualificationStore();
  const { toast } = useToast();
  
  const incomingRequests = user?.tenantId ? getCenterRequestsByTrainingCenter(user.tenantId) : [];
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<TrainingCenterRequest | null>(null);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [certificateIssueDate, setCertificateIssueDate] = useState('');
  const [certificateExpiryDate, setCertificateExpiryDate] = useState('');
  const [certificateValidityYears, setCertificateValidityYears] = useState('5');
  const [duration, setDuration] = useState('72');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredRequests = incomingRequests.filter((req) => 
    statusFilter === 'all' || req.status === statusFilter
  );

  const handleReceive = (id: string) => {
    updateCenterRequest(id, { 
      status: 'received',
      receivedDate: new Date().toISOString()
    });
    toast({ title: 'Заявка принята в работу' });
  };

  const handleStartTraining = (id: string) => {
    updateCenterRequest(id, { 
      status: 'in_training',
      trainingStartDate: new Date().toISOString()
    });
    toast({ title: 'Обучение начато' });
  };

  const handleReject = (id: string) => {
    updateCenterRequest(id, { status: 'rejected' });
    toast({ title: 'Заявка отклонена', variant: 'destructive' });
  };

  const openCertificateDialog = (request: TrainingCenterRequest) => {
    setSelectedRequest(request);
    const today = new Date();
    setCertificateIssueDate(today.toISOString().split('T')[0]);
    
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + parseInt(certificateValidityYears));
    setCertificateExpiryDate(expiryDate.toISOString().split('T')[0]);
    
    const year = today.getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    setCertificateNumber(`ДПО-${year}-${randomNum}`);
    
    setDialogOpen(true);
  };

  const handleIssueCertificate = () => {
    if (!selectedRequest) return;

    updateCenterRequest(selectedRequest.id, {
      status: 'completed',
      completedDate: new Date().toISOString(),
      certificateNumber,
      certificateIssueDate,
      certificateExpiryDate,
      certificateValidityYears: parseInt(certificateValidityYears)
    });

    addQualification({
      personnelId: selectedRequest.employeeId,
      tenantId: selectedRequest.tenantId,
      category: 'labor_safety',
      programName: selectedRequest.programName,
      trainingOrganizationId: user?.tenantId || '',
      trainingOrganizationName: user?.tenantName || 'Учебный центр',
      certificateNumber: certificateNumber,
      issueDate: certificateIssueDate,
      expiryDate: certificateExpiryDate,
      duration: parseInt(duration)
    });

    toast({ 
      title: 'Удостоверение ДПО выдано', 
      description: `№ ${certificateNumber} для ${selectedRequest.employeeName}` 
    });

    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'received':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'in_training':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Новая заявка';
      case 'received':
        return 'Принята';
      case 'in_training':
        return 'На обучении';
      case 'completed':
        return 'Завершено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const stats = {
    total: incomingRequests.length,
    new: incomingRequests.filter(r => r.status === 'sent').length,
    inProgress: incomingRequests.filter(r => r.status === 'received' || r.status === 'in_training').length,
    completed: incomingRequests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
            <Icon name="Inbox" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новые</CardTitle>
            <Icon name="Mail" className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Icon name="Clock" className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <Icon name="CheckCircle" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Входящие заявки на обучение</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все заявки</SelectItem>
                <SelectItem value="sent">Новые</SelectItem>
                <SelectItem value="received">Принятые</SelectItem>
                <SelectItem value="in_training">На обучении</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Нет заявок для отображения</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border-l-4" style={{
                  borderLeftColor: request.status === 'sent' ? '#3b82f6' :
                                  request.status === 'received' ? '#a855f7' :
                                  request.status === 'in_training' ? '#6366f1' :
                                  request.status === 'completed' ? '#22c55e' : '#ef4444'
                }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            от {new Date(request.sendDate).toLocaleDateString('ru-RU')}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Icon name="User" size={16} className="mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{request.employeeName}</div>
                              <div className="text-sm text-muted-foreground">{request.position}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Icon name="Building2" size={16} className="mt-0.5 text-muted-foreground" />
                            <div className="text-sm">{request.organizationName}</div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Icon name="GraduationCap" size={16} className="mt-0.5 text-muted-foreground" />
                            <div className="text-sm font-medium">{request.programName}</div>
                          </div>
                        </div>

                        {request.certificateNumber && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg space-y-1">
                            <div className="text-sm font-medium text-green-900 dark:text-green-100">
                              Удостоверение выдано
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              № {request.certificateNumber}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Действительно до: {new Date(request.certificateExpiryDate || '').toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {request.status === 'sent' && (
                          <>
                            <Button size="sm" onClick={() => handleReceive(request.id)}>
                              <Icon name="Check" size={16} className="mr-2" />
                              Принять
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                              <Icon name="X" size={16} className="mr-2" />
                              Отклонить
                            </Button>
                          </>
                        )}

                        {request.status === 'received' && (
                          <Button size="sm" onClick={() => handleStartTraining(request.id)}>
                            <Icon name="Play" size={16} className="mr-2" />
                            Начать обучение
                          </Button>
                        )}

                        {request.status === 'in_training' && (
                          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => openCertificateDialog(request)}>
                                <Icon name="Award" size={16} className="mr-2" />
                                Выдать удостоверение
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Выдача удостоверения ДПО</DialogTitle>
                                <DialogDescription>
                                  Выдайте удостоверение о повышении квалификации. Учебный центр НЕ может проводить аттестацию.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Сотрудник</Label>
                                  <div className="text-sm font-medium">{selectedRequest?.employeeName}</div>
                                  <div className="text-xs text-muted-foreground">{selectedRequest?.programName}</div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="certNumber">Номер удостоверения</Label>
                                  <Input
                                    id="certNumber"
                                    value={certificateNumber}
                                    onChange={(e) => setCertificateNumber(e.target.value)}
                                    placeholder="ДПО-2025-0001"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="issueDate">Дата выдачи</Label>
                                  <Input
                                    id="issueDate"
                                    type="date"
                                    value={certificateIssueDate}
                                    onChange={(e) => setCertificateIssueDate(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="validityYears">Срок действия (лет)</Label>
                                  <Select 
                                    value={certificateValidityYears} 
                                    onValueChange={(val) => {
                                      setCertificateValidityYears(val);
                                      if (certificateIssueDate) {
                                        const expiry = new Date(certificateIssueDate);
                                        expiry.setFullYear(expiry.getFullYear() + parseInt(val));
                                        setCertificateExpiryDate(expiry.toISOString().split('T')[0]);
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 год</SelectItem>
                                      <SelectItem value="3">3 года</SelectItem>
                                      <SelectItem value="5">5 лет</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="duration">Длительность программы (часов)</Label>
                                  <Input
                                    id="duration"
                                    type="number"
                                    min="16"
                                    max="500"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="72"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="expiryDate">Действительно до</Label>
                                  <Input
                                    id="expiryDate"
                                    type="date"
                                    value={certificateExpiryDate}
                                    onChange={(e) => setCertificateExpiryDate(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={handleIssueCertificate} className="flex-1">
                                  <Icon name="Award" size={16} className="mr-2" />
                                  Выдать удостоверение
                                </Button>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                  Отмена
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}