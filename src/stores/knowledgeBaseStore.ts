// src/stores/knowledgeBaseStore.ts
// Описание: Zustand store для управления базой знаний и документами
import { create } from 'zustand';
import type { KnowledgeDocument, DocumentCategory, DocumentVersion } from '@/types';

interface KnowledgeBaseState {
  documents: KnowledgeDocument[];
  getDocumentsByCategory: (category: DocumentCategory) => KnowledgeDocument[];
  addDocument: (document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'downloadsCount'>) => void;
  updateDocument: (id: string, updates: Partial<KnowledgeDocument>, changeDescription?: string, currentUser?: string) => void;
  deleteDocument: (id: string) => void;
  incrementViews: (id: string) => void;
  incrementDownloads: (id: string) => void;
  getDocumentVersions: (id: string) => DocumentVersion[];
  restoreVersion: (id: string, versionNumber: string) => void;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set, get) => ({
  documents: [
    {
      id: 'doc-3',
      tenantId: 'tenant-1',
      category: 'regulatory',
      title: 'О промышленной безопасности опасных производственных объектов',
      description: 'Основной нормативный документ, регулирующий вопросы промышленной безопасности опасных производственных объектов.',
      fileName: 'FZ-116.pdf',
      fileSize: 2456789,
      tags: ['закон', 'промбезопасность', 'ОПО'],
      version: 'ред. от 11.06.2021',
      author: 'Система',
      status: 'published',
      regulatoryType: 'federal_law',
      documentNumber: '116-ФЗ',
      adoptionDate: '1997-07-21',
      regulatoryStatus: 'active',
      viewsCount: 234,
      downloadsCount: 87,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-4',
      tenantId: 'tenant-1',
      category: 'regulatory',
      title: 'Правила по охране труда при работе на высоте',
      description: 'Устанавливает требования по охране труда при выполнении работ на высоте.',
      fileName: 'Prikaz_782n.pdf',
      fileSize: 1234567,
      tags: ['охрана труда', 'работы на высоте', 'приказ'],
      version: 'от 16.11.2020',
      author: 'Система',
      status: 'published',
      regulatoryType: 'mintrud_order',
      documentNumber: '782н',
      authority: 'mintrud',
      adoptionDate: '2020-11-16',
      regulatoryStatus: 'active',
      viewsCount: 178,
      downloadsCount: 65,
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-regulatory-1',
      tenantId: 'tenant-1',
      category: 'regulatory',
      title: 'Об утверждении Порядка расследования причин аварий на опасных объектах',
      description: 'Постановление Правительства РФ, устанавливающее порядок расследования и учета аварий на опасных производственных объектах.',
      fileName: 'PP_743.pdf',
      fileSize: 890456,
      tags: ['постановление', 'расследование', 'аварии', 'ОПО'],
      version: 'от 05.09.2020',
      author: 'Система',
      status: 'published',
      regulatoryType: 'government_decree',
      documentNumber: '743',
      adoptionDate: '2020-09-05',
      regulatoryStatus: 'active',
      viewsCount: 145,
      downloadsCount: 52,
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-regulatory-2',
      tenantId: 'tenant-1',
      category: 'regulatory',
      title: 'О безопасности объектов топливно-энергетического комплекса',
      description: 'Федеральный закон, регулирующий отношения в области обеспечения безопасности объектов ТЭК.',
      fileName: 'FZ-256.pdf',
      fileSize: 1567890,
      tags: ['закон', 'ТЭК', 'безопасность'],
      version: 'от 21.07.2011',
      author: 'Система',
      status: 'published',
      regulatoryType: 'federal_law',
      documentNumber: '256-ФЗ',
      adoptionDate: '2011-07-21',
      regulatoryStatus: 'active',
      viewsCount: 98,
      downloadsCount: 34,
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-regulatory-3',
      tenantId: 'tenant-1',
      category: 'regulatory',
      title: 'Требования к проведению экспертизы промышленной безопасности',
      description: 'Приказ Ростехнадзора, устанавливающий требования к организации и проведению экспертизы промышленной безопасности.',
      fileName: 'Prikaz_RTN_538.pdf',
      fileSize: 2345678,
      tags: ['экспертиза', 'промбезопасность', 'ростехнадзор'],
      version: 'от 15.12.2020',
      author: 'Система',
      status: 'published',
      regulatoryType: 'rostekhnadzor_order',
      documentNumber: '538',
      authority: 'rostekhnadzor',
      adoptionDate: '2020-12-15',
      expiryDate: '2025-12-31',
      regulatoryStatus: 'active',
      viewsCount: 167,
      downloadsCount: 71,
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-regulatory-4',
      tenantId: 'tenant-1',
      category: 'regulatory',
      title: 'Об утверждении состава разделов проектной документации и требований к их содержанию',
      description: 'Постановление Правительства РФ о требованиях к проектной документации и результатам инженерных изысканий.',
      fileName: 'PP_87.pdf',
      fileSize: 1234567,
      tags: ['постановление', 'проектная документация', 'строительство'],
      version: 'от 16.02.2008',
      author: 'Система',
      status: 'published',
      regulatoryType: 'government_decree',
      documentNumber: '87',
      adoptionDate: '2008-02-16',
      expiryDate: '2024-12-31',
      regulatoryStatus: 'inactive',
      viewsCount: 89,
      downloadsCount: 28,
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-5',
      tenantId: 'tenant-1',
      category: 'organization',
      title: 'Положение о системе управления охраной труда',
      description: 'Локальный нормативный акт организации, устанавливающий порядок функционирования СУОТ.',
      fileName: 'SUOT_Polozhenie.docx',
      fileSize: 456789,
      tags: ['СУОТ', 'положение', 'внутренний документ'],
      version: '3.0',
      author: 'Петров П.П.',
      status: 'published',
      viewsCount: 145,
      downloadsCount: 38,
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-6',
      tenantId: 'tenant-1',
      category: 'organization',
      title: 'Инструкция по действиям при возникновении аварийной ситуации',
      description: 'Пошаговые действия персонала при возникновении нештатных и аварийных ситуаций на производстве.',
      fileName: 'Instruktsiya_Avariya.pdf',
      fileSize: 789456,
      tags: ['инструкция', 'авария', 'действия персонала'],
      version: '2.1',
      author: 'Сидоров С.С.',
      status: 'published',
      viewsCount: 267,
      downloadsCount: 95,
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'platform-1',
      tenantId: 'platform',
      category: 'platform_instruction',
      title: 'Руководство по работе с модулем базы знаний',
      description: 'Подробное руководство по использованию модуля базы знаний: создание документов, организация структуры, поиск и управление доступом.',
      content: '# Модуль базы знаний\n\n## Введение\n\nМодуль базы знаний предназначен для централизованного хранения и управления документацией организации...',
      tags: ['база знаний', 'инструкция', 'руководство'],
      author: 'SuperAdmin',
      status: 'published',
      viewsCount: 523,
      downloadsCount: 145,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'platform-2',
      tenantId: 'platform',
      category: 'platform_instruction',
      title: 'Работа с нормативными документами в системе',
      description: 'Инструкция по добавлению, классификации и актуализации нормативных документов в базе знаний.',
      content: '# Работа с нормативными документами\n\n## Добавление документа\n\n1. Перейдите в раздел "База знаний"\n2. Нажмите кнопку "Добавить документ"...',
      tags: ['нормативные документы', 'законодательство', 'инструкция'],
      author: 'SuperAdmin',
      status: 'published',
      viewsCount: 387,
      downloadsCount: 98,
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'platform-3',
      tenantId: 'platform',
      category: 'platform_instruction',
      title: 'Настройка прав доступа к документам',
      description: 'Руководство по управлению правами доступа к документам для различных ролей пользователей.',
      fileName: 'Access_Control_Guide.pdf',
      fileSize: 2345678,
      tags: ['права доступа', 'безопасность', 'администрирование'],
      author: 'SuperAdmin',
      status: 'published',
      viewsCount: 214,
      downloadsCount: 67,
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  getDocumentsByCategory: (category) => {
    return get().documents.filter(doc => doc.category === category && doc.status === 'published');
  },

  addDocument: (document) => {
    const now = new Date().toISOString();
    const newDocument: KnowledgeDocument = {
      ...document,
      id: `doc-${Date.now()}`,
      viewsCount: 0,
      downloadsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      documents: [newDocument, ...state.documents],
    }));
  },

  updateDocument: (id, updates, changeDescription, currentUser) => {
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== id) return doc;

        const now = new Date().toISOString();
        const currentVersion: DocumentVersion = {
          versionNumber: doc.version || '1.0',
          createdAt: doc.updatedAt,
          createdBy: doc.author,
          changeDescription: changeDescription || 'Обновление документа',
          content: doc.content,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          fileUrl: doc.fileUrl,
        };

        const newVersionNumber = updates.version || doc.version || '1.0';
        const existingVersions = doc.versions || [];
        
        const shouldSaveVersion = 
          updates.content !== undefined || 
          updates.fileName !== undefined ||
          updates.version !== undefined;

        return {
          ...doc,
          ...updates,
          updatedAt: now,
          versions: shouldSaveVersion 
            ? [currentVersion, ...existingVersions]
            : existingVersions,
          version: newVersionNumber,
        };
      }),
    }));
  },

  deleteDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },

  incrementViews: (id) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, viewsCount: doc.viewsCount + 1 } : doc
      ),
    }));
  },

  incrementDownloads: (id) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, downloadsCount: doc.downloadsCount + 1 } : doc
      ),
    }));
  },

  getDocumentVersions: (id) => {
    const doc = get().documents.find(d => d.id === id);
    return doc?.versions || [];
  },

  restoreVersion: (id, versionNumber) => {
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== id) return doc;

        const versionToRestore = doc.versions?.find(v => v.versionNumber === versionNumber);
        if (!versionToRestore) return doc;

        const now = new Date().toISOString();
        const currentVersion: DocumentVersion = {
          versionNumber: doc.version || '1.0',
          createdAt: doc.updatedAt,
          createdBy: doc.author,
          changeDescription: 'Текущая версия перед восстановлением',
          content: doc.content,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          fileUrl: doc.fileUrl,
        };

        return {
          ...doc,
          content: versionToRestore.content,
          fileName: versionToRestore.fileName,
          fileSize: versionToRestore.fileSize,
          fileUrl: versionToRestore.fileUrl,
          version: versionToRestore.versionNumber,
          updatedAt: now,
          versions: [currentVersion, ...(doc.versions || [])],
        };
      }),
    }));
  },
}));