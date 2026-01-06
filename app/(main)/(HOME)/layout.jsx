// app/dashboard/layout.jsx (Example if dashboard had header/footer)
import React from 'react';
import Footer from './_components/Footer'; // Assuming Footer is in _components
import Navbar from './_components/Navbar';

function DashboardLayout({ children }) {
  return (
    <div className="">
       {/* 1. Navbar sits at the top */}
				<Navbar />
        
        <div > 
            {/* <Sidebar /> */}
            
            <main className="flex-1">{children}</main> {/* Main content area */}
        </div>
        {/* 3. Footer sits at the bottom (Added this back) */}
                    <Footer />
    </div>
  );
}

export default DashboardLayout;