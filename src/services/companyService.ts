
import type { Company, CompanyContact } from '@/types/company';
import { companyQueryService } from './companyQueryService';
import { companyMutationService } from './companyMutationService';
import { fetchFavicon } from './companyHelpers';

// Re-export all company services from one central place
export const companyService = {
  // Query methods
  getCompanies: companyQueryService.getCompanies,
  getCompaniesByType: companyQueryService.getCompaniesByType,
  getCompany: companyQueryService.getCompany,
  getChildCompanies: companyQueryService.getChildCompanies,
  getCompanyContacts: companyQueryService.getCompanyContacts,
  
  // Mutation methods
  createCompany: companyMutationService.createCompany,
  updateCompany: companyMutationService.updateCompany,
  deleteCompany: companyMutationService.deleteCompany,
  addCompanyContact: companyMutationService.addCompanyContact,
  updateCompanyContact: companyMutationService.updateCompanyContact,
  deleteCompanyContact: companyMutationService.deleteCompanyContact,
  
  // Utility methods
  fetchFavicon: fetchFavicon,
};
