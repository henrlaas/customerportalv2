
import type { Company } from '@/types/company';

// Helper function to convert boolean fields to client_type string
export function getClientTypeFromBooleans(isMarketing: boolean, isWeb: boolean): string | null {
  if (isMarketing && isWeb) {
    return 'Marketing+Web';
  } else if (isMarketing) {
    return 'Marketing';
  } else if (isWeb) {
    return 'Web';
  }
  return null;
}

// Helper function to convert client_types array to client_type string
export function getClientTypeFromArray(clientTypes: string[]): string | null {
  if (clientTypes.length === 0) {
    return null;
  } else if (clientTypes.includes('Marketing') && clientTypes.includes('Web')) {
    return 'Marketing+Web';
  } else if (clientTypes.includes('Marketing')) {
    return 'Marketing';
  } else if (clientTypes.includes('Web')) {
    return 'Web';
  }
  return clientTypes[0];
}

// Format company response to include client_type
export function formatCompanyResponse(data: any): Company {
  return {
    ...data,
    client_type: getClientTypeFromBooleans(data.is_marketing_client, data.is_web_client)
  } as Company;
}

// Prepare company data for submission (insert/update)
export function prepareCompanyData(company: Partial<Company> & { client_types?: string[] }): any {
  // Make a copy of the company data so we don't modify the original
  const companyData: any = { ...company };
  
  // Handle conversion from client_types array to boolean fields
  if ('client_types' in companyData && companyData.client_types) {
    // Set the boolean fields based on the selected client types
    companyData.is_marketing_client = companyData.client_types.includes('Marketing');
    companyData.is_web_client = companyData.client_types.includes('Web');
    
    // Set client_type for backward compatibility
    companyData.client_type = getClientTypeFromArray(companyData.client_types);
    
    // Remove client_types as it's not a DB field
    delete companyData.client_types;
  }
  
  return companyData;
}

// Fetch website favicon
export async function fetchFavicon(website: string): Promise<string | null> {
  try {
    // Check if website is empty or not a valid URL
    if (!website || !website.trim()) {
      return null;
    }
    
    // Extract domain from website URL
    let domain = website;
    
    // Make sure we have a valid URL by checking for protocol
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      domain = 'https://' + website;
    }
    
    try {
      const url = new URL(domain);
      domain = url.hostname;
    } catch (error) {
      console.error('Invalid URL:', domain);
      return null;
    }
    
    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return null;
  }
}
