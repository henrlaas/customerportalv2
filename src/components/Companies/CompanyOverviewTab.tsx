
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/company';

interface CompanyOverviewTabProps {
  company: Company;
}

export const CompanyOverviewTab = ({ company }: CompanyOverviewTabProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden group hover:shadow-playful transition-all duration-300 border-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="bg-soft-blue/20 p-2 rounded-full mr-2">📈</span>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500">No recent activity to display.</p>
              <button className="mt-3 text-sm text-evergreen font-medium hover:underline">Add Activity</button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden group hover:shadow-playful transition-all duration-300 border-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-soft-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="bg-soft-purple/20 p-2 rounded-full mr-2">🏢</span>
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="font-medium text-gray-600">Name:</div>
              <div className="col-span-2 font-semibold">{company.name}</div>
            </div>
            
            {company.organization_number && (
              <div className="grid grid-cols-3 gap-3">
                <div className="font-medium text-gray-600">Org.nr:</div>
                <div className="col-span-2">{company.organization_number}</div>
              </div>
            )}
            
            {company.website && (
              <div className="grid grid-cols-3 gap-3">
                <div className="font-medium text-gray-600">Website:</div>
                <div className="col-span-2">
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-evergreen hover:text-evergreen/80 transition-colors"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}
            
            {company.phone && (
              <div className="grid grid-cols-3 gap-3">
                <div className="font-medium text-gray-600">Phone:</div>
                <div className="col-span-2">{company.phone}</div>
              </div>
            )}
            
            {company.invoice_email && (
              <div className="grid grid-cols-3 gap-3">
                <div className="font-medium text-gray-600">Invoice Email:</div>
                <div className="col-span-2">{company.invoice_email}</div>
              </div>
            )}
            
            {company.street_address && (
              <div className="grid grid-cols-3 gap-3">
                <div className="font-medium text-gray-600">Address:</div>
                <div className="col-span-2">
                  {company.street_address}<br />
                  {company.city && company.city}
                  {company.postal_code && ` ${company.postal_code}`}<br />
                  {company.country && company.country}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
              <div className="font-medium text-gray-600">Client Type:</div>
              <div className="col-span-2">
                <div className="flex flex-wrap gap-1">
                  {company.is_marketing_client && (
                    <Badge variant="marketing">
                      Marketing
                    </Badge>
                  )}
                  {company.is_web_client && (
                    <Badge variant="web">
                      Web
                    </Badge>
                  )}
                  {!company.is_marketing_client && !company.is_web_client && (
                    <span className="text-gray-500">None</span>
                  )}
                </div>
              </div>
            </div>
            
            {company.is_marketing_client && company.mrr !== null && (
              <div className="grid grid-cols-3 gap-3">
                <div className="font-medium text-gray-600">Monthly Revenue:</div>
                <div className="col-span-2 font-semibold">{company.mrr} kr</div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
              <div className="font-medium text-gray-600">Trial Period:</div>
              <div className="col-span-2">{company.trial_period ? '✅ Yes' : '❌ No'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="font-medium text-gray-600">Partner:</div>
              <div className="col-span-2">{company.is_partner ? '✅ Yes' : '❌ No'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
