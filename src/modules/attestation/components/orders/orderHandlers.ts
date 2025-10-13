import type { Order } from '@/stores/ordersStore';
import type { Personnel, Person, Position } from '@/stores/settingsStore';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';

export const createOrderHandlers = (
  orders: Order[],
  personnel: Personnel[],
  people: Person[],
  positions: Position[],
  toast: any,
  tenantId?: string
) => {
  const handleChangeOrderStatus = (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Статус изменен",
      description: `Приказ №${order?.number}: ${newStatus}`,
    });
  };

  const handleSendToSDO = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Направление в СДО «Интеллектуальные системы подготовки»",
      description: `Приказ №${order?.number}: ${order?.employeeIds.length} сотрудников направлены на обучение в систему дистанционного обучения`,
    });
  };

  const handleSendToTrainingCenter = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !tenantId) return;

    const { addRequest } = useTrainingCenterStore.getState();
    
    const employeesList = order.employeeIds.map(empId => {
      const emp = personnel.find(p => p.id === empId);
      const person = people.find(p => p.id === emp?.personId);
      const position = positions.find(pos => pos.id === emp?.positionId);
      
      return {
        personnelId: empId,
        fullName: person ? `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim() : 'Неизвестный',
        position: position?.name || 'Не указана',
        department: undefined
      };
    });

    const request: any = {
      id: `req-${Date.now()}`,
      tenantId: tenantId,
      organizationId: order.organizationId || '',
      organizationName: 'Основная организация',
      programId: '',
      programName: order.title,
      requestDate: new Date().toISOString(),
      studentsCount: employeesList.length,
      students: employeesList,
      contactPerson: order.createdBy,
      status: 'new',
      notes: `Заявка создана из приказа №${order.number}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRequest(request);

    toast({
      title: "Заявка отправлена в учебный центр",
      description: `Приказ №${order.number}: ${order.employeeIds.length} сотрудников направлены на подготовку в учебный центр`,
    });
  };

  const handleScheduleAttestation = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Направление на аттестацию в ЕПТ организации",
      description: `Приказ №${order?.number}: ${order?.employeeIds.length} сотрудников направлены на аттестацию в единой платформе тестирования организации`,
    });
  };

  const handleRegisterRostechnadzor = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Направление на аттестацию в Ростехнадзоре",
      description: `Приказ №${order?.number}: ${order?.employeeIds.length} сотрудников направлены на аттестацию в системе Ростехнадзора`,
    });
  };

  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Просмотр приказа",
      description: `Приказ №${order?.number} - ${order?.title}`,
    });
  };

  const handleEditOrder = () => {
    toast({
      title: "Редактирование приказа",
      description: "Откроется форма редактирования приказа",
    });
  };

  const handleDownloadOrderPDF = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Загрузка PDF",
      description: `Приказ №${order?.number} будет загружен в формате PDF`,
    });
  };

  const handlePrintOrder = () => {
    toast({
      title: "Печать приказа",
      description: "Откроется окно печати",
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    toast({
      title: "Удаление приказа",
      description: `Приказ №${order?.number} будет удален`,
      variant: "destructive",
    });
  };

  return {
    handleChangeOrderStatus,
    handleSendToSDO,
    handleSendToTrainingCenter,
    handleScheduleAttestation,
    handleRegisterRostechnadzor,
    handleViewOrder,
    handleEditOrder,
    handleDownloadOrderPDF,
    handlePrintOrder,
    handleDeleteOrder
  };
};