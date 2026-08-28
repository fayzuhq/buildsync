import React from 'react';
import RoleSwitcher from './RoleSwitcher';

export default function Navbar({ currentRole, setCurrentRole, currentCompanyId, setCurrentCompanyId }) {
  return (
    <header className="bg-zinc-900 border-b border-zinc-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* Logo placeholder */}
            <div className="bg-amber-500 text-zinc-900 font-bold p-1 rounded-sm shadow-sm flex items-center justify-center h-8 w-8">
              B
            </div>
            <span className="text-xl font-bold text-white tracking-wider">
              BuildSync
            </span>
          </div>

          <div className="hidden md:flex">
            <RoleSwitcher
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              currentCompanyId={currentCompanyId}
              setCurrentCompanyId={setCurrentCompanyId}
            />
          </div>
        </div>

        {/* Mobile role switcher - visible only on small screens */}
        <div className="md:hidden py-2 pb-4">
           <RoleSwitcher
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              currentCompanyId={currentCompanyId}
              setCurrentCompanyId={setCurrentCompanyId}
            />
        </div>
      </div>
    </header>
  );
}
