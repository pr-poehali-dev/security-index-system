import { create } from 'zustand';
import type { KnowledgeDocument, DocumentCategory } from '@/types';

interface KnowledgeBaseState {
  documents: KnowledgeDocument[];
  getDocumentsByCategory: (category: DocumentCategory) => KnowledgeDocument[];
  addDocument: (document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'downloadsCount'>) => void;
  updateDocument: (id: string, updates: Partial<KnowledgeDocument>) => void;
  deleteDocument: (id: string) => void;
  incrementViews: (id: string) => void;
  incrementDownloads: (id: string) => void;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set, get) => ({
  documents: [
    {
      id: 'doc-1',
      tenantId: 'tenant-1',
      category: 'user_guide',
      title: 'Руководство пользователя: Модуль аттестации',
      description: 'Подробная инструкция по работе с модулем аттестации персонала. Включает примеры и пошаговые руководства.',
      content: '# Модуль аттестации\n\nДанный модуль предназначен для управления процессом аттестации сотрудников...',
      tags: ['аттестация', 'инструкция', 'обучение'],
      version: '2.0',
      author: 'Администратор системы',
      status: 'published',
      viewsCount: 156,
      downloadsCount: 42,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-2',
      tenantId: 'tenant-1',
      category: 'user_guide',
      title: 'Работа с каталогом объектов',
      description: 'Инструкция по добавлению и редактированию производственных объектов в системе.',
      tags: ['каталог', 'объекты', 'справочник'],
      version: '1.5',
      author: 'Иванов И.И.',
      status: 'published',
      viewsCount: 89,
      downloadsCount: 23,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'doc-3',
      tenantId: 'tenant-1',
      category: 'regulatory',
      title: 'Федеральный закон №116-ФЗ "О промышленной безопасности"',
      description: 'Основной нормативный документ, регулирующий вопросы промышленной безопасности опасных производственных объектов.',
      fileName: 'FZ-116.pdf',
      fileSize: 2456789,
      tags: ['закон', 'промбезопасность', 'ОПО'],
      version: 'ред. от 11.06.2021',
      author: 'Система',
      status: 'published',
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
      description: 'Приказ Минтруда России №782н от 16.11.2020. Устанавливает требования по охране труда при выполнении работ на высоте.',
      fileName: 'Prikaz_782n.pdf',
      fileSize: 1234567,
      tags: ['охрана труда', 'работы на высоте', 'приказ'],
      version: 'от 16.11.2020',
      author: 'Система',
      status: 'published',
      viewsCount: 178,
      downloadsCount: 65,
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
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

  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
      ),
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
}));
