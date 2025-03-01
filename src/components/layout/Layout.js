import React, { useEffect } from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  useEffect(() => {
    const defaultTitle = 'PVE Console';
    if (document.title === '') {
      document.title = defaultTitle;
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Navbar />
      </div>

      <div className="flex-1 mt-[64px]">
        <main className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-transparent">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 