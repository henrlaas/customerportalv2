
import { useState } from 'react';
import { CheckSquare, Plus, Calendar, Clock, Filter } from 'lucide-react';

const TasksPage = () => {
  const [filter, setFilter] = useState('all');
  
  // Placeholder data for tasks
  const tasks = [
    { id: 1, title: 'Create marketing plan', status: 'in-progress', priority: 'high', due: '2025-05-15', assignee: 'John Doe' },
    { id: 2, title: 'Design new landing page', status: 'pending', priority: 'medium', due: '2025-05-20', assignee: 'Jane Smith' },
    { id: 3, title: 'Review campaign analytics', status: 'completed', priority: 'low', due: '2025-05-10', assignee: 'John Doe' },
    { id: 4, title: 'Client meeting preparation', status: 'in-progress', priority: 'high', due: '2025-05-12', assignee: 'Jane Smith' },
    { id: 5, title: 'Update website content', status: 'pending', priority: 'medium', due: '2025-05-25', assignee: 'Mike Johnson' }
  ];
  
  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);
  
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high':
        return <span className="playful-badge playful-badge-danger">High</span>;
      case 'medium':
        return <span className="playful-badge playful-badge-warning">Medium</span>;
      case 'low':
        return <span className="playful-badge playful-badge-info">Low</span>;
      default:
        return null;
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'completed':
        return 'playful-table-status-success';
      case 'in-progress':
        return 'playful-table-status-warning';
      case 'pending':
        return 'playful-table-status-danger';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Tasks</h1>
        <button className="playful-btn playful-btn-primary">
          <Plus size={20} className="playful-mr-1" />
          Add Task
        </button>
      </div>
      
      {/* Filters */}
      <div className="playful-card">
        <div className="playful-card-content">
          <div className="playful-d-flex playful-justify-between playful-items-center playful-flex-wrap playful-gap-3">
            <div className="playful-d-flex playful-items-center playful-gap-2">
              <button 
                className={`playful-btn playful-btn-sm ${filter === 'all' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${filter === 'in-progress' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilter('in-progress')}
              >
                In Progress
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${filter === 'pending' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${filter === 'completed' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            
            <div className="playful-search">
              <input className="playful-search-input" placeholder="Search tasks..." />
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

      {/* Tasks */}
      <div className="playful-table-container">
        <table className="playful-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{getPriorityBadge(task.priority)}</td>
                <td>
                  <div className="playful-d-flex playful-items-center">
                    <Calendar size={16} className="playful-mr-1" />
                    {new Date(task.due).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div className="playful-d-flex playful-items-center">
                    <div className="playful-user-avatar" style={{ width: '24px', height: '24px', marginRight: '8px' }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee)}&background=random`} alt={task.assignee} />
                    </div>
                    {task.assignee}
                  </div>
                </td>
                <td>
                  <span className={`playful-table-status ${getStatusClass(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                  </span>
                </td>
                <td className="playful-table-actions">
                  <button className="playful-btn playful-btn-sm playful-btn-ghost">View</button>
                  <button className="playful-btn playful-btn-sm playful-btn-ghost">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredTasks.length === 0 && (
        <div className="playful-d-flex playful-flex-column playful-items-center playful-justify-center playful-p-5">
          <CheckSquare size={48} className="playful-text-medium playful-mb-3" />
          <h3 className="playful-text-lg playful-font-semibold playful-mb-2">No tasks found</h3>
          <p className="playful-text-medium">Adjust your filters or create a new task</p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
