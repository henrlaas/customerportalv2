
import { useState } from 'react';
import { Calendar, Filter, Plus, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DealsPage = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Placeholder data for deals
  const stages = [
    { id: 1, name: 'Lead', color: 'var(--info)' },
    { id: 2, name: 'Meeting', color: 'var(--warning)' },
    { id: 3, name: 'Proposal', color: 'var(--accent-purple)' },
    { id: 4, name: 'Negotiation', color: 'var(--accent-orange)' },
    { id: 5, name: 'Closed Won', color: 'var(--success)' }
  ];
  
  const deals = [
    { id: 1, name: 'Website Redesign', company: 'Acme Corp', value: 15000, stage: 1 },
    { id: 2, name: 'Digital Marketing', company: 'TechGiant', value: 8500, stage: 2 },
    { id: 3, name: 'SEO Services', company: 'Global Media', value: 5000, stage: 3 },
    { id: 4, name: 'App Development', company: 'Startup Inc', value: 25000, stage: 4 },
    { id: 5, name: 'Maintenance Contract', company: 'Local Business', value: 1200, stage: 5 }
  ];
  
  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Deals</h1>
        <button className="playful-btn playful-btn-primary">
          <Plus size={20} className="playful-mr-1" />
          New Deal
        </button>
      </div>
      
      {/* Filters & View options */}
      <div className="playful-card">
        <div className="playful-card-content">
          <div className="playful-d-flex playful-justify-between playful-items-center playful-flex-wrap playful-gap-3">
            <div className="playful-d-flex playful-items-center playful-gap-2">
              <button className="playful-btn playful-btn-ghost">
                <Filter size={16} className="playful-mr-1" />
                Filter
              </button>
              <div className="playful-search">
                <input className="playful-search-input" placeholder="Search deals..." />
                <span className="playful-search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
              </div>
            </div>
            
            <div className="playful-d-flex playful-gap-2">
              <button 
                className={`playful-btn playful-btn-sm ${viewMode === 'kanban' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${viewMode === 'list' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deals content */}
      {viewMode === 'kanban' ? (
        <div className="playful-d-flex playful-gap-3 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
          {stages.map(stage => (
            <div key={stage.id} className="playful-d-flex playful-flex-column" style={{ minWidth: '250px', maxWidth: '250px' }}>
              <div className="playful-d-flex playful-justify-between playful-items-center playful-mb-2 playful-p-2" style={{ backgroundColor: 'var(--light)', borderRadius: 'var(--radius-md)' }}>
                <h3 className="playful-font-semibold" style={{ color: stage.color }}>{stage.name}</h3>
                <span className="playful-badge" style={{ backgroundColor: stage.color, color: 'white' }}>
                  {deals.filter(d => d.stage === stage.id).length}
                </span>
              </div>
              
              <div className="playful-d-flex playful-flex-column playful-gap-2">
                {deals
                  .filter(deal => deal.stage === stage.id)
                  .map(deal => (
                    <div key={deal.id} className="playful-card">
                      <div className="playful-card-content playful-p-3">
                        <div className="playful-font-semibold playful-mb-1">{deal.name}</div>
                        <div className="playful-text-sm playful-text-medium">{deal.company}</div>
                        <div className="playful-d-flex playful-justify-between playful-items-center playful-mt-2">
                          <span className="playful-font-semibold playful-text-primary">
                            <DollarSign size={14} className="playful-mr-1" />
                            {deal.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="playful-table-container">
          <table className="playful-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Company</th>
                <th>Stage</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(deal => {
                const stage = stages.find(s => s.id === deal.stage);
                return (
                  <tr key={deal.id}>
                    <td>{deal.name}</td>
                    <td>{deal.company}</td>
                    <td>
                      <span className="playful-badge" style={{ backgroundColor: stage?.color, color: 'white' }}>
                        {stage?.name}
                      </span>
                    </td>
                    <td>
                      <span className="playful-font-semibold">${deal.value.toLocaleString()}</span>
                    </td>
                    <td className="playful-table-actions">
                      <button className="playful-btn playful-btn-sm playful-btn-ghost">View</button>
                      <button className="playful-btn playful-btn-sm playful-btn-ghost">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DealsPage;
