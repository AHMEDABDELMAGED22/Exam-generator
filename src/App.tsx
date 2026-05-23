
import React, { useState, useEffect } from 'react';
import { generateQuizFromText } from './services/geminiService';
import type { QuizData, Language, QuestionType } from './types';
import UploadView from './components/UploadView';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import InteractiveQuiz from './components/InteractiveQuiz';
import { AlertCircle, Sun, Moon } from './components/Icons';
import { Button } from './components/ui/Button';

type AppState = 'upload' | 'processing' | 'results' | 'quiz' | 'error';

export interface QuizGenerationOptions {
    sourceText: string;
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number; // in seconds
    language: Language;
    questionType: QuestionType;
    customPrompt?: string;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Default to false (Light Mode)
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode class to html element whenever state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleQuizGenerate = async (options: QuizGenerationOptions) => {
    const { sourceText, numQuestions, difficulty, timeLimit, language, questionType, customPrompt } = options;
    setAppState('processing');
    setError(null);
    setQuizData(null);
    try {
      const data = await generateQuizFromText(sourceText, numQuestions, difficulty, language, questionType, customPrompt);
      setQuizData({ ...data, timeLimit: timeLimit > 0 ? timeLimit : undefined });
      setAppState('results');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setAppState('error');
    }
  };

  const handleStartQuiz = () => {
    if (quizData) {
      setAppState('quiz');
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setQuizData(null);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'upload':
        return <UploadView onQuizGenerate={handleQuizGenerate} isLoading={false} />;
      case 'processing':
        return <ProcessingView />;
      case 'results':
        return quizData && <ResultsView quizData={quizData} onStartQuiz={handleStartQuiz} onReset={handleReset} />;
      case 'quiz':
        return quizData && <InteractiveQuiz quizData={quizData} onFinish={handleReset} />;
      case 'error':
        return (
          <div className="w-full max-w-2xl mx-auto p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg shadow-xl border border-red-200 dark:border-red-800 transition-colors">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">
              Oops! Something went wrong.
            </h2>
            <p className="text-red-700 dark:text-red-200 mb-6">
              {error}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return <UploadView onQuizGenerate={handleQuizGenerate} isLoading={false} />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f8f9fa] text-gray-800'}`}>
      
      {/* Dark Mode Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDarkMode(!darkMode)}
          className={`rounded-full w-10 h-10 p-0 flex items-center justify-center border-gray-200 dark:border-slate-700 transition-colors ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-700'}`}
          title="Toggle Night Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center relative">
        {renderContent()}
      </main>
      
    </div>
  );
};

export default App;
