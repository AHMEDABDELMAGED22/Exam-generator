import React from 'react';
import { QuizData } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, Clock, FileText } from './Icons';

interface ResultsViewProps {
  quizData: QuizData;
  onStartQuiz: () => void;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ quizData, onStartQuiz, onReset }) => {
  const { quiz, stats, timeLimit } = quizData;

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-3">
        <div className="bg-teal-100 p-2 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    </div>
  );
  
  const hasTimeLimit = timeLimit && timeLimit > 0;

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-3xl font-bold">Quiz Generated Successfully!</CardTitle>
        <CardDescription className="text-lg text-gray-600">
          {quiz.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasTimeLimit ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
            <StatCard icon={<FileText className="w-6 h-6 text-[#018a83]"/>} label="Questions" value={stats.totalQuestions} />
            <StatCard icon={<FileText className="w-6 h-6 text-[#018a83]"/>} label="Source Words" value={stats.extractedWords} />
            {hasTimeLimit && <StatCard icon={<Clock className="w-6 h-6 text-[#018a83]"/>} label="Time Limit" value={`${timeLimit / 60} min`} />}
            <StatCard icon={<Clock className="w-6 h-6 text-[#018a83]"/>} label="Generation Time" value={`${stats.processingTime.toFixed(2)}s`} />
        </div>
        <div className="text-center pt-4">
            <h3 className="font-semibold text-xl">Ready to test your knowledge?</h3>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onStartQuiz} className="w-full sm:w-auto flex-grow text-lg py-3">
          Start Quiz
        </Button>
        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
          Create New Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultsView;