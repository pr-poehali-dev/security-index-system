// src/stores/templatesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChecklistTemplate } from '@/modules/checklists/data/templates';

interface TemplatesState {
  customTemplates: ChecklistTemplate[];
  addCustomTemplate: (template: ChecklistTemplate) => void;
  deleteCustomTemplate: (name: string) => void;
  updateCustomTemplate: (oldName: string, template: ChecklistTemplate) => void;
}

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      customTemplates: [],

      addCustomTemplate: (template) =>
        set((state) => ({
          customTemplates: [...state.customTemplates, template]
        })),

      deleteCustomTemplate: (name) =>
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.name !== name)
        })),

      updateCustomTemplate: (oldName, template) =>
        set((state) => ({
          customTemplates: state.customTemplates.map((t) =>
            t.name === oldName ? template : t
          )
        }))
    }),
    {
      name: 'templates-storage'
    }
  )
);