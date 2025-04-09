
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent activity to display.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              <div className="font-medium">Name:</div>
              <div className="col-span-2">{company.name}</div>
            </div>
            
            {company.organization_number && (
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Organization #:</div>
                <div className="col-span-2">{company.organization_number}</div>
              </div>
            )}
            
            {company.website && (
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Website:</div>
                <div className="col-span-2">
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}
            
            {company.phone && (
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Phone:</div>
                <div className="col-span-2">{company.phone}</div>
              </div>
            )}
            
            {company.invoice_email && (
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Invoice Email:</div>
                <div className="col-span-2">{company.invoice_email}</div>
              </div>
            )}
            
            {company.street_address && (
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Address:</div>
                <div className="col-span-2">
                  {company.street_address}<br />
                  {company.city && company.city}
                  {company.postal_code && ` ${company.postal_code}`}<br />
                  {company.country && company.country}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-1">
              <div className="font-medium">Client Type:</div>
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
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Monthly Revenue:</div>
                <div className="col-span-2">{company.mrr} kr</div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-1">
              <div className="font-medium">Trial Period:</div>
              <div className="col-span-2">{company.trial_period ? 'Yes' : 'No'}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              <div className="font-medium">Partner:</div>
              <div className="col-span-2">{company.is_partner ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
