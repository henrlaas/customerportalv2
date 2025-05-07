
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ProjectsPage = () => {
  const { profile } = useAuth();

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">No projects created yet. Projects will appear here once created.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
