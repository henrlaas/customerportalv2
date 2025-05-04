import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Plus, Filter, Grid, List, ChevronRight } from 'lucide-react';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';

const CompaniesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  
  const { isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  
  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyService.fetchCompanies,
  });
  
  // Filter companies by search query, type, and parent status
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.country && company.country.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Handle client type filtering using the boolean fields directly
    const matchesType = 
      clientTypeFilter === 'all' || 
      (clientTypeFilter === 'Marketing' && company.is_marketing_client) ||
      (clientTypeFilter === 'Web' && company.is_web_client);
    
    // Filter subsidiaries (companies with parent_id)
    const matchesParentStatus = showSubsidiaries || company.parent_id === null;
    
    return matchesSearch && matchesType && matchesParentStatus;
  });
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  // Handle company click - navigate to details page or parent company if it's a subsidiary
  const handleCompanyClick = async (company: Company) => {
    if (company.parent_id) {
      // If it's a subsidiary, navigate to the parent company
      navigate(`/companies/${company.parent_id}`);
    } else {
      // Otherwise navigate to the company details
      navigate(`/companies/${company.id}`);
    }
  };
  
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <h1 className="page-title">Companies</h1>
          {canModify && (
            <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
              <Plus size={16} />
              <span>Add Company</span>
            </button>
          )}
        </div>
        <p className="page-subtitle">Manage all company accounts and their details</p>
      </div>
      
      {/* Search and filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="form-group mb-0 flex-1">
              <label className="form-label">Search Companies</label>
              <input
                type="text"
                placeholder="Search companies..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="form-group mb-0">
              <label className="form-label">Company Type</label>
              <div className="select-container">
                <select 
                  value={clientTypeFilter}
                  onChange={(e) => setClientTypeFilter(e.target.value)}
                  className="form-control"
                >
                  <option value="all">All Types</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Web">Web</option>
                </select>
              </div>
            </div>
            
            <div className="form-group mb-0">
              <label className="checkbox-container">
                <input 
                  type="checkbox"
                  checked={showSubsidiaries}
                  onChange={() => setShowSubsidiaries(!showSubsidiaries)}
                />
                <span className="checkmark"></span>
                Show Subsidiaries
              </label>
            </div>
            
            <div className="flex gap-2 items-center">
              <button 
                className={`btn btn-icon btn-outline ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={18} />
              </button>
              <button 
                className={`btn btn-icon btn-outline ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
                aria-label="Card view"
              >
                <Grid size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Companies list */}
      {isLoading ? (
        <div className="card-body flex items-center justify-center py-12">
          <div className="loader"></div>
          <span className="ml-3">Loading companies...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card">
          <div className="card-body flex flex-col items-center justify-center py-12 text-center">
            <Building size={48} className="text-gray mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No companies found</h3>
            <p className="text-gray mb-4">Try adjusting your search or filters</p>
            {canModify && (
              <button className="btn btn-outline" onClick={() => setIsCreating(true)}>
                <Plus size={16} className="mr-2" />
                Add Your First Company
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="card animate-fade-in">
          <div className="table-container">
            <table className="table table-hoverable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr 
                    key={company.id} 
                    onClick={() => handleCompanyClick(company)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="font-medium">{company.name}</td>
                    <td>
                      {company.is_marketing_client && <span className="badge badge-info mr-1">Marketing</span>}
                      {company.is_web_client && <span className="badge badge-secondary">Web</span>}
                    </td>
                    <td>{company.city || 'N/A'}, {company.country || 'N/A'}</td>
                    <td>{company.website || 'N/A'}</td>
                    <td>{company.status === 'active' ? <span className="badge badge-success">Active</span> : <span className="badge">Inactive</span>}</td>
                    <td>
                      <button className="btn btn-icon btn-ghost">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div 
              key={company.id}
              className="card card-hover-effect cursor-pointer animate-fade-in"
              onClick={() => handleCompanyClick(company)}
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h3 className="card-title">{company.name}</h3>
                  {company.parent_id && (
                    <span className="badge badge-outline-primary">Subsidiary</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3 mt-2">
                  {company.is_marketing_client && <span className="badge badge-info">Marketing</span>}
                  {company.is_web_client && <span className="badge badge-secondary">Web</span>}
                  {company.status === 'active' ? <span className="badge badge-success">Active</span> : <span className="badge">Inactive</span>}
                </div>
                <div className="text-sm text-gray mb-1">
                  <strong>Location:</strong> {company.city || 'N/A'}, {company.country || 'N/A'}
                </div>
                {company.website && (
                  <div className="text-sm text-gray mb-1">
                    <strong>Website:</strong> {company.website}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button className="btn btn-sm btn-outline">
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Multi-Stage Company Creation Dialog */}
      {isCreating && (
        <MultiStageCompanyDialog
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  );
};

export default CompaniesPage;
