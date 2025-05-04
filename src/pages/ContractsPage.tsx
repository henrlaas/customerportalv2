
import { useState } from 'react';
import { FileText, Plus, Filter } from 'lucide-react';

const ContractsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Placeholder data for contracts
  const contracts = [
    { id: 1, name: 'Website Development Agreement', company: 'Acme Corp', status: 'active', created: '2025-04-10', expires: '2026-04-10', value: 25000 },
    { id: 2, name: 'Social Media Management', company: 'TechGiant', status: 'pending', created: '2025-04-15', expires: '2026-04-15', value: 12000 },
    { id: 3, name: 'SEO Services Agreement', company: 'Global Media', status: 'expired', created: '2024-01-20', expires: '2025-01-20', value: 8000 },
    { id: 4, name: 'Content Creation Contract', company: 'Startup Inc', status: 'active', created: '2025-03-05', expires: '2026-03-05', value: 15000 },
    { id: 5, name: 'Design Services Agreement', company: 'Design Studio', status: 'pending', created: '2025-05-01', expires: '2025-11-01', value: 7500 }
  ];
  
  const filteredContracts = contracts.filter(contract => {
    const matchesQuery = contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesQuery && matchesStatus;
  });
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="playful-badge playful-badge-success">Active</span>;
      case 'pending':
        return <span className="playful-badge playful-badge-warning">Pending</span>;
      case 'expired':
        return <span className="playful-badge playful-badge-danger">Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Contracts</h1>
        <button className="playful-btn playful-btn-primary">
          <Plus size={20} className="playful-mr-1" />
          New Contract
        </button>
      </div>
      
      {/* Filters */}
      <div className="playful-card">
        <div className="playful-card-content">
          <div className="playful-d-flex playful-justify-between playful-items-center playful-flex-wrap playful-gap-3">
            <div className="playful-search" style={{ width: '100%', maxWidth: '400px' }}>
              <input 
                className="playful-search-input" 
                placeholder="Search contracts..." 
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
            
            <div className="playful-d-flex playful-items-center playful-gap-2">
              <span className="playful-text-sm">Status:</span>
              <button 
                className={`playful-btn playful-btn-sm ${statusFilter === 'all' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${statusFilter === 'active' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${statusFilter === 'pending' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${statusFilter === 'expired' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setStatusFilter('expired')}
              >
                Expired
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts */}
      {filteredContracts.length === 0 ? (
        <div className="playful-d-flex playful-flex-column playful-items-center playful-justify-center playful-p-5">
          <FileText size={48} className="playful-text-medium playful-mb-3" />
          <h3 className="playful-text-lg playful-font-semibold playful-mb-2">No contracts found</h3>
          <p className="playful-text-medium playful-mb-4">Try adjusting your search or create a new contract</p>
          <button className="playful-btn playful-btn-primary">
            <Plus size={20} className="playful-mr-1" />
            New Contract
          </button>
        </div>
      ) : (
        <div className="playful-table-container">
          <table className="playful-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Company</th>
                <th>Status</th>
                <th>Created</th>
                <th>Expires</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(contract => (
                <tr key={contract.id}>
                  <td>{contract.name}</td>
                  <td>{contract.company}</td>
                  <td>{getStatusBadge(contract.status)}</td>
                  <td>{new Date(contract.created).toLocaleDateString()}</td>
                  <td>{new Date(contract.expires).toLocaleDateString()}</td>
                  <td>${contract.value.toLocaleString()}</td>
                  <td className="playful-table-actions">
                    <button className="playful-btn playful-btn-sm playful-btn-ghost">View</button>
                    <button className="playful-btn playful-btn-sm playful-btn-ghost">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContractsPage;
