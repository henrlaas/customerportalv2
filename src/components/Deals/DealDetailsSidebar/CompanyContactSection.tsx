
import React from 'react';
import { Building2, User, ExternalLink, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal, Company } from '../types/deal';

interface CompanyContactSectionProps {
  deal: Deal;
  companies: Company[];
  tempCompany?: any;
  tempContact?: any;
}

export const CompanyContactSection = ({
  deal,
  companies,
  tempCompany,
  tempContact,
}: CompanyContactSectionProps) => {
  const company = companies.find(c => c.id === deal.company_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5" />
          Company
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {company ? (
          <>
            {/* Company Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{company.name}</h4>
                {company.website && (
                  <a 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              {company.description && (
                <p className="text-sm text-gray-600">{company.description}</p>
              )}

              {/* Company Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {company.industry && (
                  <div>
                    <span className="text-gray-500">Industry:</span>
                    <p className="font-medium">{company.industry}</p>
                  </div>
                )}
                {company.employee_count && (
                  <div>
                    <span className="text-gray-500">Employees:</span>
                    <p className="font-medium">{company.employee_count}</p>
                  </div>
                )}
              </div>

              {/* Client Type Badge */}
              {company.client_type && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Type:</span>
                  <Badge variant={company.client_type as any} className="text-xs">
                    {company.client_type}
                  </Badge>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {company.contacts && company.contacts.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Primary Contact
                </h4>
                {company.contacts.map((contact: any) => (
                  <div key={contact.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{contact.first_name} {contact.last_name}</span>
                      {contact.is_primary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    
                    {contact.position && (
                      <p className="text-sm text-gray-600">{contact.position}</p>
                    )}
                    
                    <div className="space-y-1 text-sm">
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Email:</span>
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Phone:</span>
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Temporary Company/Contact Information */}
            {(tempCompany || tempContact) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    Temporary company information - will be converted when deal is won
                  </span>
                </div>
                
                {tempCompany && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">{tempCompany.company_name}</h4>
                    {tempCompany.industry && (
                      <p className="text-sm text-gray-600">Industry: {tempCompany.industry}</p>
                    )}
                    {tempCompany.website && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Website:</span>
                        <a 
                          href={tempCompany.website.startsWith('http') ? tempCompany.website : `https://${tempCompany.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {tempCompany.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {tempContact && (
                  <div className="border-t pt-3 space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{tempContact.first_name} {tempContact.last_name}</p>
                      {tempContact.position && (
                        <p className="text-gray-600">{tempContact.position}</p>
                      )}
                      {tempContact.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Email:</span>
                          <a href={`mailto:${tempContact.email}`} className="text-blue-600 hover:underline">
                            {tempContact.email}
                          </a>
                        </div>
                      )}
                      {tempContact.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Phone:</span>
                          <a href={`tel:${tempContact.phone}`} className="text-blue-600 hover:underline">
                            {tempContact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No company assigned to this deal</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
