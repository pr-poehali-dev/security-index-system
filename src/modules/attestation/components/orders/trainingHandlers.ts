import type { Training } from '@/stores/trainingsAttestationStore';

export const createTrainingHandlers = (trainings: Training[], toast: any) => {
  const handleChangeTrainingStatus = (trainingId: string, newStatus: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Статус изменен",
      description: `Обучение "${training?.title}": ${newStatus}`,
    });
  };

  const handleViewTraining = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Просмотр обучения",
      description: training?.title,
    });
  };

  const handleEditTraining = () => {
    toast({
      title: "Редактирование обучения",
      description: "Откроется форма редактирования",
    });
  };

  const handleViewDocuments = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Документы обучения",
      description: `Документов: ${training?.documents?.length || 0}`,
    });
  };

  const handleViewParticipants = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Список участников",
      description: `Участников: ${training?.employeeIds.length}`,
    });
  };

  const handleDuplicateTraining = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Дублирование обучения",
      description: `Создана копия: ${training?.title}`,
    });
  };

  const handleDeleteTraining = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    toast({
      title: "Удаление обучения",
      description: `${training?.title} будет удалено`,
      variant: "destructive",
    });
  };

  return {
    handleChangeTrainingStatus,
    handleViewTraining,
    handleEditTraining,
    handleViewDocuments,
    handleViewParticipants,
    handleDuplicateTraining,
    handleDeleteTraining
  };
};