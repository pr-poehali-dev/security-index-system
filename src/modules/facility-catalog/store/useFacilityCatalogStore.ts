import { create } from 'zustand';
import {
  mockTechnicalDiagnostics,
  mockIndustrialSafetyExpertises,
  mockOpoCharacteristics,
  type TechnicalDiagnostic,
  type IndustrialSafetyExpertise,
  type OpoCharacteristic,
} from '../data/mockData';

interface FacilityCatalogStore {
  technicalDiagnostics: TechnicalDiagnostic[];
  industrialSafetyExpertises: IndustrialSafetyExpertise[];
  opoCharacteristics: OpoCharacteristic[];

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
  technicalDiagnostics: mockTechnicalDiagnostics,
  industrialSafetyExpertises: mockIndustrialSafetyExpertises,
  opoCharacteristics: mockOpoCharacteristics,

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