
import React from 'react';

export const CenteredSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default CenteredSpinner;
