import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#0b1315] text-slate-100 font-sans overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6 bg-[#0b1315] custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;