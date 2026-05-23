
import React, { useState, useMemo, useEffect } from 'react';
import { QuizData, Question } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { RadioGroup, RadioGroupItem } from './ui/RadioGroup';
import { Label } from './ui/Label';
import { CheckCircle, XCircle, Clock, FileText } from './Icons';
import { detectLanguage } from '../services/languageDetectorService';
import { Textarea } from './ui/Textarea';

interface InteractiveQuizProps {
  quizData: QuizData;
  onFinish: () => void;
}

const EssayQuestionView: React.FC<{
    question: Question;
    index: number;
    userAnswer: string;
    onAnswerChange: (val: string) => void;
    isRtl: boolean;
}> = ({ question, index, userAnswer, onAnswerChange, isRtl }) => {
    const [showModelAnswer, setShowModelAnswer] = useState(false);

    return (
        <div className="space-y-4">
            <p className="text-lg font-semibold dark:text-white">{index + 1}. {question.question}</p>
            <div className="space-y-2">
                <Label className="text-sm dark:text-slate-400">Your Answer:</Label>
                <Textarea 
                    value={userAnswer}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    placeholder={isRtl ? "اكتب إجابتك هنا..." : "Type your answer here..."}
                    className="min-h-[120px] dark:bg-slate-800 dark:text-white"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>{userAnswer.length} characters</span>
                    <button 
                        type="button" 
                        onClick={() => setShowModelAnswer(!showModelAnswer)}
                        className="text-[#018a83] font-bold hover:underline"
                    >
                        {showModelAnswer ? (isRtl ? "إخفاء الإجابة النموذجية" : "Hide Model Answer") : (isRtl ? "إظهار الإجابة النموذجية" : "Show Model Answer")}
                    </button>
                </div>
            </div>

            {showModelAnswer && (
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 animate-in fade-in duration-300">
                    <p className="font-bold text-[#018a83] text-sm mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> {isRtl ? "الإجابة النموذجية:" : "Model Answer:"}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">{question.answer}</p>
                    <div className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-800">
                        <p className="text-xs font-semibold mb-1">{isRtl ? "التوضيح السياقي:" : "Contextual Explanation:"}</p>
                        <p className="text-[13px] text-gray-600 dark:text-gray-400">{question.explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const ResultsDetailView: React.FC<{ 
  questions: Question[]; 
  selectedAnswers: Record<number, string>;
  score: number;
  onFinish: () => void;
  isRtl: boolean;
  isEssay: boolean;
}> = ({ questions, selectedAnswers, score, onFinish, isRtl, isEssay }) => {
  const totalQuestions = questions.length;
  const percentage = isEssay ? null : ((score / totalQuestions) * 100).toFixed(0);

  return (
    <Card className="w-full max-w-3xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">{isEssay ? (isRtl ? "انتهى وقت المراجعة!" : "Review Finished!") : (isRtl ? "اكتمل الاختبار!" : "Quiz Complete!")}</CardTitle>
        <CardDescription>{isRtl ? "إليك ملخص ما قمت به:" : "Here's how you did:"}</CardDescription>
        {!isEssay && (
            <div className="py-4">
                <p className="text-6xl font-bold text-[#018a83]">{percentage}%</p>
                <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                    {isRtl ? `أجبت على ${score} من أصل ${totalQuestions} أسئلة بشكل صحيح.` : `You answered ${score} out of ${totalQuestions} questions correctly.`}
                </p>
            </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-xl font-bold text-center dark:text-white">{isRtl ? "مراجعة تفصيلية" : "Detailed Review"}</h3>
        {questions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = !isEssay && userAnswer === question.answer;

            return (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${isEssay ? 'border-gray-300 bg-gray-50 dark:bg-slate-800' : isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <p className="font-semibold mb-3 dark:text-white">{index + 1}. {question.question}</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex flex-col gap-1">
                            <span className="font-bold opacity-60 text-[10px] uppercase">{isRtl ? "إجابتك:" : "Your Answer:"}</span>
                            <p className="dark:text-gray-300">{userAnswer || (isRtl ? "لم تتم الإجابة" : "No answer")}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                             <span className="font-bold text-[#018a83] text-[10px] uppercase">{isRtl ? "الإجابة النموذجية:" : "Model Answer:"}</span>
                             <p className="text-gray-700 dark:text-gray-400">{question.answer}</p>
                        </div>
                    </div>
                </div>
            );
        })}
      </CardContent>
      <CardFooter>
        <Button onClick={onFinish} className="w-full text-lg py-3">
          {isRtl ? "إنشاء اختبار جديد" : "Create Another Quiz"}
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
  const isEssayQuiz = useMemo(() => quizData.quiz.questions.some(q => q.options.length === 0), [quizData.quiz]);

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

  const totalQuestions = quizData.quiz.questions.length;
  const currentQuestion = quizData.quiz.questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
        <ResultsDetailView 
            questions={quizData.quiz.questions}
            selectedAnswers={selectedAnswers}
            score={quizData.quiz.questions.reduce((acc, q, i) => acc + (selectedAnswers[i] === q.answer ? 1 : 0), 0)}
            onFinish={onFinish}
            isRtl={isRtl}
            isEssay={isEssayQuiz}
        />
    );
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex justify-between items-center gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#018a83]" />
            {quizData.quiz.title}
          </CardTitle>
          <div className="flex items-center gap-3">
            {timeLeft !== undefined && (
                <div className="flex items-center gap-1 text-xs font-mono bg-red-50 text-red-600 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
                </div>
            )}
            <p className="text-xs font-bold text-gray-400">
                {currentQuestionIndex + 1} / {totalQuestions}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEssayQuiz ? (
            <EssayQuestionView 
                question={currentQuestion}
                index={currentQuestionIndex}
                userAnswer={selectedAnswers[currentQuestionIndex] || ""}
                onAnswerChange={(val) => setSelectedAnswers(prev => ({...prev, [currentQuestionIndex]: val}))}
                isRtl={isRtl}
            />
        ) : (
            <>
                <p className="text-lg font-semibold dark:text-white">{currentQuestion.question}</p>
                <RadioGroup
                    onValueChange={(val) => setSelectedAnswers(prev => ({...prev, [currentQuestionIndex]: val}))}
                    value={selectedAnswers[currentQuestionIndex]}
                    className="space-y-3"
                >
                {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-teal-50/30 transition-colors">
                        <RadioGroupItem value={option} id={`opt-${index}`} />
                        <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer dark:text-gray-200">{option}</Label>
                    </div>
                ))}
                </RadioGroup>
            </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} className="w-full py-4 rounded-xl">
          {currentQuestionIndex === totalQuestions - 1 ? (isRtl ? "إنهاء المراجعة" : "Finish Review") : (isRtl ? "السؤال التالي" : "Next Question")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InteractiveQuiz;
