import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { AlertCircle, FileIcon, Trash2, UploadCloud } from './Icons';
import { extractTextFromPdf } from '../services/pdfExtractorService';
import { detectLanguage } from '../services/languageDetectorService';
import { QuizGenerationOptions } from '../App';
import { Language } from '../types';
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
  const [timeLimit, setTimeLimit] = useState<number | ''>(10); // in minutes
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
    let errorMessages: string[] = [];

    newFiles.forEach(file => {
        if (file.type !== 'application/pdf') {
            errorMessages.push(`'${file.name}' is not a PDF.`);
        } else if (file.size > 5 * 1024 * 1024) { // 5MB limit
            errorMessages.push(`'${file.name}' is larger than 5MB.`);
        } else {
            validFiles.push(file);
        }
    });

    if (errorMessages.length > 0) {
        setError(errorMessages.join(' '));
    } else {
        setError(null);
    }

    setFiles(prevFiles => {
        const existingFileNames = new Set(prevFiles.map(f => f.name));
        const uniqueNewFiles = validFiles.filter(f => !existingFileNames.has(f.name));
        return [...prevFiles, ...uniqueNewFiles];
    });
  }, []);

  useEffect(() => {
    const extractAllText = async () => {
        if (files.length === 0) {
            setSourceText('');
            setDetectedLanguage('unknown');
            return;
        }

        setIsExtracting(true);
        setError(null);
        try {
            const textPromises = files.map(file => extractTextFromPdf(file));
            const texts = await Promise.all(textPromises);
            const combinedText = texts.join('\n\n---\n\n');
            setSourceText(combinedText);
            setDetectedLanguage(detectLanguage(combinedText));
        } catch (err) {
            setError('Failed to extract text from one or more PDFs. Files might be corrupted or protected.');
            setSourceText('');
            setDetectedLanguage('unknown');
        } finally {
            setIsExtracting(false);
        }
    };
    extractAllText();
  }, [files]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) { // Reset file input to allow re-uploading the same file
        fileInput.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please upload at least one PDF file to generate a quiz.');
      return;
    }
    if (isExtracting) {
        setError('Please wait for files to be processed.');
        return;
    }
    setError(null);

    const finalLanguage = selectedLanguage === 'auto' ? detectedLanguage : selectedLanguage;
    if (finalLanguage === 'unknown') {
        setError("Could not determine the language from the document. Please select a language manually.");
        return;
    }

    onQuizGenerate({
        sourceText,
        numQuestions: Number(numQuestions) || 1,
        difficulty,
        timeLimit: (Number(timeLimit) || 1) * 60, // convert minutes to seconds
        language: finalLanguage,
        customPrompt,
    });
  };
  
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-4">
            <h3 className="text-2xl font-semibold text-[#2b2b33]">Test Your Knowledge</h3>
        </div>
        <Card className="w-full mx-auto">
        <form onSubmit={handleSubmit}>
            <div className="text-center p-6">
                <i className="bi bi-pencil-square text-4xl text-[#018a83] mb-4 inline-block"></i>
                <h5 className="text-xl font-semibold text-[#2b2b33]">Practice Quiz</h5>
                <p className="text-md text-[#555]">Upload one or more PDFs to practice unlimited questions until you master it.</p>
            </div>
            <CardContent className="space-y-6 pt-0">
            <div 
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center transition-colors
                ${isDragging ? 'border-[#018a83] bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {files.length > 0 ? (
                    <div className="w-full space-y-3">
                        <div className="max-h-36 overflow-y-auto space-y-2 pr-2">
                        {files.map((file, index) => (
                            <div key={file.name} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileIcon className="w-5 h-5 text-[#018a83] flex-shrink-0" />
                                    <span className="font-medium text-sm truncate" title={file.name}>{file.name}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveFile(index)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        </div>
                        {isExtracting && <p className="text-sm text-gray-500">Processing files...</p>}
                         <Button type="button" variant="outline" onClick={() => document.getElementById('pdf-upload')?.click()}>
                            Add More Files
                        </Button>
                    </div>
                ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <UploadCloud className="w-12 h-12" />
                    <p className="font-semibold">Drag & drop your PDFs here</p>
                    <p className="text-sm">or</p>
                    <Button type="button" variant="outline" onClick={() => document.getElementById('pdf-upload')?.click()}>
                    Browse Files
                    </Button>
                    <input type="file" id="pdf-upload" accept="application/pdf" onChange={handleFileChange} className="hidden" multiple />
                    <p className="text-xs mt-2">Max file size: 5MB per file</p>
                </div>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Prompt (Optional)</Label>
              <Textarea
                id="custom-prompt"
                placeholder="e.g., 'Focus on the historical dates mentioned in the text' or 'Generate questions about the main characters'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="num-questions">Number of Questions</Label>
                <Input
                    id="num-questions"
                    type="number"
                    value={numQuestions}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setNumQuestions('');
                      } else {
                        setNumQuestions(Math.max(1, parseInt(val, 10) || 1));
                      }
                    }}
                    min="1"
                    max="50"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}>
                    <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty">
                        {difficultyOptions.find(opt => opt.value === difficulty)?.label}
                    </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                    {difficultyOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                    id="time-limit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setTimeLimit('');
                      } else {
                        setTimeLimit(Math.max(1, parseInt(val, 10) || 1));
                      }
                    }}
                    min="1"
                />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Quiz Language</Label>
                  <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as 'auto' | 'en' | 'ar')}>
                      <SelectTrigger id="language">
                          <SelectValue placeholder="Select language">
                              {languageOptions.find(opt => opt.value === selectedLanguage)?.label}
                          </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                          {languageOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
            </div>
            
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 p-3 bg-red-50 rounded-md mt-4">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
                </div>
            )}

            </CardContent>
            <CardFooter>
            <Button type="submit" disabled={isLoading || files.length === 0 || isExtracting} className="w-full text-lg py-3">
                {isLoading ? 'Generating...' : isExtracting ? 'Processing PDFs...' : 'Generate Quiz'}
            </Button>
            </CardFooter>
        </form>
        </Card>
    </div>
  );
};

export default UploadView;