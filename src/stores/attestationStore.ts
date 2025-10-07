import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Certification {
  id: string;
  personnelId: string;
  tenantId: string;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology';
  area: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber?: string;
  protocolDate?: string;
  verified: boolean;
  verifiedDate?: string;
  verifiedBy?: string;
  trainingOrganizationId?: string;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationType {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  validityPeriod: number;
  category: 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology' | 'other';
  requiresRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  tenantId: string;
  number: string;
  date: string;
  type: 'attestation' | 'training' | 'suspension' | 'lms' | 'internal';
  title: string;
  employeeIds: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  description?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingParticipant {
  employeeId: string;
  status: 'in_progress' | 'completed' | 'failed';
  progress?: number;
  testScore?: number;
  testMaxScore?: number;
  completedAt?: string;
}

export interface Training {
  id: string;
  tenantId: string;
  title: string;
  type: 'initial' | 'periodic' | 'extraordinary';
  startDate: string;
  endDate: string;
  employeeIds: string[];
  organizationId: string;
  cost: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'in_progress';
  program?: string;
  documentUrl?: string;
  certificateNumber?: string;
  certificateIssueDate?: string;
  sdoProgress?: number;
  sdoCompletedLessons?: number;
  sdoTotalLessons?: number;
  participants?: TrainingParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRule {
  id: string;
  tenantId: string;
  name: string;
  enabled: boolean;
  daysBeforeExpiry: number;
  notifyEmployee: boolean;
  notifyManager: boolean;
  notifyHR: boolean;
  emailTemplate: string;
  frequency: 'once' | 'daily' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  tenantId: string;
  date: string;
  type: 'email' | 'sms' | 'push';
  recipient: string;
  employeeId: string;
  certificationId: string;
  status: 'sent' | 'failed' | 'pending';
  createdAt: string;
}

interface AttestationState {
  certifications: Certification[];
  certificationTypes: CertificationType[];
  orders: Order[];
  trainings: Training[];
  notificationRules: NotificationRule[];
  notificationLogs: NotificationLog[];
  
  addCertification: (cert: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  getCertificationsByPersonnel: (personnelId: string) => Certification[];
  getCertificationsByTenant: (tenantId: string) => Certification[];
  importCertifications: (certs: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addCertificationType: (type: Omit<CertificationType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCertificationType: (id: string, updates: Partial<CertificationType>) => void;
  deleteCertificationType: (id: string) => void;
  getCertificationTypesByTenant: (tenantId: string) => CertificationType[];
  
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrdersByTenant: (tenantId: string) => Order[];
  
  addTraining: (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTraining: (id: string, updates: Partial<Training>) => void;
  deleteTraining: (id: string) => void;
  getTrainingsByTenant: (tenantId: string) => Training[];
  
  addNotificationRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNotificationRule: (id: string, updates: Partial<NotificationRule>) => void;
  deleteNotificationRule: (id: string) => void;
  getNotificationRulesByTenant: (tenantId: string) => NotificationRule[];
  
  addNotificationLog: (log: Omit<NotificationLog, 'id' | 'createdAt'>) => void;
  getNotificationLogsByTenant: (tenantId: string) => NotificationLog[];
}

export const useAttestationStore = create<AttestationState>()(persist((set, get) => ({
  certifications: [
    {
      id: 'cert-1',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      issueDate: '2023-01-01',
      expiryDate: '2028-01-01',
      protocolNumber: 'ПБ-123/2023',
      protocolDate: '2023-01-01',
      verified: true,
      verifiedDate: '2024-03-15',
      createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-2',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'Б.3 Эксплуатация объектов электроэнергетики',
      issueDate: '2021-09-15',
      expiryDate: '2026-09-14',
      protocolNumber: 'ПБ-456/2021',
      protocolDate: '2021-09-15',
      verified: false,
      createdAt: new Date(Date.now() - 1200 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-3',
      personnelId: 'personnel-1',
      tenantId: 'tenant-1',
      category: 'energy_safety',
      area: 'Электропотребители промышленные 5 группа до и выше 1000В',
      issueDate: '2025-02-17',
      expiryDate: '2026-02-17',
      protocolNumber: 'ЭБ-789/2025',
      protocolDate: '2025-02-17',
      verified: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-4',
      personnelId: 'personnel-2',
      tenantId: 'tenant-1',
      category: 'industrial_safety',
      area: 'А.1 Основы промышленной безопасности',
      issueDate: '2020-03-10',
      expiryDate: '2025-03-10',
      protocolNumber: 'ПБ-234/2020',
      protocolDate: '2020-03-10',
      verified: true,
      verifiedDate: '2020-03-15',
      createdAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-5',
      personnelId: 'personnel-2',
      tenantId: 'tenant-1',
      category: 'energy_safety',
      area: 'V группа до 1000В',
      issueDate: '2024-06-15',
      expiryDate: '2025-06-15',
      verified: false,
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cert-6',
      personnelId: 'personnel-3',
      tenantId: 'tenant-1',
      category: 'energy_safety',
      area: 'III группа до 1000В',
      issueDate: '2023-05-20',
      expiryDate: '2025-11-20',
      verified: false,
      createdAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addCertification: (cert) => {
    const newCert: Certification = {
      ...cert,
      id: `cert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ certifications: [...state.certifications, newCert] }));
  },

  updateCertification: (id, updates) => {
    set((state) => ({
      certifications: state.certifications.map((cert) =>
        cert.id === id ? { ...cert, ...updates, updatedAt: new Date().toISOString() } : cert
      )
    }));
  },

  deleteCertification: (id) => {
    set((state) => ({
      certifications: state.certifications.filter((cert) => cert.id !== id)
    }));
  },

  getCertificationsByPersonnel: (personnelId) => {
    return get().certifications.filter((cert) => cert.personnelId === personnelId);
  },

  getCertificationsByTenant: (tenantId) => {
    return get().certifications.filter((cert) => cert.tenantId === tenantId);
  },

  importCertifications: (certs) => {
    const newCerts = certs.map((cert, index) => ({
      ...cert,
      id: `cert-import-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    set((state) => ({ certifications: [...state.certifications, ...newCerts] }));
  },

  certificationTypes: [
    {
      id: 'certtype-1',
      tenantId: 'tenant-1',
      name: 'Электробезопасность (группа III)',
      description: 'Допуск к работе с электроустановками до 1000В',
      validityPeriod: 12,
      category: 'energy_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'certtype-2',
      tenantId: 'tenant-1',
      name: 'Работы на высоте (группа 2)',
      description: 'Допуск к работам на высоте с использованием систем безопасности',
      validityPeriod: 36,
      category: 'labor_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'certtype-3',
      tenantId: 'tenant-1',
      name: 'Промышленная безопасность А.1',
      description: 'Основы промышленной безопасности',
      validityPeriod: 60,
      category: 'industrial_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'certtype-4',
      tenantId: 'tenant-1',
      name: 'Промышленная безопасность Б.3',
      description: 'Эксплуатация объектов электроэнергетики',
      validityPeriod: 60,
      category: 'industrial_safety',
      requiresRenewal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  addCertificationType: (type) => {
    const newType: CertificationType = {
      ...type,
      id: `certtype-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ certificationTypes: [...state.certificationTypes, newType] }));
  },

  updateCertificationType: (id, updates) => {
    set((state) => ({
      certificationTypes: state.certificationTypes.map((type) =>
        type.id === id ? { ...type, ...updates, updatedAt: new Date().toISOString() } : type
      )
    }));
  },

  deleteCertificationType: (id) => {
    set((state) => ({
      certificationTypes: state.certificationTypes.filter((type) => type.id !== id)
    }));
  },

  getCertificationTypesByTenant: (tenantId) => {
    return get().certificationTypes.filter((type) => type.tenantId === tenantId);
  },

  orders: [
    {
      id: 'order-1',
      tenantId: 'tenant-1',
      number: '№12-ПБ',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'attestation',
      title: 'О направлении на аттестацию по промышленной безопасности',
      employeeIds: ['personnel-1', 'personnel-2'],
      status: 'approved',
      createdBy: 'Директор И.И. Петров',
      description: 'Направить сотрудников на аттестацию в АНО ДПО "Учебный центр"',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-2',
      tenantId: 'tenant-1',
      number: '№08-ОТ',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'training',
      title: 'Об организации обучения по охране труда',
      employeeIds: ['personnel-1', 'personnel-3'],
      status: 'completed',
      createdBy: 'Специалист по ОТ А.С. Иванова',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-3',
      tenantId: 'tenant-1',
      number: '№19-О',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'suspension',
      title: 'Об отстранении от работы',
      employeeIds: ['personnel-2'],
      status: 'active',
      createdBy: 'Директор И.И. Петров',
      description: 'В связи с истечением срока действия аттестации',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ orders: [...state.orders, newOrder] }));
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
      )
    }));
  },

  deleteOrder: (id) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id)
    }));
  },

  getOrdersByTenant: (tenantId) => {
    return get().orders.filter((order) => order.tenantId === tenantId);
  },

  trainings: [
    {
      id: 'training-1',
      tenantId: 'tenant-1',
      title: 'Промышленная безопасность А.1',
      type: 'periodic',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-1', 'personnel-2'],
      organizationId: 'external-org-1',
      cost: 15000,
      status: 'planned',
      program: 'Программа обучения по промышленной безопасности (72 часа)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'training-2',
      tenantId: 'tenant-1',
      title: 'Электробезопасность III группа',
      type: 'initial',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-3'],
      organizationId: 'external-org-1',
      cost: 8000,
      status: 'planned',
      program: 'Программа подготовки электротехнического персонала',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'training-3',
      tenantId: 'tenant-1',
      title: 'Работы на высоте (группа 2)',
      type: 'periodic',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-1'],
      organizationId: 'external-org-2',
      cost: 12000,
      status: 'completed',
      certificateNumber: 'УПК-2024-15487',
      certificateIssueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'training-4',
      tenantId: 'tenant-1',
      title: 'Промышленная безопасность А.1 (СДО)',
      type: 'periodic',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-2', 'personnel-3'],
      organizationId: 'external-org-1',
      cost: 8000,
      status: 'in_progress',
      sdoProgress: 65,
      sdoCompletedLessons: 13,
      sdoTotalLessons: 20,
      participants: [
        {
          employeeId: 'personnel-2',
          status: 'in_progress',
          progress: 75,
          testScore: undefined,
          testMaxScore: 20
        },
        {
          employeeId: 'personnel-3',
          status: 'in_progress',
          progress: 55,
          testScore: undefined,
          testMaxScore: 20
        }
      ],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'training-5',
      tenantId: 'tenant-1',
      title: 'Электробезопасность 4 группа до 1000В',
      type: 'initial',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      employeeIds: ['personnel-1', 'personnel-2'],
      organizationId: 'external-org-1',
      cost: 24000,
      status: 'completed',
      certificateNumber: 'ЭБ-2024-09234',
      certificateIssueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      participants: [
        {
          employeeId: 'personnel-1',
          status: 'completed',
          progress: 100,
          testScore: 18,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          employeeId: 'personnel-2',
          status: 'completed',
          progress: 100,
          testScore: 17,
          testMaxScore: 20,
          completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  addTraining: (training) => {
    const newTraining: Training = {
      ...training,
      id: `training-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ trainings: [...state.trainings, newTraining] }));
  },

  updateTraining: (id, updates) => {
    set((state) => ({
      trainings: state.trainings.map((training) =>
        training.id === id ? { ...training, ...updates, updatedAt: new Date().toISOString() } : training
      )
    }));
  },

  deleteTraining: (id) => {
    set((state) => ({
      trainings: state.trainings.filter((training) => training.id !== id)
    }));
  },

  getTrainingsByTenant: (tenantId) => {
    return get().trainings.filter((training) => training.tenantId === tenantId);
  },

  notificationRules: [
    {
      id: 'rule-1',
      tenantId: 'tenant-1',
      name: 'Уведомление за 90 дней',
      enabled: true,
      daysBeforeExpiry: 90,
      notifyEmployee: true,
      notifyManager: true,
      notifyHR: true,
      emailTemplate: 'Срок действия вашей аттестации истекает через 90 дней',
      frequency: 'once',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rule-2',
      tenantId: 'tenant-1',
      name: 'Уведомление за 30 дней',
      enabled: true,
      daysBeforeExpiry: 30,
      notifyEmployee: true,
      notifyManager: true,
      notifyHR: true,
      emailTemplate: 'Внимание! Срок действия аттестации истекает через 30 дней',
      frequency: 'weekly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rule-3',
      tenantId: 'tenant-1',
      name: 'Критическое уведомление (7 дней)',
      enabled: true,
      daysBeforeExpiry: 7,
      notifyEmployee: true,
      notifyManager: true,
      notifyHR: true,
      emailTemplate: 'СРОЧНО! Аттестация истекает через 7 дней',
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  addNotificationRule: (rule) => {
    const newRule: NotificationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ notificationRules: [...state.notificationRules, newRule] }));
  },

  updateNotificationRule: (id, updates) => {
    set((state) => ({
      notificationRules: state.notificationRules.map((rule) =>
        rule.id === id ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule
      )
    }));
  },

  deleteNotificationRule: (id) => {
    set((state) => ({
      notificationRules: state.notificationRules.filter((rule) => rule.id !== id)
    }));
  },

  getNotificationRulesByTenant: (tenantId) => {
    return get().notificationRules.filter((rule) => rule.tenantId === tenantId);
  },

  notificationLogs: [
    {
      id: 'log-1',
      tenantId: 'tenant-1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'email',
      recipient: 'ivanov@company.ru',
      employeeId: 'personnel-1',
      certificationId: 'cert-2',
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'log-2',
      tenantId: 'tenant-1',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'email',
      recipient: 'petrov@company.ru',
      employeeId: 'personnel-2',
      certificationId: 'cert-5',
      status: 'sent',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'log-3',
      tenantId: 'tenant-1',
      date: new Date().toISOString(),
      type: 'email',
      recipient: 'sidorov@company.ru',
      employeeId: 'personnel-3',
      certificationId: 'cert-6',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ],

  addNotificationLog: (log) => {
    const newLog: NotificationLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ notificationLogs: [...state.notificationLogs, newLog] }));
  },

  getNotificationLogsByTenant: (tenantId) => {
    return get().notificationLogs.filter((log) => log.tenantId === tenantId);
  }
}), {
  name: 'attestation-storage'
}));