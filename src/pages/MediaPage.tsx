
import { useState } from 'react';
import { FolderArchive, Upload, Image, FileText, Film, Grid, List, Filter } from 'lucide-react';

const MediaPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  
  // Placeholder data for media files
  const mediaFiles = [
    { id: 1, name: 'Campaign Banner', type: 'image', format: 'jpg', size: '1.2 MB', uploaded: '2025-05-01', author: 'John Doe' },
    { id: 2, name: 'Product Brochure', type: 'document', format: 'pdf', size: '3.5 MB', uploaded: '2025-04-28', author: 'Jane Smith' },
    { id: 3, name: 'Promo Video', type: 'video', format: 'mp4', size: '15.8 MB', uploaded: '2025-04-25', author: 'Mike Johnson' },
    { id: 4, name: 'Logo Design', type: 'image', format: 'png', size: '0.8 MB', uploaded: '2025-04-22', author: 'Lisa Brown' },
    { id: 5, name: 'Annual Report', type: 'document', format: 'docx', size: '2.3 MB', uploaded: '2025-04-20', author: 'John Doe' },
    { id: 6, name: 'Team Photo', type: 'image', format: 'jpg', size: '2.1 MB', uploaded: '2025-04-18', author: 'Jane Smith' }
  ];
  
  const filteredMedia = filterType === 'all' ? mediaFiles : mediaFiles.filter(file => file.type === filterType);
  
  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image':
        return <Image size={24} className="playful-text-primary" />;
      case 'document':
        return <FileText size={24} className="playful-text-warning" />;
      case 'video':
        return <Film size={24} className="playful-text-danger" />;
      default:
        return <FolderArchive size={24} className="playful-text-medium" />;
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Media</h1>
        <button className="playful-btn playful-btn-primary">
          <Upload size={20} className="playful-mr-1" />
          Upload Files
        </button>
      </div>
      
      {/* Filters */}
      <div className="playful-card">
        <div className="playful-card-content">
          <div className="playful-d-flex playful-justify-between playful-items-center playful-flex-wrap playful-gap-3">
            <div className="playful-d-flex playful-items-center playful-gap-2">
              <button 
                className={`playful-btn playful-btn-sm ${filterType === 'all' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilterType('all')}
              >
                All Files
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${filterType === 'image' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilterType('image')}
              >
                <Image size={16} className="playful-mr-1" />
                Images
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${filterType === 'document' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilterType('document')}
              >
                <FileText size={16} className="playful-mr-1" />
                Documents
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${filterType === 'video' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setFilterType('video')}
              >
                <Film size={16} className="playful-mr-1" />
                Videos
              </button>
            </div>
            
            <div className="playful-d-flex playful-gap-2">
              <button 
                className={`playful-btn playful-btn-sm ${viewMode === 'grid' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </button>
              <button 
                className={`playful-btn playful-btn-sm ${viewMode === 'list' ? 'playful-btn-primary' : 'playful-btn-outline'}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media files */}
      {filteredMedia.length === 0 ? (
        <div className="playful-d-flex playful-flex-column playful-items-center playful-justify-center playful-p-5">
          <FolderArchive size={48} className="playful-text-medium playful-mb-3" />
          <h3 className="playful-text-lg playful-font-semibold playful-mb-2">No media files found</h3>
          <p className="playful-text-medium playful-mb-4">Upload some files to get started</p>
          <button className="playful-btn playful-btn-primary">
            <Upload size={20} className="playful-mr-1" />
            Upload Files
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="playful-row">
          {filteredMedia.map(file => (
            <div className="playful-col playful-col-quarter" key={file.id}>
              <div className="playful-card playful-file-card">
                <div className="playful-file-icon">
                  {getFileIcon(file.type)}
                </div>
                <div className="playful-file-info">
                  <div className="playful-file-name">{file.name}</div>
                  <div className="playful-file-meta">
                    {file.format.toUpperCase()} • {file.size}
                  </div>
                </div>
                <div className="playful-file-actions">
                  <button className="playful-btn playful-btn-icon playful-btn-sm playful-btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="playful-table-container">
          <table className="playful-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Author</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map(file => (
                <tr key={file.id}>
                  <td>
                    <div className="playful-d-flex playful-items-center">
                      {getFileIcon(file.type)}
                      <span className="playful-ml-2">{file.name}</span>
                    </div>
                  </td>
                  <td>{file.format.toUpperCase()}</td>
                  <td>{file.size}</td>
                  <td>{new Date(file.uploaded).toLocaleDateString()}</td>
                  <td>{file.author}</td>
                  <td className="playful-table-actions">
                    <button className="playful-btn playful-btn-sm playful-btn-ghost">Download</button>
                    <button className="playful-btn playful-btn-sm playful-btn-ghost">Delete</button>
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

export default MediaPage;
