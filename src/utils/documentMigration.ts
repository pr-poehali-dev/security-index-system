import type { Order } from '@/stores/ordersStore';
import type { Training } from '@/stores/trainingsAttestationStore';
import type { AttestationOrder } from '@/types';
import { 
  Document, 
  OrderDocument, 
  TrainingDocument, 
  AttestationDocument 
} from '@/stores/documentsStore';
import { mapLegacyStatus, ChecklistDocumentStatus } from '@/types/documentStatus';

export function migrateOrderToDocument(order: Order): OrderDocument {
  return {
    type: 'order',
    id: order.id,
    tenantId: order.tenantId,
    number: order.number,
    date: order.date,
    title: order.title,
    status: mapLegacyStatus(order.status),
    employeeIds: order.employeeIds,
    createdBy: order.createdBy,
    description: order.description,
    documentUrl: order.documentUrl,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderType: order.type,
    certifications: order.certifications,
    sentToTrainingCenter: order.sentToTrainingCenter,
    trainingCenterRequestId: order.trainingCenterRequestId,
  };
}

export function migrateTrainingToDocument(training: Training): TrainingDocument {
  const employeeIds = training.employeeIds || [];
  
  return {
    type: 'training',
    id: training.id,
    tenantId: training.tenantId,
    number: `ОБ-${training.id.substring(training.id.length - 6)}`,
    date: training.startDate,
    title: training.title,
    status: mapLegacyStatus(training.status),
    employeeIds,
    createdBy: 'Система',
    description: training.program,
    documentUrl: training.documentUrl,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
    trainingType: training.type,
    startDate: training.startDate,
    endDate: training.endDate,
    organizationId: training.organizationId,
    cost: training.cost,
    program: training.program,
    certificateNumber: training.certificateNumber,
    certificateIssueDate: training.certificateIssueDate,
    sdoProgress: training.sdoProgress,
    sdoCompletedLessons: training.sdoCompletedLessons,
    sdoTotalLessons: training.sdoTotalLessons,
    participants: training.participants,
  };
}

export function migrateAttestationOrderToDocument(order: AttestationOrder): AttestationDocument {
  const employeeIds = order.personnel?.map(p => p.personnelId) || [];
  
  return {
    type: 'attestation',
    id: order.id,
    tenantId: order.tenantId,
    number: order.orderNumber,
    date: order.orderDate,
    title: `Приказ на аттестацию ${order.certificationAreaCode}`,
    status: ChecklistDocumentStatus.DRAFT,
    employeeIds,
    createdBy: 'Система',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
    organizationId: order.organizationId,
    attestationType: order.attestationType,
    certificationAreaCode: order.certificationAreaCode,
    certificationAreaName: order.certificationAreaName,
    personnel: order.personnel,
  };
}

export function migrateAllDocuments(
  orders: Order[],
  trainings: Training[],
  attestationOrders: AttestationOrder[]
): Document[] {
  const documents: Document[] = [];
  
  orders.forEach(order => {
    try {
      documents.push(migrateOrderToDocument(order));
    } catch (error) {
      console.error(`Failed to migrate order ${order.id}:`, error);
    }
  });
  
  trainings.forEach(training => {
    try {
      documents.push(migrateTrainingToDocument(training));
    } catch (error) {
      console.error(`Failed to migrate training ${training.id}:`, error);
    }
  });
  
  attestationOrders.forEach(order => {
    try {
      documents.push(migrateAttestationOrderToDocument(order));
    } catch (error) {
      console.error(`Failed to migrate attestation order ${order.id}:`, error);
    }
  });
  
  return documents;
}

export function getMigrationStats(documents: Document[]) {
  const stats = {
    total: documents.length,
    byType: {
      order: 0,
      training: 0,
      attestation: 0,
    },
    byStatus: {} as Record<ChecklistDocumentStatus, number>,
  };
  
  documents.forEach(doc => {
    stats.byType[doc.type]++;
    stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
  });
  
  return stats;
}