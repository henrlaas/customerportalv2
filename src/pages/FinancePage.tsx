
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ArrowUp, ArrowDown, CreditCard, Calendar } from 'lucide-react';

const FinancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance</h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Invoice
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
            Financial Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">$84,324.00</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  8% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 bg-green-100 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <h3 className="text-2xl font-bold mt-1">$12,426.00</h3>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  12% from last month
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600 bg-blue-100 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <h3 className="text-2xl font-bold mt-1">$18,289.00</h3>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  3 invoices pending
                </p>
              </div>
              <Calendar className="h-8 w-8 text-amber-600 bg-amber-100 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Expenses</p>
                <h3 className="text-2xl font-bold mt-1">$32,578.00</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  4% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600 bg-red-100 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Overview of the latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-right py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Website Redesign - Client ABC</td>
                  <td className="py-3 px-4">Services</td>
                  <td className="py-3 px-4">Apr 4, 2025</td>
                  <td className="py-3 px-4 text-right">$4,200.00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Paid
                    </span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Marketing Campaign - Client XYZ</td>
                  <td className="py-3 px-4">Marketing</td>
                  <td className="py-3 px-4">Apr 3, 2025</td>
                  <td className="py-3 px-4 text-right">$8,750.00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Office Supplies</td>
                  <td className="py-3 px-4">Expenses</td>
                  <td className="py-3 px-4">Apr 2, 2025</td>
                  <td className="py-3 px-4 text-right">-$350.00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">Software Maintenance - Client DEF</td>
                  <td className="py-3 px-4">Services</td>
                  <td className="py-3 px-4">Apr 1, 2025</td>
                  <td className="py-3 px-4 text-right">$1,250.00</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Overdue
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancePage;
