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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/contractors');
      // const data = await response.json();
      
      // Mock data for now
      const mockData: Contractor[] = [];
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
      // TODO: Replace with actual API call
      const mockData: ContractorEmployee[] = [];
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
      // TODO: Replace with actual API call
      const mockData: ContractorEmployeeAttestation[] = [];
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