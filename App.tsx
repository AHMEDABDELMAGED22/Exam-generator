import React, { useState } from 'react';
import { generateQuizFromText } from './services/geminiService';
import { QuizData, Language } from './types';
import UploadView from './components/UploadView';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import InteractiveQuiz from './components/InteractiveQuiz';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AlertCircle } from './components/Icons';

type AppState = 'upload' | 'processing' | 'results' | 'quiz' | 'error';

export interface QuizGenerationOptions {
    sourceText: string;
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number; // in seconds
    language: Language;
    customPrompt?: string;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuizGenerate = async (options: QuizGenerationOptions) => {
    const { sourceText, numQuestions, difficulty, timeLimit, language, customPrompt } = options;
    setAppState('processing');
    setError(null);
    setQuizData(null);
    try {
      const data = await generateQuizFromText(sourceText, numQuestions, difficulty, language, customPrompt);
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
          <div className="w-full max-w-2xl mx-auto p-8 text-center bg-red-50 rounded-lg shadow-xl border border-red-200">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Oops! Something went wrong.
            </h2>
            <p className="text-red-700 mb-6">
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
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;