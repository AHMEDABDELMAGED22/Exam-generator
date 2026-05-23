import React, { useState, useEffect } from 'react';

const ProcessingView: React.FC = () => {
  const [status, setStatus] = useState('Analyzing input text...');
  const [step, setStep] = useState(0);

  const statuses = [
    'Analyzing input text...',
    'Communicating with the AI...',
    'Crafting questions and options...',
    'Reviewing answer accuracy...',
    'Putting on the finishing touches!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => {
        const nextStep = prev + 1;
        if (nextStep < statuses.length) {
          setStatus(statuses[nextStep]);
          return nextStep;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-teal-200 dark:border-teal-900 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-[#018a83] rounded-full animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors">
        MentorED is making your quiz...
      </h2>
      <p className="text-gray-600 dark:text-gray-300 text-lg transition-opacity duration-500">
        {status}
      </p>
    </div>
  );
};

export default ProcessingView;