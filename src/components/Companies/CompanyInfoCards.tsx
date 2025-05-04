
import { Globe, Phone, Mail, Calendar } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Company } from '@/types/company';

interface CompanyInfoCardsProps {
  company: Company;
}

export const CompanyInfoCards = ({ company }: CompanyInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {company.website && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Website</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <Globe className="h-4 w-4 mr-2" />
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          </CardContent>
        </Card>
      )}
      
      {company.phone && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Phone</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <p>{company.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {company.invoice_email && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Invoice Email</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <p>{company.invoice_email}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {company.is_marketing_client && company.mrr !== null && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <p>{company.mrr} kr</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium text-gray-500">Created</CardTitle>
        </CardHeader>
        <CardContent className="py-0 pb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <p>{new Date(company.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
