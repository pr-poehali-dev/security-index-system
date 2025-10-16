// src/stores/attestationNotificationsStore.ts
// Описание: Zustand store для управления автоматическими уведомлениями об истечении сроков аттестации
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttestationNotificationRule {
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
  type?: 'certification' | 'qualification' | 'both';
  createdAt: string;
  updatedAt: string;
}

export interface AttestationNotificationLog {
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

interface AttestationNotificationsState {
  notificationRules: AttestationNotificationRule[];
  notificationLogs: AttestationNotificationLog[];
  
  addNotificationRule: (rule: Omit<AttestationNotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNotificationRule: (id: string, updates: Partial<AttestationNotificationRule>) => void;
  deleteNotificationRule: (id: string) => void;
  getNotificationRulesByTenant: (tenantId: string) => AttestationNotificationRule[];
  
  addNotificationLog: (log: Omit<AttestationNotificationLog, 'id' | 'createdAt'>) => void;
  getNotificationLogsByTenant: (tenantId: string) => AttestationNotificationLog[];
}

export const useAttestationNotificationsStore = create<AttestationNotificationsState>()(persist((set, get) => ({
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
      type: 'certification',
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
      type: 'certification',
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
      type: 'certification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rule-4',
      tenantId: 'tenant-1',
      name: 'Удостоверение ПК истекает (90 дней)',
      enabled: true,
      daysBeforeExpiry: 90,
      notifyEmployee: true,
      notifyManager: true,
      notifyHR: true,
      emailTemplate: 'Срок действия удостоверения повышения квалификации истекает через 90 дней',
      frequency: 'once',
      type: 'qualification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rule-5',
      tenantId: 'tenant-1',
      name: 'Удостоверение ПК истекает (30 дней)',
      enabled: true,
      daysBeforeExpiry: 30,
      notifyEmployee: true,
      notifyManager: false,
      notifyHR: true,
      emailTemplate: 'Внимание! Удостоверение ПК истекает через 30 дней. Необходимо пройти обучение',
      frequency: 'weekly',
      type: 'qualification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  addNotificationRule: (rule) => {
    const newRule: AttestationNotificationRule = {
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
    const newLog: AttestationNotificationLog = {
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
  name: 'attestation-notifications-storage'
}));