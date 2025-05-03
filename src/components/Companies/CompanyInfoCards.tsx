
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
        <Card className="hover:shadow-playful transition-all duration-300 group overflow-hidden border-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 to-soft-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" /> Website
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/70 transition-colors flex items-center font-medium"
            >
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          </CardContent>
        </Card>
      )}
      
      {company.phone && (
        <Card className="hover:shadow-playful transition-all duration-300 group overflow-hidden border-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-soft-purple/20 to-soft-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-500" /> Phone
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <p className="font-medium">{company.phone}</p>
          </CardContent>
        </Card>
      )}
      
      {company.invoice_email && (
        <Card className="hover:shadow-playful transition-all duration-300 group overflow-hidden border-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-soft-peach/20 to-soft-peach/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" /> Invoice Email
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <p className="font-medium">{company.invoice_email}</p>
          </CardContent>
        </Card>
      )}
      
      {company.is_marketing_client && company.mrr !== null && (
        <Card className="hover:shadow-playful transition-all duration-300 group overflow-hidden border-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-soft-pink/20 to-soft-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-4">
            <p className="font-semibold text-lg">{company.mrr} kr</p>
          </CardContent>
        </Card>
      )}
      
      <Card className="hover:shadow-playful transition-all duration-300 group overflow-hidden border-transparent">
        <div className="absolute inset-0 bg-gradient-to-br from-minty to-minty/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-evergreen" /> Created
          </CardTitle>
        </CardHeader>
        <CardContent className="py-0 pb-4">
          <p className="font-medium">{new Date(company.created_at).toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};
