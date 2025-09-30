import React from 'react';

interface SetupLayoutProps {
  children: React.ReactNode;
}

const SetupLayout: React.FC<SetupLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center justify-between">
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default SetupLayout;