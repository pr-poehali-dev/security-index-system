// Backward compatibility exports for refactored types
// Use these for gradual migration

export type {
  CatalogOrganization as Organization,
  ObjectDocumentStatus as DocumentStatus,
  ObjectDocumentType as DocumentType,
} from './catalog';

export type {
  CatalogContractor as Contractor,
  CatalogContractorStatus as ContractorStatus,
  CatalogContractorType as ContractorType,
} from '../modules/catalog/types/contractors';
