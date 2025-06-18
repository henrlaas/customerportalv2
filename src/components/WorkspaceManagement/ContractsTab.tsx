
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Eye, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContractList } from '@/components/ContractList';

export const ContractsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Contract Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage all contracts, templates, and document workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Contract Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Awaiting signatures
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
            <Badge variant="secondary">Total</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245K</div>
            <p className="text-xs text-muted-foreground">
              Active contracts value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contract Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Templates</CardTitle>
          <CardDescription>
            Manage reusable contract templates for different types of agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-dashed border-2 hover:border-primary/50 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Create New Template</p>
                <p className="text-xs text-muted-foreground">Add a new contract template</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <h4 className="font-medium">Service Agreement</h4>
                <p className="text-xs text-muted-foreground mb-2">Standard service contract template</p>
                <Badge variant="secondary" className="text-xs">12 uses</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <h4 className="font-medium">NDA Template</h4>
                <p className="text-xs text-muted-foreground mb-2">Non-disclosure agreement template</p>
                <Badge variant="secondary" className="text-xs">8 uses</Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Contract List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
          <CardDescription>
            View and manage all contracts across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContractList />
        </CardContent>
      </Card>
    </div>
  );
};
