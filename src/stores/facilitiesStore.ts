import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility, FacilityComponent, Organization, TerritorialAuthority } from '@/types/facilities';

interface FacilitiesState {
  organizations: Organization[];
  facilities: Facility[];
  components: FacilityComponent[];
  territorialAuthorities: TerritorialAuthority[];
  
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  getOrganizationsByTenant: (tenantId: string) => Organization[];
  
  addFacility: (facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFacility: (id: string, updates: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  getFacilitiesByTenant: (tenantId: string) => Facility[];
  getFacilitiesByOrganization: (organizationId: string) => Facility[];
  
  addComponent: (component: Omit<FacilityComponent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComponent: (id: string, updates: Partial<FacilityComponent>) => void;
  deleteComponent: (id: string) => void;
  getComponentsByFacility: (facilityId: string) => FacilityComponent[];
  getComponentsByTenant: (tenantId: string) => FacilityComponent[];
  
  getTerritorialAuthorities: () => TerritorialAuthority[];
}

const mockTerritorialAuthorities: TerritorialAuthority[] = [
  {
    id: '1',
    fullName: 'Управление Ростехнадзора по Московской области',
    shortName: 'УРТ по МО',
    code: 'RTN-77',
    region: 'Московская область',
    address: 'г. Москва, ул. Примерная, д. 1',
    phone: '+7 (495) 123-45-67',
    email: 'moscow@gosnadzor.ru'
  },
  {
    id: '2',
    fullName: 'Управление Ростехнадзора по Санкт-Петербургу',
    shortName: 'УРТ по СПб',
    code: 'RTN-78',
    region: 'Санкт-Петербург',
    address: 'г. Санкт-Петербург, Невский пр., д. 100',
    phone: '+7 (812) 987-65-43',
    email: 'spb@gosnadzor.ru'
  }
];

export const useFacilitiesStore = create<FacilitiesState>()(
  persist(
    (set, get) => ({
      organizations: [],
      facilities: [],
      components: [],
      territorialAuthorities: mockTerritorialAuthorities,
      
      addOrganization: (org) => {
        const newOrg: Organization = {
          ...org,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          organizations: [...state.organizations, newOrg],
        }));
      },
      
      updateOrganization: (id, updates) => {
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...updates, updatedAt: new Date().toISOString() } : org
          ),
        }));
      },
      
      deleteOrganization: (id) => {
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== id),
        }));
      },
      
      getOrganizationsByTenant: (tenantId) => {
        return get().organizations.filter((org) => org.tenantId === tenantId);
      },
      
      addFacility: (facility) => {
        const newFacility: Facility = {
          ...facility,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          facilities: [...state.facilities, newFacility],
        }));
      },
      
      updateFacility: (id, updates) => {
        set((state) => ({
          facilities: state.facilities.map((facility) =>
            facility.id === id ? { ...facility, ...updates, updatedAt: new Date().toISOString() } : facility
          ),
        }));
      },
      
      deleteFacility: (id) => {
        set((state) => ({
          facilities: state.facilities.filter((facility) => facility.id !== id),
        }));
      },
      
      getFacilitiesByTenant: (tenantId) => {
        return get().facilities.filter((facility) => facility.tenantId === tenantId);
      },
      
      getFacilitiesByOrganization: (organizationId) => {
        return get().facilities.filter((facility) => facility.organizationId === organizationId);
      },
      
      addComponent: (component) => {
        const newComponent: FacilityComponent = {
          ...component,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          components: [...state.components, newComponent],
        }));
      },
      
      updateComponent: (id, updates) => {
        set((state) => ({
          components: state.components.map((component) =>
            component.id === id ? { ...component, ...updates, updatedAt: new Date().toISOString() } : component
          ),
        }));
      },
      
      deleteComponent: (id) => {
        set((state) => ({
          components: state.components.filter((component) => component.id !== id),
        }));
      },
      
      getComponentsByFacility: (facilityId) => {
        return get().components.filter((component) => component.facilityId === facilityId);
      },
      
      getComponentsByTenant: (tenantId) => {
        return get().components.filter((component) => component.tenantId === tenantId);
      },
      
      getTerritorialAuthorities: () => {
        return get().territorialAuthorities;
      },
    }),
    {
      name: 'facilities-storage',
    }
  )
);
