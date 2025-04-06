
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CampaignsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Spring Marketing</CardTitle>
            <CardDescription>Product launch campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">Last updated: April 2, 2025</div>
            <div className="mt-4 flex justify-between items-center">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Active
              </span>
              <button className="text-blue-600 hover:text-blue-800">View Details</button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Summer Sale</CardTitle>
            <CardDescription>Seasonal discount program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">Last updated: March 28, 2025</div>
            <div className="mt-4 flex justify-between items-center">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Planning
              </span>
              <button className="text-blue-600 hover:text-blue-800">View Details</button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Holiday Campaign</CardTitle>
            <CardDescription>End of year promotion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">Last updated: March 15, 2025</div>
            <div className="mt-4 flex justify-between items-center">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Draft
              </span>
              <button className="text-blue-600 hover:text-blue-800">View Details</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CampaignsPage;
