
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { AlertCircle, FileIcon, Trash2, UploadCloud, CheckCircle, FileText } from './Icons';
import { extractTextFromPdf } from '../services/pdfExtractorService';
import { detectLanguage } from '../services/languageDetectorService';
import { QuizGenerationOptions } from '../App';
import { Language, QuestionType } from '../types';
import { Textarea } from './ui/Textarea';

interface UploadViewProps {
  onQuizGenerate: (options: QuizGenerationOptions) => void;
  isLoading: boolean;
}

const difficultyOptions: { value: 'easy' | 'medium' | 'hard', label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const UploadView: React.FC<UploadViewProps> = ({ onQuizGenerate, isLoading }) => {
  const [sourceText, setSourceText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('unknown');
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'en' | 'ar'>('auto');
  const [numQuestions, setNumQuestions] = useState<number | ''>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [timeLimit, setTimeLimit] = useState<number | ''>(10);
  const [customPrompt, setCustomPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const languageOptions = [
    { value: 'auto', label: `Auto-detect (${detectedLanguage !== 'unknown' ? detectedLanguage.toUpperCase() : 'N/A'})` },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' },
  ];

  const processFiles = useCallback((incomingFiles: FileList | null) => {
    if (!incomingFiles) return;
    const newFiles = Array.from(incomingFiles);
    const validFiles: File[] = [];
    newFiles.forEach(file => {
        if (file.type === 'application/pdf' && file.size <= 20 * 1024 * 1024) {
            validFiles.push(file);
        }
    });
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  useEffect(() => {
    const extractAllText = async () => {
        if (files.length === 0) {
            setSourceText('');
            setDetectedLanguage('unknown');
            return;
        }
        setIsExtracting(true);
        try {
            const texts = await Promise.all(files.map(file => extractTextFromPdf(file)));
            const combinedText = texts.join('\n\n---\n\n');
            setSourceText(combinedText);
            setDetectedLanguage(detectLanguage(combinedText));
        } catch (err) {
            setError('Failed to extract text.');
        } finally {
            setIsExtracting(false);
        }
    };
    extractAllText();
  }, [files]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please upload at least one PDF.');
      return;
    }
    const finalLanguage = selectedLanguage === 'auto' ? detectedLanguage : selectedLanguage;
    onQuizGenerate({
        sourceText,
        numQuestions: Number(numQuestions) || 1,
        difficulty,
        timeLimit: (Number(timeLimit) || 1) * 60,
        language: finalLanguage,
        questionType,
        customPrompt,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#2b2b33] dark:text-white">MentorED Quiz Builder</h3>
            <p className="text-gray-500 mt-2">Create quizzes from your study materials in seconds.</p>
        </div>
        <Card className="w-full mx-auto">
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-8">
            <div 
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors
                ${isDragging ? 'border-[#018a83] bg-teal-50' : 'border-gray-200 dark:border-slate-700'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }}
            >
                {files.length > 0 ? (
                    <div className="w-full space-y-2">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-2 rounded">
                                <span className="text-sm truncate max-w-[200px] dark:text-white">{file.name}</span>
                                <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => setFiles(f => f.filter((_, idx) => idx !== i))} />
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pdf-upload')?.click()} className="w-full mt-2">Add More</Button>
                    </div>
                ) : (
                <div className="text-center">
                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm dark:text-gray-400">Drag & drop PDFs or click to browse</p>
                    <input type="file" id="pdf-upload" accept="application/pdf" onChange={(e) => processFiles(e.target.files)} className="hidden" multiple />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pdf-upload')?.click()} className="mt-4">Select Files</Button>
                </div>
                )}
            </div>

            <div className="space-y-3">
                <Label className="text-base text-[#018a83] font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Question Format
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                        { id: 'mcq', label: 'MCQ', desc: '4 Options' },
                        { id: 'true_false', label: 'T/F', desc: 'Binary' },
                        { id: 'essay', label: 'Essay', desc: 'Descriptive' },
                        { id: 'mixed', label: 'Mixed', desc: 'Variety' }
                    ].map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setQuestionType(type.id as QuestionType)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                questionType === type.id 
                                ? 'border-[#018a83] bg-teal-50 dark:bg-teal-900/20 text-[#018a83]' 
                                : 'border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <span className="font-bold">{type.label}</span>
                            <span className="text-[10px] opacity-60">{type.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="dark:text-slate-300">Count</Label>
                    <Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value ? Number(e.target.value) : '')} className="dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-2">
                    <Label className="dark:text-slate-300">Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                        <SelectTrigger className="dark:bg-slate-800 dark:text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {difficultyOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Custom Focus (Optional)</Label>
              <Textarea
                placeholder="e.g. 'Focus on Chapter 1 only' or 'Include definitions'..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="dark:bg-slate-800 dark:text-white"
                rows={2}
              />
            </div>

            {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading || files.length === 0 || isExtracting} className="w-full py-6 text-lg rounded-xl">
                    {isExtracting ? 'Processing PDFs...' : 'Build My Quiz'}
                </Button>
            </CardFooter>
        </form>
        </Card>
    </div>
  );
};

export default UploadView;
