
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CompaniesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const { profile } = useAuth();
  
  // Placeholder for companies data
  const companies = [
    { id: 1, name: 'Acme Corp', type: 'Marketing', address: '123 Business Ave', city: 'New York', country: 'USA' },
    { id: 2, name: 'TechGiant', type: 'Web', address: '456 Tech Blvd', city: 'San Francisco', country: 'USA' },
    { id: 3, name: 'Global Media', type: 'Marketing', address: '789 Media St', city: 'London', country: 'UK' }
  ];

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Companies</h1>
        <Button 
          className="playful-btn playful-btn-primary"
          onClick={() => window?.playfulUI?.showToast('Feature coming soon!', 'info')}
        >
          <Plus size={20} className="playful-mr-1" />
          Add Company
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="playful-card">
        <div className="playful-card-content">
          <div className="playful-d-flex playful-justify-between playful-items-center playful-flex-wrap playful-gap-3">
            <div className="playful-search" style={{ width: '100%', maxWidth: '400px' }}>
              <input 
                className="playful-search-input"
                placeholder="Search companies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="playful-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
            </div>
            
            <div className="playful-d-flex playful-gap-2">
              <button 
                className={`playful-btn playful-btn-sm ${viewMode === 'list' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${viewMode === 'card' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setViewMode('card')}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Companies list */}
      {companies.length === 0 ? (
        <div className="playful-d-flex playful-flex-column playful-items-center playful-justify-center playful-p-5">
          <Building size={48} className="playful-text-medium playful-mb-3" />
          <h3 className="playful-text-lg playful-font-semibold playful-mb-2">No companies found</h3>
          <p className="playful-text-medium playful-mb-4">Get started by adding your first company</p>
          <button className="playful-btn playful-btn-primary">
            <Plus size={20} className="playful-mr-1" /> 
            Add Company
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="playful-table-container">
          <table className="playful-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{company.type}</td>
                  <td>{company.city}, {company.country}</td>
                  <td className="playful-table-actions">
                    <button className="playful-btn playful-btn-sm playful-btn-ghost">View</button>
                    <button className="playful-btn playful-btn-sm playful-btn-ghost">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="playful-row">
          {companies.map(company => (
            <div className="playful-col playful-col-third" key={company.id}>
              <div className="playful-card">
                <div className="playful-card-header">
                  <div className="playful-card-title">{company.name}</div>
                  <div className="playful-badge playful-badge-primary">{company.type}</div>
                </div>
                <div className="playful-card-content">
                  <p className="playful-mb-2">
                    <Users size={16} className="playful-mr-1" />
                    <span className="playful-text-medium">{company.address}</span>
                  </p>
                  <p className="playful-text-medium">{company.city}, {company.country}</p>
                </div>
                <div className="playful-card-footer">
                  <button className="playful-btn playful-btn-sm playful-btn-outline playful-mr-2">View</button>
                  <button className="playful-btn playful-btn-sm playful-btn-ghost">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
