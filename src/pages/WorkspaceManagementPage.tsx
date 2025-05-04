
import { useState } from 'react';
import { Sliders, User, Users, Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WorkspaceManagementPage = () => {
  const [activeTab, setActiveTab] = useState('employees');
  
  // Placeholder data for employees
  const employees = [
    { id: 1, name: 'John Doe', role: 'Design Lead', department: 'Design', status: 'active' },
    { id: 2, name: 'Jane Smith', role: 'Marketing Manager', department: 'Marketing', status: 'active' },
    { id: 3, name: 'Mike Johnson', role: 'Developer', department: 'Development', status: 'active' },
    { id: 4, name: 'Lisa Brown', role: 'Content Writer', department: 'Marketing', status: 'inactive' },
    { id: 5, name: 'David Wilson', role: 'UI Designer', department: 'Design', status: 'active' }
  ];
  
  // Placeholder data for workspace settings
  const settings = [
    { id: 1, name: 'Default Currency', value: 'USD', category: 'General' },
    { id: 2, name: 'Time Zone', value: 'GMT+0', category: 'General' },
    { id: 3, name: 'Company Name', value: 'Agency Workspace', category: 'Branding' },
    { id: 4, name: 'Email Notifications', value: 'Enabled', category: 'Notifications' },
    { id: 5, name: 'API Key', value: '********', category: 'Integrations' }
  ];
  
  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="playful-badge playful-badge-success">Active</span>
      : <span className="playful-badge playful-badge-danger">Inactive</span>;
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Workspace Management</h1>
        {activeTab === 'employees' && (
          <button className="playful-btn playful-btn-primary">
            <Plus size={20} className="playful-mr-1" />
            Add Employee
          </button>
        )}
      </div>
      
      {/* Tabs Navigation */}
      <div className="playful-tabs">
        <div className="playful-tabs-header">
          <div 
            className={`playful-tab ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <Users size={16} className="playful-mr-1" />
            Employees
          </div>
          <div 
            className={`playful-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} className="playful-mr-1" />
            Workspace Settings
          </div>
        </div>
        
        <div className="playful-tab-content">
          {/* Employees Tab */}
          <div className={`playful-tab-pane ${activeTab === 'employees' ? 'active' : ''}`}>
            <div className="playful-card">
              <div className="playful-card-content">
                <div className="playful-d-flex playful-justify-between playful-items-center playful-mb-4">
                  <div className="playful-search">
                    <input className="playful-search-input" placeholder="Search employees..." />
                    <span className="playful-search-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                  </div>
                  
                  <div className="playful-d-flex playful-gap-2">
                    <select className="playful-select">
                      <option>All Departments</option>
                      <option>Design</option>
                      <option>Development</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>
                
                <div className="playful-table-container">
                  <table className="playful-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(employee => (
                        <tr key={employee.id}>
                          <td>
                            <div className="playful-d-flex playful-items-center">
                              <div className="playful-user-avatar" style={{ width: '36px', height: '36px', marginRight: '12px' }}>
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`} alt={employee.name} />
                              </div>
                              <span>{employee.name}</span>
                            </div>
                          </td>
                          <td>{employee.role}</td>
                          <td>{employee.department}</td>
                          <td>{getStatusBadge(employee.status)}</td>
                          <td className="playful-table-actions">
                            <button className="playful-btn playful-btn-sm playful-btn-ghost">View</button>
                            <button className="playful-btn playful-btn-sm playful-btn-ghost">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings Tab */}
          <div className={`playful-tab-pane ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="playful-card">
              <div className="playful-card-content">
                {settings.map((setting, index) => (
                  <div 
                    key={setting.id} 
                    className={`playful-d-flex playful-justify-between playful-items-center playful-p-3 ${
                      index < settings.length - 1 ? 'playful-border-b' : ''
                    }`}
                  >
                    <div>
                      <h3 className="playful-font-semibold">{setting.name}</h3>
                      <p className="playful-text-sm playful-text-medium">{setting.category}</p>
                    </div>
                    <div className="playful-d-flex playful-items-center playful-gap-3">
                      <span>{setting.value}</span>
                      <button className="playful-btn playful-btn-sm playful-btn-ghost">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManagementPage;
