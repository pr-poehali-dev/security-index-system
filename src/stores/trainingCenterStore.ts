import { create } from 'zustand';
import type {
  TrainingProgram,
  TrainingGroup,
  TrainingEnrollment,
  TrainingLocation,
  TrainingInstructor,
  TrainingScheduleEntry,
  OrganizationTrainingRequest,
} from '@/types';

interface TrainingCenterState {
  programs: TrainingProgram[];
  groups: TrainingGroup[];
  enrollments: TrainingEnrollment[];
  locations: TrainingLocation[];
  instructors: TrainingInstructor[];
  scheduleEntries: TrainingScheduleEntry[];
  requests: OrganizationTrainingRequest[];
  
  addProgram: (program: TrainingProgram) => void;
  updateProgram: (id: string, updates: Partial<TrainingProgram>) => void;
  deleteProgram: (id: string) => void;
  getProgramsByTenant: (tenantId: string) => TrainingProgram[];
  
  addGroup: (group: TrainingGroup) => void;
  updateGroup: (id: string, updates: Partial<TrainingGroup>) => void;
  deleteGroup: (id: string) => void;
  getGroupsByTenant: (tenantId: string) => TrainingGroup[];
  
  addEnrollment: (enrollment: TrainingEnrollment) => void;
  updateEnrollment: (id: string, updates: Partial<TrainingEnrollment>) => void;
  deleteEnrollment: (id: string) => void;
  getEnrollmentsByGroup: (groupId: string) => TrainingEnrollment[];
  
  addLocation: (location: TrainingLocation) => void;
  updateLocation: (id: string, updates: Partial<TrainingLocation>) => void;
  deleteLocation: (id: string) => void;
  getLocationsByTenant: (tenantId: string) => TrainingLocation[];
  
  addInstructor: (instructor: TrainingInstructor) => void;
  updateInstructor: (id: string, updates: Partial<TrainingInstructor>) => void;
  deleteInstructor: (id: string) => void;
  getInstructorsByTenant: (tenantId: string) => TrainingInstructor[];
  
  addScheduleEntry: (entry: TrainingScheduleEntry) => void;
  updateScheduleEntry: (id: string, updates: Partial<TrainingScheduleEntry>) => void;
  deleteScheduleEntry: (id: string) => void;
  getScheduleByGroup: (groupId: string) => TrainingScheduleEntry[];
  
  addRequest: (request: OrganizationTrainingRequest) => void;
  updateRequest: (id: string, updates: Partial<OrganizationTrainingRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestsByTenant: (tenantId: string) => OrganizationTrainingRequest[];
}

export const useTrainingCenterStore = create<TrainingCenterState>((set, get) => ({
  programs: [],
  groups: [],
  enrollments: [],
  locations: [],
  instructors: [],
  scheduleEntries: [],
  requests: [],

  addProgram: (program) => set((state) => ({
    programs: [...state.programs, program],
  })),

  updateProgram: (id, updates) => set((state) => ({
    programs: state.programs.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  })),

  deleteProgram: (id) => set((state) => ({
    programs: state.programs.filter((p) => p.id !== id),
  })),

  getProgramsByTenant: (tenantId) => {
    return get().programs.filter((p) => p.tenantId === tenantId);
  },

  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group],
  })),

  updateGroup: (id, updates) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    ),
  })),

  deleteGroup: (id) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== id),
  })),

  getGroupsByTenant: (tenantId) => {
    return get().groups.filter((g) => g.tenantId === tenantId);
  },

  addEnrollment: (enrollment) => set((state) => {
    const group = state.groups.find(g => g.id === enrollment.groupId);
    if (group) {
      const updatedGroups = state.groups.map(g =>
        g.id === enrollment.groupId
          ? { ...g, enrolledCount: g.enrolledCount + 1 }
          : g
      );
      return {
        enrollments: [...state.enrollments, enrollment],
        groups: updatedGroups,
      };
    }
    return { enrollments: [...state.enrollments, enrollment] };
  }),

  updateEnrollment: (id, updates) => set((state) => ({
    enrollments: state.enrollments.map((e) =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    ),
  })),

  deleteEnrollment: (id) => set((state) => {
    const enrollment = state.enrollments.find(e => e.id === id);
    if (enrollment) {
      const updatedGroups = state.groups.map(g =>
        g.id === enrollment.groupId
          ? { ...g, enrolledCount: Math.max(0, g.enrolledCount - 1) }
          : g
      );
      return {
        enrollments: state.enrollments.filter((e) => e.id !== id),
        groups: updatedGroups,
      };
    }
    return { enrollments: state.enrollments.filter((e) => e.id !== id) };
  }),

  getEnrollmentsByGroup: (groupId) => {
    return get().enrollments.filter((e) => e.groupId === groupId);
  },

  addLocation: (location) => set((state) => ({
    locations: [...state.locations, location],
  })),

  updateLocation: (id, updates) => set((state) => ({
    locations: state.locations.map((l) =>
      l.id === id ? { ...l, ...updates } : l
    ),
  })),

  deleteLocation: (id) => set((state) => ({
    locations: state.locations.filter((l) => l.id !== id),
  })),

  getLocationsByTenant: (tenantId) => {
    return get().locations.filter((l) => l.tenantId === tenantId);
  },

  addInstructor: (instructor) => set((state) => ({
    instructors: [...state.instructors, instructor],
  })),

  updateInstructor: (id, updates) => set((state) => ({
    instructors: state.instructors.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    ),
  })),

  deleteInstructor: (id) => set((state) => ({
    instructors: state.instructors.filter((i) => i.id !== id),
  })),

  getInstructorsByTenant: (tenantId) => {
    return get().instructors.filter((i) => i.tenantId === tenantId);
  },

  addScheduleEntry: (entry) => set((state) => ({
    scheduleEntries: [...state.scheduleEntries, entry],
  })),

  updateScheduleEntry: (id, updates) => set((state) => ({
    scheduleEntries: state.scheduleEntries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    ),
  })),

  deleteScheduleEntry: (id) => set((state) => ({
    scheduleEntries: state.scheduleEntries.filter((e) => e.id !== id),
  })),

  getScheduleByGroup: (groupId) => {
    return get().scheduleEntries.filter((e) => e.groupId === groupId);
  },

  addRequest: (request) => set((state) => ({
    requests: [...state.requests, request],
  })),

  updateRequest: (id, updates) => set((state) => ({
    requests: state.requests.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ),
  })),

  deleteRequest: (id) => set((state) => ({
    requests: state.requests.filter((r) => r.id !== id),
  })),

  getRequestsByTenant: (tenantId) => {
    return get().requests.filter((r) => r.tenantId === tenantId);
  },
}));