import { create } from 'zustand';
import {
  mockFacilities,
  mockComponents,
  mockGtsSystems,
  mockContractors,
  mockTechnicalDiagnostics,
  mockIndustrialSafetyExpertises,
  mockOpoCharacteristics,
  type Facility,
  type Component,
  type GtsSystem,
  type Contractor,
  type TechnicalDiagnostic,
  type IndustrialSafetyExpertise,
  type OpoCharacteristic,
} from '../data/mockData';

interface FacilityCatalogStore {
  facilities: Facility[];
  components: Component[];
  gtsSystems: GtsSystem[];
  contractors: Contractor[];
  technicalDiagnostics: TechnicalDiagnostic[];
  industrialSafetyExpertises: IndustrialSafetyExpertise[];
  opoCharacteristics: OpoCharacteristic[];

  addFacility: (facility: Facility) => void;
  updateFacility: (id: string, facility: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  getFacilityById: (id: string) => Facility | undefined;

  addComponent: (component: Component) => void;
  updateComponent: (id: string, component: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  getComponentsByFacilityId: (facilityId: string) => Component[];

  addGtsSystem: (gtsSystem: GtsSystem) => void;
  updateGtsSystem: (id: string, gtsSystem: Partial<GtsSystem>) => void;
  deleteGtsSystem: (id: string) => void;

  addContractor: (contractor: Contractor) => void;
  updateContractor: (id: string, contractor: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;
  getContractorById: (id: string) => Contractor | undefined;

  addTechnicalDiagnostic: (diagnostic: TechnicalDiagnostic) => void;
  updateTechnicalDiagnostic: (id: string, diagnostic: Partial<TechnicalDiagnostic>) => void;
  deleteTechnicalDiagnostic: (id: string) => void;

  addIndustrialSafetyExpertise: (expertise: IndustrialSafetyExpertise) => void;
  updateIndustrialSafetyExpertise: (id: string, expertise: Partial<IndustrialSafetyExpertise>) => void;
  deleteIndustrialSafetyExpertise: (id: string) => void;

  addOpoCharacteristic: (characteristic: OpoCharacteristic) => void;
  updateOpoCharacteristic: (id: string, characteristic: Partial<OpoCharacteristic>) => void;
  deleteOpoCharacteristic: (id: string) => void;
  getOpoCharacteristicsByFacilityId: (facilityId: string) => OpoCharacteristic[];
}

export const useFacilityCatalogStore = create<FacilityCatalogStore>((set, get) => ({
  facilities: mockFacilities,
  components: mockComponents,
  gtsSystems: mockGtsSystems,
  contractors: mockContractors,
  technicalDiagnostics: mockTechnicalDiagnostics,
  industrialSafetyExpertises: mockIndustrialSafetyExpertises,
  opoCharacteristics: mockOpoCharacteristics,

  addFacility: (facility) =>
    set((state) => ({
      facilities: [...state.facilities, facility],
    })),

  updateFacility: (id, facility) =>
    set((state) => ({
      facilities: state.facilities.map((f) => (f.id === id ? { ...f, ...facility } : f)),
    })),

  deleteFacility: (id) =>
    set((state) => ({
      facilities: state.facilities.filter((f) => f.id !== id),
    })),

  getFacilityById: (id) => get().facilities.find((f) => f.id === id),

  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component],
    })),

  updateComponent: (id, component) =>
    set((state) => ({
      components: state.components.map((c) => (c.id === id ? { ...c, ...component } : c)),
    })),

  deleteComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
    })),

  getComponentsByFacilityId: (facilityId) =>
    get().components.filter((c) => c.facilityId === facilityId),

  addGtsSystem: (gtsSystem) =>
    set((state) => ({
      gtsSystems: [...state.gtsSystems, gtsSystem],
    })),

  updateGtsSystem: (id, gtsSystem) =>
    set((state) => ({
      gtsSystems: state.gtsSystems.map((g) => (g.id === id ? { ...g, ...gtsSystem } : g)),
    })),

  deleteGtsSystem: (id) =>
    set((state) => ({
      gtsSystems: state.gtsSystems.filter((g) => g.id !== id),
    })),

  addContractor: (contractor) =>
    set((state) => ({
      contractors: [...state.contractors, contractor],
    })),

  updateContractor: (id, contractor) =>
    set((state) => ({
      contractors: state.contractors.map((c) => (c.id === id ? { ...c, ...contractor } : c)),
    })),

  deleteContractor: (id) =>
    set((state) => ({
      contractors: state.contractors.filter((c) => c.id !== id),
    })),

  getContractorById: (id) => get().contractors.find((c) => c.id === id),

  addTechnicalDiagnostic: (diagnostic) =>
    set((state) => ({
      technicalDiagnostics: [...state.technicalDiagnostics, diagnostic],
    })),

  updateTechnicalDiagnostic: (id, diagnostic) =>
    set((state) => ({
      technicalDiagnostics: state.technicalDiagnostics.map((d) =>
        d.id === id ? { ...d, ...diagnostic } : d
      ),
    })),

  deleteTechnicalDiagnostic: (id) =>
    set((state) => ({
      technicalDiagnostics: state.technicalDiagnostics.filter((d) => d.id !== id),
    })),

  addIndustrialSafetyExpertise: (expertise) =>
    set((state) => ({
      industrialSafetyExpertises: [...state.industrialSafetyExpertises, expertise],
    })),

  updateIndustrialSafetyExpertise: (id, expertise) =>
    set((state) => ({
      industrialSafetyExpertises: state.industrialSafetyExpertises.map((e) =>
        e.id === id ? { ...e, ...expertise } : e
      ),
    })),

  deleteIndustrialSafetyExpertise: (id) =>
    set((state) => ({
      industrialSafetyExpertises: state.industrialSafetyExpertises.filter((e) => e.id !== id),
    })),

  addOpoCharacteristic: (characteristic) =>
    set((state) => ({
      opoCharacteristics: [...state.opoCharacteristics, characteristic],
    })),

  updateOpoCharacteristic: (id, characteristic) =>
    set((state) => ({
      opoCharacteristics: state.opoCharacteristics.map((c) =>
        c.id === id ? { ...c, ...characteristic } : c
      ),
    })),

  deleteOpoCharacteristic: (id) =>
    set((state) => ({
      opoCharacteristics: state.opoCharacteristics.filter((c) => c.id !== id),
    })),

  getOpoCharacteristicsByFacilityId: (facilityId) =>
    get().opoCharacteristics.filter((c) => c.facilityId === facilityId),
}));
