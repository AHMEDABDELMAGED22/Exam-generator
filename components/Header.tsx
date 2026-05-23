
import React, { useState } from 'react';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Using group-hover for underline effect in Tailwind is tricky, so a simple CSS-in-JS is cleaner here
  const navLinkStyle = `
    .nav-link-item {
        position: relative;
        color: #2b2b33;
        font-weight: 500;
        font-size: 0.8rem;
    }
    .nav-link-item::before {
        content: "";
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 2px;
        background-color: #018a83;
        visibility: hidden;
        transition: 0.3s ease-in-out;
    }
    .nav-link-item:hover::before, .nav-link-item.active::before {
        width: 100%;
        visibility: visible;
    }
  `;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 h-[56px] flex items-center">
      <style>{navLinkStyle}</style>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
            {/* Logo */}
            <a className="flex items-center" href="#">
                <span className="italic text-lg font-bold text-[#018a83]">MentorED</span>
            </a>
            
            {/* Desktop Navbar Items */}
            <div className="hidden lg:flex items-center space-x-8">
                <a href="#" className="nav-link-item">Home</a>
                <a href="#" className="nav-link-item">Learning Tracks</a>
                <a href="#" className="nav-link-item active">Quizzes</a>
                <a href="#" className="nav-link-item">Offline Centres</a>
                <a href="#" className="nav-link-item">Dashboard</a>
            </div>

            {/* My Account Button */}
            <div className="hidden lg:flex items-center">
                <button className="bg-white text-[#2b2b33] border border-[#2b2b33] rounded px-3 py-1 text-xs font-normal transition-colors hover:bg-[#018a83] hover:text-white hover:border-[#018a83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#018a83]/50">
                    My Account
                </button>
            </div>
            
            {/* Mobile Burger Menu Button */}
            <div className="lg:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
            <div className="lg:hidden mt-4 bg-white absolute left-0 w-full shadow-lg p-4">
                <a href="#" className="block py-2 px-4 text-sm hover:bg-gray-100 rounded">Home</a>
                <a href="#" className="block py-2 px-4 text-sm hover:bg-gray-100 rounded">Learning Tracks</a>
                <a href="#" className="block py-2 px-4 text-sm bg-gray-100 rounded">Quizzes</a>
                <a href="#" className="block py-2 px-4 text-sm hover:bg-gray-100 rounded">Offline Centres</a>
                <a href="#" className="block py-2 px-4 text-sm hover:bg-gray-100 rounded">Dashboard</a>
                <div className="mt-4">
                    <button className="w-full bg-white text-[#2b2b33] border border-[#2b2b33] rounded px-3 py-2 text-sm font-normal transition-colors hover:bg-[#018a83] hover:text-white hover:border-[#018a83]">
                        My Account
                    </button>
                </div>
            </div>
        )}
      </div>
    </header>
  );
};