
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

const Dashboard = () => {
  const { profile, isAdmin, isEmployee, isClient } = useAuth();
  const t = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {t('Dashboard')}
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <Card className="col-span-full bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>
              {t('Welcome')}, {profile?.first_name} {profile?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {isAdmin && "You have administrator access to the portal."}
              {isEmployee && "You have employee access to the portal."}
              {isClient && "You have client access to the portal."}
            </p>
          </CardContent>
        </Card>

        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Active Tasks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">14</div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Active Campaigns')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">5</div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Hours Logged This Week')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">32.5</div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Client specific cards */}
        {isClient && (
          <>
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Active Campaigns')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">2</div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Contracts')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">1</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
