import { create } from 'zustand';
import {
  Contractor,
  ContractorEmployee,
  ContractorEmployeeAttestation,
  ContractorEmployeeObject,
  ContractorComplianceCheck,
  ObjectPersonnel,
  ContractorFormData,
  EmployeeFormData,
  AttestationFormData,
  ObjectAccessFormData,
} from '../types/contractors';

interface ContractorsState {
  contractors: Contractor[];
  employees: ContractorEmployee[];
  attestations: ContractorEmployeeAttestation[];
  objectAccess: ContractorEmployeeObject[];
  loading: boolean;
  error: string | null;

  // Contractors CRUD
  fetchContractors: () => Promise<void>;
  createContractor: (data: ContractorFormData) => Promise<void>;
  updateContractor: (id: string, data: Partial<ContractorFormData>) => Promise<void>;
  deleteContractor: (id: string) => Promise<void>;
  updateContractorRating: (id: string, rating: number) => Promise<void>;

  // Employees CRUD
  fetchEmployees: (contractorId?: string) => Promise<void>;
  createEmployee: (data: EmployeeFormData) => Promise<void>;
  updateEmployee: (id: string, data: Partial<EmployeeFormData>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Attestations CRUD
  fetchAttestations: (employeeId: string) => Promise<void>;
  createAttestation: (data: AttestationFormData) => Promise<void>;
  updateAttestation: (id: string, data: Partial<AttestationFormData>) => Promise<void>;
  deleteAttestation: (id: string) => Promise<void>;

  // Object Access CRUD
  fetchObjectAccess: (objectId?: string, employeeId?: string) => Promise<void>;
  grantObjectAccess: (data: ObjectAccessFormData) => Promise<void>;
  revokeObjectAccess: (id: string, reason: string) => Promise<void>;
  updateObjectAccess: (id: string, data: Partial<ObjectAccessFormData>) => Promise<void>;

  // Compliance checks
  checkEmployeeCompliance: (employeeId: string, objectId: string) => Promise<ContractorComplianceCheck>;
  getObjectPersonnel: (objectId: string) => Promise<ObjectPersonnel>;

  // Helpers
  getContractorsByType: (type: 'contractor' | 'training_center') => Contractor[];
  getTrainingCenters: () => Contractor[];

  // Utils
  clearError: () => void;
}

export const useContractorsStore = create<ContractorsState>((set, get) => ({
  contractors: [],
  employees: [],
  attestations: [],
  objectAccess: [],
  loading: false,
  error: null,

  fetchContractors: async () => {
    set({ loading: true, error: null });
    try {
      const mockData: Contractor[] = [
        {
          id: 'contractor-1',
          tenantId: 'tenant-1',
          name: 'ООО "ГазТехСервис"',
          type: 'contractor',
          inn: '7701234567',
          kpp: '770101001',
          legalAddress: 'г. Москва, ул. Промышленная, д. 15',
          actualAddress: 'г. Москва, ул. Промышленная, д. 15',
          directorName: 'Петров Петр Петрович',
          contactPhone: '+7 (495) 123-45-67',
          contactEmail: 'info@gazteh.ru',
          contractNumber: '№ 45/2024',
          contractDate: '2024-01-15',
          contractExpiry: '2025-12-31',
          contractAmount: 5000000,
          allowedWorkTypes: ['Монтаж газового оборудования', 'Диагностика', 'Ремонт'],
          sroNumber: 'СРО-С-123-45678',
          sroExpiry: '2025-06-30',
          insuranceNumber: 'АА 1234567890',
          insuranceExpiry: '2025-03-15',
          rating: 4.5,
          status: 'active',
          notes: 'Надежный подрядчик',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: 'contractor-2',
          tenantId: 'tenant-1',
          name: 'ООО "СтройГазМонтаж"',
          type: 'contractor',
          inn: '7702345678',
          kpp: '770201001',
          legalAddress: 'г. Москва, пр-т Строителей, д. 7',
          actualAddress: 'г. Москва, пр-т Строителей, д. 7',
          directorName: 'Иванов Иван Иванович',
          contactPhone: '+7 (495) 234-56-78',
          contactEmail: 'office@stroygaz.ru',
          contractNumber: '№ 78/2024',
          contractDate: '2024-02-01',
          contractExpiry: '2025-12-31',
          contractAmount: 8500000,
          allowedWorkTypes: ['Монтаж', 'Пусконаладка', 'ТО'],
          sroNumber: 'СРО-С-987-65432',
          sroExpiry: '2025-08-31',
          insuranceNumber: 'ББ 9876543210',
          insuranceExpiry: '2025-07-20',
          rating: 4.8,
          status: 'active',
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z',
        },
        {
          id: 'training-center-1',
          tenantId: 'tenant-1',
          name: 'Учебный центр "ГазПромАттестация"',
          type: 'training_center',
          inn: '7703456789',
          kpp: '770301001',
          legalAddress: 'г. Москва, ул. Учебная, д. 22',
          actualAddress: 'г. Москва, ул. Учебная, д. 22',
          directorName: 'Сидоров Сидор Сидорович',
          contactPhone: '+7 (495) 345-67-89',
          contactEmail: 'info@gazpromatest.ru',
          rating: 4.9,
          status: 'active',
          accreditations: ['РосТехНадзор', 'ISO 9001:2015', 'Минтруд России'],
          website: 'https://gazpromatest.ru',
          createdAt: '2023-05-15T10:00:00Z',
          updatedAt: '2023-05-15T10:00:00Z',
        },
      ];
      set({ contractors: mockData, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createContractor: async (data: ContractorFormData) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/contractors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const newContractor = await response.json();
      
      const newContractor: Contractor = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        tenantId: 'current-tenant-id', // TODO: Get from auth
        type: data.type || 'contractor',
        rating: data.rating || 0,
        accreditations: data.accreditations || [],
        website: data.website || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        contractors: [...state.contractors, newContractor],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateContractor: async (id: string, data: Partial<ContractorFormData>) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        contractors: state.contractors.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteContractor: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        contractors: state.contractors.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateContractorRating: async (id: string, rating: number) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        contractors: state.contractors.map((c) =>
          c.id === id ? { ...c, rating, updatedAt: new Date().toISOString() } : c
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchEmployees: async (contractorId?: string) => {
    set({ loading: true, error: null });
    try {
      const allEmployees: ContractorEmployee[] = [
        {
          id: 'employee-1',
          contractorId: 'contractor-1',
          tenantId: 'tenant-1',
          fullName: 'Смирнов Алексей Владимирович',
          position: 'Монтажник газового оборудования',
          phone: '+7 (916) 123-45-67',
          email: 'smirnov@gazteh.ru',
          passportSeries: '4512',
          passportNumber: '123456',
          snils: '123-456-789 01',
          medicalCheckupDate: '2024-01-15',
          medicalCheckupExpiry: '2025-01-15',
          fireSafetyTrainingDate: '2024-02-01',
          fireSafetyTrainingExpiry: '2025-02-01',
          laborSafetyTrainingDate: '2024-02-01',
          laborSafetyTrainingExpiry: '2025-02-01',
          status: 'active',
          notes: 'Опытный специалист',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
        },
        {
          id: 'employee-2',
          contractorId: 'contractor-1',
          tenantId: 'tenant-1',
          fullName: 'Кузнецов Дмитрий Сергеевич',
          position: 'Инженер-диагност',
          phone: '+7 (916) 234-56-78',
          email: 'kuznetsov@gazteh.ru',
          passportSeries: '4513',
          passportNumber: '234567',
          snils: '234-567-890 12',
          medicalCheckupDate: '2024-03-01',
          medicalCheckupExpiry: '2025-03-01',
          fireSafetyTrainingDate: '2024-03-10',
          fireSafetyTrainingExpiry: '2025-03-10',
          laborSafetyTrainingDate: '2024-03-10',
          laborSafetyTrainingExpiry: '2025-03-10',
          status: 'active',
          createdAt: '2024-02-15T10:00:00Z',
          updatedAt: '2024-02-15T10:00:00Z',
        },
        {
          id: 'employee-3',
          contractorId: 'contractor-1',
          tenantId: 'tenant-1',
          fullName: 'Васильев Михаил Александрович',
          position: 'Слесарь по ремонту',
          phone: '+7 (916) 345-67-89',
          email: 'vasilev@gazteh.ru',
          passportSeries: '4514',
          passportNumber: '345678',
          snils: '345-678-901 23',
          medicalCheckupDate: '2024-02-20',
          medicalCheckupExpiry: '2025-02-20',
          fireSafetyTrainingDate: '2024-03-01',
          fireSafetyTrainingExpiry: '2025-03-01',
          laborSafetyTrainingDate: '2024-03-01',
          laborSafetyTrainingExpiry: '2025-03-01',
          status: 'active',
          createdAt: '2024-02-20T10:00:00Z',
          updatedAt: '2024-02-20T10:00:00Z',
        },
        {
          id: 'employee-4',
          contractorId: 'contractor-2',
          tenantId: 'tenant-1',
          fullName: 'Морозов Сергей Павлович',
          position: 'Мастер монтажных работ',
          phone: '+7 (916) 456-78-90',
          email: 'morozov@stroygaz.ru',
          passportSeries: '4515',
          passportNumber: '456789',
          snils: '456-789-012 34',
          medicalCheckupDate: '2024-04-01',
          medicalCheckupExpiry: '2025-04-01',
          fireSafetyTrainingDate: '2024-04-15',
          fireSafetyTrainingExpiry: '2025-04-15',
          laborSafetyTrainingDate: '2024-04-15',
          laborSafetyTrainingExpiry: '2025-04-15',
          status: 'active',
          createdAt: '2024-03-01T10:00:00Z',
          updatedAt: '2024-03-01T10:00:00Z',
        },
        {
          id: 'employee-5',
          contractorId: 'contractor-2',
          tenantId: 'tenant-1',
          fullName: 'Николаев Андрей Викторович',
          position: 'Инженер пусконаладочных работ',
          phone: '+7 (916) 567-89-01',
          email: 'nikolaev@stroygaz.ru',
          passportSeries: '4516',
          passportNumber: '567890',
          snils: '567-890-123 45',
          medicalCheckupDate: '2024-05-01',
          medicalCheckupExpiry: '2025-05-01',
          fireSafetyTrainingDate: '2024-05-10',
          fireSafetyTrainingExpiry: '2025-05-10',
          laborSafetyTrainingDate: '2024-05-10',
          laborSafetyTrainingExpiry: '2025-05-10',
          status: 'active',
          createdAt: '2024-04-01T10:00:00Z',
          updatedAt: '2024-04-01T10:00:00Z',
        },
      ];
      
      const mockData = contractorId 
        ? allEmployees.filter(e => e.contractorId === contractorId)
        : allEmployees;
      
      set({ employees: mockData, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createEmployee: async (data: EmployeeFormData) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const newEmployee: ContractorEmployee = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        tenantId: 'current-tenant-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        employees: [...state.employees, newEmployee],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateEmployee: async (id: string, data: Partial<EmployeeFormData>) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        employees: state.employees.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteEmployee: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        employees: state.employees.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchAttestations: async (employeeId: string) => {
    set({ loading: true, error: null });
    try {
      const allAttestations: ContractorEmployeeAttestation[] = [
        {
          id: 'att-1',
          employeeId: 'employee-1',
          attestationArea: 'Б.1.1. Эксплуатация сетей газораспределения',
          certificateNumber: 'РТН-001-2024',
          issueDate: '2024-01-20',
          expiryDate: '2029-01-20',
          issuingAuthority: 'РосТехНадзор',
          status: 'valid',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
        {
          id: 'att-2',
          employeeId: 'employee-1',
          attestationArea: 'Б.1.2. Монтаж газового оборудования',
          certificateNumber: 'РТН-002-2024',
          issueDate: '2024-01-20',
          expiryDate: '2029-01-20',
          issuingAuthority: 'РосТехНадзор',
          status: 'valid',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
        {
          id: 'att-3',
          employeeId: 'employee-2',
          attestationArea: 'Б.1.3. Диагностика газового оборудования',
          certificateNumber: 'РТН-003-2024',
          issueDate: '2024-03-05',
          expiryDate: '2029-03-05',
          issuingAuthority: 'РосТехНадзор',
          status: 'valid',
          createdAt: '2024-03-05T10:00:00Z',
          updatedAt: '2024-03-05T10:00:00Z',
        },
        {
          id: 'att-4',
          employeeId: 'employee-3',
          attestationArea: 'Б.1.4. Ремонт газового оборудования',
          certificateNumber: 'РТН-004-2024',
          issueDate: '2024-03-01',
          expiryDate: '2029-03-01',
          issuingAuthority: 'РосТехНадзор',
          status: 'valid',
          createdAt: '2024-03-01T10:00:00Z',
          updatedAt: '2024-03-01T10:00:00Z',
        },
        {
          id: 'att-5',
          employeeId: 'employee-4',
          attestationArea: 'Б.1.1. Эксплуатация сетей газораспределения',
          certificateNumber: 'РТН-005-2024',
          issueDate: '2024-04-10',
          expiryDate: '2029-04-10',
          issuingAuthority: 'РосТехНадзор',
          status: 'valid',
          createdAt: '2024-04-10T10:00:00Z',
          updatedAt: '2024-04-10T10:00:00Z',
        },
        {
          id: 'att-6',
          employeeId: 'employee-4',
          attestationArea: 'Б.1.2. Монтаж газового оборудования',
          certificateNumber: 'РТН-006-2024',
          issueDate: '2024-04-10',
          expiryDate: '2029-04-10',
          issuingAuthority: 'РосТехНадзор',
          status: 'valid',
          createdAt: '2024-04-10T10:00:00Z',
          updatedAt: '2024-04-10T10:00:00Z',
        },
        {
          id: 'att-7',
          employeeId: 'employee-5',
          attestationArea: 'Б.1.5. Пусконаладочные работы',
          certificateNumber: 'РТН-007-2024',
          issueDate: '2024-05-15',
          expiryDate: '2029-05-15',
          issuingAuthority: 'РосТехНадзор',
          status: 'valid',
          createdAt: '2024-05-15T10:00:00Z',
          updatedAt: '2024-05-15T10:00:00Z',
        },
      ];
      
      const mockData = allAttestations.filter(a => a.employeeId === employeeId);
      set({ attestations: mockData, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createAttestation: async (data: AttestationFormData) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const newAttestation: ContractorEmployeeAttestation = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        status: 'valid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        attestations: [...state.attestations, newAttestation],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateAttestation: async (id: string, data: Partial<AttestationFormData>) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        attestations: state.attestations.map((a) =>
          a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteAttestation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        attestations: state.attestations.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchObjectAccess: async (objectId?: string, employeeId?: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const mockData: ContractorEmployeeObject[] = [];
      set({ objectAccess: mockData, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  grantObjectAccess: async (data: ObjectAccessFormData) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const newAccess: ContractorEmployeeObject = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        accessStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        objectAccess: [...state.objectAccess, newAccess],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  revokeObjectAccess: async (id: string, reason: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        objectAccess: state.objectAccess.map((a) =>
          a.id === id
            ? {
                ...a,
                accessStatus: 'revoked',
                revokeReason: reason,
                updatedAt: new Date().toISOString(),
              }
            : a
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateObjectAccess: async (id: string, data: Partial<ObjectAccessFormData>) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      set((state) => ({
        objectAccess: state.objectAccess.map((a) =>
          a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  checkEmployeeCompliance: async (
    employeeId: string,
    objectId: string
  ): Promise<ContractorComplianceCheck> => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const mockCheck: ContractorComplianceCheck = {
        employeeId,
        objectId,
        compliant: true,
        missingCompetencies: [],
        expiringAttestations: [],
        expiredAttestations: [],
        missingDocuments: [],
      };
      
      set({ loading: false });
      return mockCheck;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getObjectPersonnel: async (objectId: string): Promise<ObjectPersonnel> => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      const mockData: ObjectPersonnel = {
        objectId,
        requiredCompetencies: [],
        employees: [],
        summary: {
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          expiringSoon: 0,
        },
      };
      
      set({ loading: false });
      return mockData;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getContractorsByType: (type: 'contractor' | 'training_center') => {
    const { contractors } = get();
    return contractors.filter((c) => c.type === type);
  },

  getTrainingCenters: () => {
    const { contractors } = get();
    return contractors.filter((c) => c.type === 'training_center');
  },

  clearError: () => set({ error: null }),
}));