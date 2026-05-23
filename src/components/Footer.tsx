
import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 select-none">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center text-sm">
        {/* Static Text - Changed from <a> to <span> */}
        <div className="flex gap-4 mb-2 md:mb-0 text-gray-400">
          <span className="cursor-default">About Us</span>
          <span className="cursor-default">Resources</span>
          <span className="cursor-default">Legal</span>
          <span className="cursor-default">Contact Us</span>
        </div>
        
        {/* Static Icons - Changed from <a> to <span> with reduced opacity */}
        <div className="flex gap-4 text-gray-400">
          <span className="cursor-default opacity-60"><Facebook className="w-5 h-5" /></span>
          <span className="cursor-default opacity-60"><Twitter className="w-5 h-5" /></span>
          <span className="cursor-default opacity-60"><Linkedin className="w-5 h-5" /></span>
          <span className="cursor-default opacity-60"><Instagram className="w-5 h-5" /></span>
        </div>
      </div>
    </footer>
  );
};
