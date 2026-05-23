
import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="flex gap-4 mb-2 md:mb-0 text-[#2b2b33]">
          <a href="#" className="hover:text-[#018a83] transition-colors">About Us</a>
          <a href="#" className="hover:text-[#018a83] transition-colors">Resources</a>
          <a href="#" className="hover:text-[#018a83] transition-colors">Legal</a>
          <a href="#" className="hover:text-[#018a83] transition-colors">Contact Us</a>
        </div>
        <div className="flex gap-4 text-[#2b2b33]">
          <a href="#" className="hover:text-[#018a83] transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="hover:text-[#018a83] transition-colors"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="hover:text-[#018a83] transition-colors"><Linkedin className="w-5 h-5" /></a>
          <a href="#" className="hover:text-[#018a83] transition-colors"><Instagram className="w-5 h-5" /></a>
        </div>
      </div>
    </footer>
  );
};