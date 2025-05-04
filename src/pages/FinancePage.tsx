
import { useState } from 'react';
import { DollarSign, CreditCard, TrendingUp, Calendar, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const FinancePage = () => {
  const [period, setPeriod] = useState('month');
  
  // Placeholder data for finances
  const stats = {
    revenue: 128500,
    expenses: 45200,
    profit: 83300,
    outstanding: 24300
  };
  
  const transactions = [
    { id: 1, type: 'income', description: 'Website Development', client: 'Acme Corp', amount: 15000, date: '2025-05-01' },
    { id: 2, type: 'expense', description: 'Software Subscription', vendor: 'Adobe', amount: 1200, date: '2025-04-28' },
    { id: 3, type: 'income', description: 'Digital Marketing', client: 'TechGiant', amount: 8500, date: '2025-04-25' },
    { id: 4, type: 'expense', description: 'Office Rent', vendor: 'Property Management Inc', amount: 3500, date: '2025-04-20' },
    { id: 5, type: 'income', description: 'SEO Services', client: 'Global Media', amount: 5000, date: '2025-04-18' }
  ];

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Finance</h1>
        <div className="playful-d-flex playful-gap-2">
          <button className="playful-btn playful-btn-outline">
            <CreditCard size={20} className="playful-mr-1" />
            New Invoice
          </button>
          <button className="playful-btn playful-btn-primary">
            <Plus size={20} className="playful-mr-1" />
            New Transaction
          </button>
        </div>
      </div>
      
      {/* Finance Stats */}
      <div className="playful-row">
        <div className="playful-col playful-col-quarter">
          <div className="playful-stat-card">
            <div className="playful-stat-header">
              <div className="playful-stat-title">Total Revenue</div>
              <div className="playful-stat-badge playful-stat-badge-up">
                <TrendingUp size={14} />
                <span>12%</span>
              </div>
            </div>
            <div className="playful-stat-value">${stats.revenue.toLocaleString()}</div>
            <div className="playful-stat-desc">For current {period}</div>
          </div>
        </div>
        
        <div className="playful-col playful-col-quarter">
          <div className="playful-stat-card">
            <div className="playful-stat-header">
              <div className="playful-stat-title">Total Expenses</div>
              <div className="playful-stat-badge playful-stat-badge-down">
                <TrendingUp size={14} />
                <span>5%</span>
              </div>
            </div>
            <div className="playful-stat-value">${stats.expenses.toLocaleString()}</div>
            <div className="playful-stat-desc">For current {period}</div>
          </div>
        </div>
        
        <div className="playful-col playful-col-quarter">
          <div className="playful-stat-card">
            <div className="playful-stat-header">
              <div className="playful-stat-title">Net Profit</div>
              <div className="playful-stat-badge playful-stat-badge-up">
                <TrendingUp size={14} />
                <span>18%</span>
              </div>
            </div>
            <div className="playful-stat-value">${stats.profit.toLocaleString()}</div>
            <div className="playful-stat-desc">For current {period}</div>
          </div>
        </div>
        
        <div className="playful-col playful-col-quarter">
          <div className="playful-stat-card">
            <div className="playful-stat-header">
              <div className="playful-stat-title">Outstanding</div>
            </div>
            <div className="playful-stat-value">${stats.outstanding.toLocaleString()}</div>
            <div className="playful-stat-desc">Unpaid invoices</div>
          </div>
        </div>
      </div>
      
      {/* Period Filter */}
      <div className="playful-card">
        <div className="playful-card-content">
          <div className="playful-d-flex playful-justify-between playful-items-center playful-flex-wrap playful-gap-3">
            <div className="playful-d-flex playful-items-center playful-gap-2">
              <button 
                className={`playful-btn playful-btn-sm ${period === 'week' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setPeriod('week')}
              >
                This Week
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${period === 'month' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setPeriod('month')}
              >
                This Month
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${period === 'quarter' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setPeriod('quarter')}
              >
                This Quarter
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${period === 'year' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setPeriod('year')}
              >
                This Year
              </button>
            </div>
            
            <div className="playful-search">
              <input className="playful-search-input" placeholder="Search transactions..." />
              <span className="playful-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="playful-card">
        <div className="playful-card-header">
          <div className="playful-card-title">Recent Transactions</div>
        </div>
        <div className="playful-table-container">
          <table className="playful-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Client/Vendor</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.description}</td>
                  <td>{transaction.client || transaction.vendor}</td>
                  <td>
                    <div className="playful-d-flex playful-items-center">
                      <Calendar size={16} className="playful-mr-1" />
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span 
                      className={
                        transaction.type === 'income' 
                          ? 'playful-text-success playful-font-semibold' 
                          : 'playful-text-danger playful-font-semibold'
                      }
                    >
                      {transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
