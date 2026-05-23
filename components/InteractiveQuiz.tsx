import React, { useState, useMemo, useEffect } from 'react';
import { QuizData, Question } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { RadioGroup, RadioGroupItem } from './ui/RadioGroup';
import { Label } from './ui/Label';
import { CheckCircle, XCircle, Clock } from './Icons';
import { detectLanguage } from '../services/languageDetectorService';

interface InteractiveQuizProps {
  quizData: QuizData;
  onFinish: () => void;
}

const ResultsDetailView: React.FC<{ 
  questions: Question[]; 
  selectedAnswers: Record<number, string>;
  score: number;
  onFinish: () => void;
  isRtl: boolean;
}> = ({ questions, selectedAnswers, score, onFinish, isRtl }) => {
  const totalQuestions = questions.length;
  const percentage = ((score / totalQuestions) * 100).toFixed(0);

  return (
    <Card className="w-full max-w-3xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
        <CardDescription>Here's how you did:</CardDescription>
        <div className="py-4">
            <p className="text-6xl font-bold text-[#018a83]">{percentage}%</p>
            <p className="text-xl text-gray-600 mt-2">
                You answered {score} out of {totalQuestions} questions correctly.
            </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-xl font-bold text-center">Detailed Review</h3>
        {questions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.answer;

            return (
                <div key={index} className={`p-4 rounded-lg ${isRtl ? 'border-r-4' : 'border-l-4'} ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <p className="font-semibold mb-3">{index + 1}. {question.question}</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                            <div>
                                <span className="font-semibold">Your answer: </span>
                                <span className={isCorrect ? 'text-green-800' : 'text-red-800'}>{userAnswer || "No answer"}</span>
                            </div>
                        </div>
                        {!isCorrect && (
                             <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                    <span className="font-semibold">Correct answer: </span>
                                    <span>{question.answer}</span>
                                </div>
                            </div>
                        )}
                        <div className="pt-2">
                          <p className="font-semibold">Explanation:</p>
                          <p className="text-gray-700">{question.explanation}</p>
                        </div>
                    </div>
                </div>
            );
        })}
      </CardContent>
      <CardFooter>
        <Button onClick={onFinish} className="w-full text-lg py-3">
          Create Another Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}


const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ quizData, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quizData.timeLimit);
  
  const isRtl = useMemo(() => detectLanguage(quizData.quiz.title) === 'ar', [quizData.quiz.title]);

  useEffect(() => {
    if (typeof timeLeft !== 'number' || showResults) return;

    if (timeLeft <= 0) {
      setShowResults(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev !== undefined ? prev - 1 : undefined));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number | undefined) => {
    if (typeof seconds !== 'number') return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const totalQuestions = quizData.quiz.questions.length;
  const currentQuestion = quizData.quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const score = useMemo(() => {
    return quizData.quiz.questions.reduce((total, question, index) => {
      return selectedAnswers[index] === question.answer ? total + 1 : total;
    }, 0);
  }, [selectedAnswers, quizData.quiz.questions]);

  if (showResults) {
    return (
        <ResultsDetailView 
            questions={quizData.quiz.questions}
            selectedAnswers={selectedAnswers}
            score={score}
            onFinish={onFinish}
            isRtl={isRtl}
        />
    );
  }
  
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <Card className="w-full max-w-2xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex justify-between items-center gap-4">
          <CardTitle className="text-2xl">{quizData.quiz.title}</CardTitle>
          <div className="flex items-center space-x-4">
            {timeLeft !== undefined && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            )}
            <p className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold">{currentQuestion.question}</p>
        <RadioGroup
          onValueChange={handleAnswerSelect}
          value={selectedAnswer}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-md border border-gray-200 has-[:checked]:bg-teal-50 has-[:checked]:border-teal-400 transition-colors`}>
                <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className="flex-1 text-base cursor-pointer">
                  {option}
                </Label>
              </div>
            )
          )}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} disabled={!selectedAnswer} className="w-full text-lg py-3">
          {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InteractiveQuiz;