
import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, Quiz, Language } from '../types';

// Per guidelines, API key is handled by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const getQuizSchema = (language: Language) => ({
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: language === 'ar' 
        ? "عنوان قصير وجذاب للاختبار بناءً على النص المصدر."
        : "A short, engaging title for the quiz based on the source text."
    },
    questions: {
      type: Type.ARRAY,
      description: language === 'ar' ? "مجموعة من أسئلة الاختبار." : "An array of quiz questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: language === 'ar' ? "نص السؤال." : "The question text." },
          options: {
            type: Type.ARRAY,
            description: language === 'ar' ? "مجموعة من 4 خيارات متعددة." : "An array of 4 multiple-choice options.",
            items: { type: Type.STRING }
          },
          answer: { type: Type.STRING, description: language === 'ar' ? "الخيار الصحيح من مصفوفة 'options'." : "The correct option from the 'options' array." },
          explanation: { type: Type.STRING, description: language === 'ar' ? "شرح موجز لسبب صحة الإجابة." : "A brief explanation for why the answer is correct." }
        },
        required: ["question", "options", "answer", "explanation"]
      }
    }
  },
  required: ["title", "questions"]
});

const getPrompt = (sourceText: string, numQuestions: number, difficulty: string, language: Language, customPrompt?: string) => {
    if (language === 'ar') {
        const difficultyMap: { [key: string]: string } = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };
        const customPromptInstruction = customPrompt ? `9.  **تركيز مخصص:** ${customPrompt}\n` : '';
        return `
            بناءً على النص التالي، قم بإنشاء اختبار متعدد الخيارات باللغة العربية.

            **التعليمات:**
            1.  أنشئ بالضبط ${numQuestions} سؤالاً.
            2.  يجب أن يكون مستوى الصعوبة ${difficultyMap[difficulty]}.
            3.  يجب أن يحتوي كل سؤال على 4 خيارات بالضبط.
            4.  يجب أن يكون أحد الخيارات هو الإجابة الصحيحة.
            5.  قدم شرحاً موجزاً للإجابة الصحيحة.
            6.  يجب أن يكون عنوان الاختبار ذا صلة بالنص.
            7.  تأكد من أن الأسئلة والخيارات مشتقة مباشرة من النص المقدم.
            8.  قم بإرجاع المخرجات بتنسيق JSON المحدد. لا تقم بتضمين أي نص تمهيدي أو تنسيق markdown.
            ${customPromptInstruction}
            **النص المصدر:**
            ---
            ${sourceText}
            ---
        `;
    }
    // Default to English
    const customPromptInstruction = customPrompt ? `9.  **Custom Focus:** ${customPrompt}\n` : '';
    return `
        Based on the following text, generate a multiple-choice quiz.

        **Instructions:**
        1.  Create exactly ${numQuestions} questions.
        2.  The difficulty level should be ${difficulty}.
        3.  Each question must have exactly 4 options.
        4.  One option must be the correct answer.
        5.  Provide a brief explanation for the correct answer.
        6.  The quiz title should be relevant to the text.
        7.  Ensure the questions and options are directly derived from the provided text.
        8.  Return the output in the specified JSON format. Do not include any introductory text or markdown formatting.
        ${customPromptInstruction}
        **Source Text:**
        ---
        ${sourceText}
        ---
    `;
}


export async function generateQuizFromText(
  sourceText: string,
  numQuestions: number,
  difficulty: 'easy' | 'medium' | 'hard',
  language: Language,
  customPrompt?: string
): Promise<QuizData> {
  const startTime = performance.now();
  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;

  const prompt = getPrompt(sourceText, numQuestions, difficulty, language, customPrompt);
  const schema = getQuizSchema(language);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text;
    const quiz: Quiz = JSON.parse(jsonText);
    
    if (!quiz.title || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        throw new Error("Invalid quiz format received from AI.");
    }
    quiz.questions.forEach(q => {
        if (!q.question || !Array.isArray(q.options) || !q.answer || !q.explanation) { // Allow different number of options
            throw new Error("Invalid question format received from AI.");
        }
    });

    const endTime = performance.now();
    const processingTime = (endTime - startTime) / 1000;

    return {
      quiz,
      stats: {
        totalQuestions: quiz.questions.length,
        extractedWords: wordCount,
        processingTime: processingTime,
      },
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
        throw new Error("The quiz could not be generated due to safety settings. Please try with different source text.");
    }
    throw new Error("Failed to generate quiz. The AI may be experiencing high traffic. Please try again later.");
  }
}