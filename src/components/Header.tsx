
import React, { useState } from 'react';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Simple static styles for non-clickable items
  const staticTextStyle = "text-[#2b2b33] font-medium text-[0.8rem] cursor-default select-none";
  const activeTextStyle = "text-[#2b2b33] font-medium text-[0.8rem] cursor-default select-none border-b-2 border-[#018a83]";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 h-[56px] flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
            {/* Logo - Changed from <a> to <div> */}
            <div className="flex items-center">
                <span className="italic text-lg font-bold text-[#018a83] cursor-default select-none">MentorED</span>
            </div>
            
            {/* Desktop Navbar Items - Changed from <a> to <div> */}
            <div className="hidden lg:flex items-center space-x-8">
                <div className={staticTextStyle}>Home</div>
                <div className={staticTextStyle}>Learning Tracks</div>
                <div className={activeTextStyle}>Quizzes</div>
                <div className={staticTextStyle}>Offline Centres</div>
                <div className={staticTextStyle}>Dashboard</div>
            </div>

            {/* My Account Button - Changed from <button> to <div> */}
            <div className="hidden lg:flex items-center">
                <div className="bg-white text-gray-400 border border-gray-200 rounded px-3 py-1 text-xs font-normal cursor-default select-none">
                    My Account
                </div>
            </div>
            
            {/* Mobile Burger Menu Button - Keeps functionality only to open menu, but items inside are dead */}
            <div className="lg:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
        </div>
        
        {/* Mobile Menu - Changed all <a> to <div> */}
        {isOpen && (
            <div className="lg:hidden mt-4 bg-white absolute left-0 w-full shadow-lg p-4 z-50">
                <div className="block py-2 px-4 text-sm text-gray-500 cursor-default">Home</div>
                <div className="block py-2 px-4 text-sm text-gray-500 cursor-default">Learning Tracks</div>
                <div className="block py-2 px-4 text-sm bg-gray-100 rounded font-bold text-[#2b2b33] cursor-default">Quizzes</div>
                <div className="block py-2 px-4 text-sm text-gray-500 cursor-default">Offline Centres</div>
                <div className="block py-2 px-4 text-sm text-gray-500 cursor-default">Dashboard</div>
                <div className="mt-4">
                    <div className="w-full bg-white text-gray-400 border border-gray-200 rounded px-3 py-2 text-sm font-normal text-center cursor-default">
                        My Account
                    </div>
                </div>
            </div>
        )}
      </div>
    </header>
  );
};
