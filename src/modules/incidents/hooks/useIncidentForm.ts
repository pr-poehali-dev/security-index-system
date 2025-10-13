import { useState, useEffect } from 'react';
import type { Incident } from '@/types';

interface IncidentFormData {
  organizationId: string;
  productionSiteId: string;
  reportDate: string;
  sourceId: string;
  directionId: string;
  description: string;
  correctiveAction: string;
  fundingTypeId: string;
  categoryId: string;
  subcategoryId: string;
  responsiblePersonnelId: string;
  plannedDate: string;
  completedDate: string;
  notes: string;
}

export function useIncidentForm(incident?: Incident) {
  const [formData, setFormData] = useState<IncidentFormData>({
    organizationId: '',
    productionSiteId: '',
    reportDate: new Date().toISOString().split('T')[0],
    sourceId: '',
    directionId: '',
    description: '',
    correctiveAction: '',
    fundingTypeId: '',
    categoryId: '',
    subcategoryId: '',
    responsiblePersonnelId: '',
    plannedDate: '',
    completedDate: '',
    notes: ''
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        organizationId: incident.organizationId,
        productionSiteId: incident.productionSiteId,
        reportDate: incident.reportDate,
        sourceId: incident.sourceId,
        directionId: incident.directionId,
        description: incident.description,
        correctiveAction: incident.correctiveAction,
        fundingTypeId: incident.fundingTypeId,
        categoryId: incident.categoryId,
        subcategoryId: incident.subcategoryId,
        responsiblePersonnelId: incident.responsiblePersonnelId,
        plannedDate: incident.plannedDate,
        completedDate: incident.completedDate || '',
        notes: incident.notes || ''
      });
    } else {
      setFormData({
        organizationId: '',
        productionSiteId: '',
        reportDate: new Date().toISOString().split('T')[0],
        sourceId: '',
        directionId: '',
        description: '',
        correctiveAction: '',
        fundingTypeId: '',
        categoryId: '',
        subcategoryId: '',
        responsiblePersonnelId: '',
        plannedDate: '',
        completedDate: '',
        notes: ''
      });
    }
  }, [incident]);

  const updateField = (field: keyof IncidentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId, subcategoryId: '' }));
  };

  const validateForm = (): boolean => {
    return !!(
      formData.organizationId &&
      formData.productionSiteId &&
      formData.reportDate &&
      formData.sourceId &&
      formData.directionId &&
      formData.description &&
      formData.correctiveAction &&
      formData.fundingTypeId &&
      formData.categoryId &&
      formData.subcategoryId &&
      formData.responsiblePersonnelId &&
      formData.plannedDate
    );
  };

  return {
    formData,
    updateField,
    handleCategoryChange,
    validateForm
  };
}
