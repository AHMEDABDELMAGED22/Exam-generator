
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizData, Quiz, Language, QuestionType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getQuizSchema = (language: Language, questionType: QuestionType): Schema => {
  let optionsDescription = "An array of options (4 for MCQ, 2 for True/False).";
  
  if (questionType === 'true_false') {
      optionsDescription = "An array containing EXACTLY two strings: 'True' and 'False'.";
  } else if (questionType === 'mcq') {
      optionsDescription = "This array must contain EXACTLY 4 multiple-choice options.";
  } else if (questionType === 'essay') {
      optionsDescription = "This array must be empty for essay questions.";
  }

  return {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A short, engaging title for the quiz based on the source text."
      },
      questions: {
        type: Type.ARRAY,
        description: "An array of quiz questions.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "The question text." },
            options: {
              type: Type.ARRAY,
              description: optionsDescription,
              items: { type: Type.STRING }
            },
            answer: { type: Type.STRING, description: "The model or key answer for the question." },
            explanation: { type: Type.STRING, description: "A detailed explanation of the answer and how it's derived from the text." }
          },
          required: ["question", "options", "answer", "explanation"]
        }
      }
    },
    required: ["title", "questions"]
  };
};

const getPrompt = (sourceText: string, numQuestions: number, difficulty: string, language: Language, questionType: QuestionType, customPrompt?: string) => {
    let typeInstruction = '';
    
    if (language === 'ar') {
        if (questionType === 'mcq') {
            typeInstruction = "3. كل سؤال **يجب** أن يحتوي على 4 خيارات بالضبط. لا أكثر ولا أقل.";
        } else if (questionType === 'true_false') {
            typeInstruction = "3. كل سؤال **يجب** أن يكون بصيغة (صح/خطأ). مصفوفة الخيارات يجب أن تكون ['صح', 'خطأ'] فقط.";
        } else if (questionType === 'essay') {
            typeInstruction = "3. نوع الأسئلة: **أسئلة مقالية تحليلية**. لا تضف أي خيارات. الإجابة (answer) يجب أن تكون فقرة نموذجية تشرح المفهوم المطلوب بناءً على النص.";
        } else {
            typeInstruction = "3. نوع الأسئلة: مزيج من متعدد الخيارات وصح/خطأ.";
        }

        const difficultyMap: { [key: string]: string } = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };
        const customPromptInstruction = customPrompt ? `9.  **تركيز مخصص:** ${customPrompt}\n10. **هام جداً:** يجب أن تظل المخرجات بصيغة JSON صحيحة بالكامل وتتبع المخطط المطلوب (schema) حتى مع التركيز المخصص. لا تضف أي نص أو مقدمة خارج الـ JSON.\n` : '';
        return `
            بناءً على النص التالي، قم بإنشاء اختبار باللغة العربية.

            **التعليمات الهامة:**
            1. أنشئ بالضبط ${numQuestions} سؤالاً.
            2. مستوى الصعوبة: ${difficultyMap[difficulty]}.
            ${typeInstruction}
            4. تأكد من أن الأسئلة تغطي النقاط الجوهرية في الفصول المذكورة في النص (مثل مفاهيم المناهج، أنواعها، التقويم).
            5. قدم شرحاً نموذجياً في حقل (explanation).
            6. العنوان يجب أن يكون معبراً عن محتوى الفصول.
            7. لا تقم بتضمين أي نص تمهيدي، فقط JSON.
            ${customPromptInstruction}
            **النص المصدر:**
            ---
            ${sourceText}
            ---
        `;
    }
    
    if (questionType === 'mcq') {
        typeInstruction = "3. Each question MUST have exactly 4 options.";
    } else if (questionType === 'true_false') {
        typeInstruction = "3. FORMAT: True/False Questions ONLY.";
    } else if (questionType === 'essay') {
        typeInstruction = "3. FORMAT: Analytical Essay Questions. No options required. The 'answer' should be a model paragraph.";
    } else {
        typeInstruction = "3. Question types: A mix of Multiple Choice and True/False.";
    }

    const customPromptInstruction = customPrompt ? `9.  **Custom Focus:** ${customPrompt}\n10. **CRITICAL:** You must strictly return ONLY valid JSON matching the schema, even when applying the custom focus. Do not add conversational text.\n` : '';
    return `
        Based on the following text, generate a quiz.
        1. Create exactly ${numQuestions} questions.
        2. Difficulty: ${difficulty}.
        ${typeInstruction}
        4. Return ONLY valid JSON.
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
  questionType: QuestionType,
  customPrompt?: string
): Promise<QuizData> {
  const startTime = performance.now();
  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;

  const prompt = getPrompt(sourceText, numQuestions, difficulty, language, questionType, customPrompt);
  const schema = getQuizSchema(language, questionType);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      },
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No content generated");
    
    // Clean up markdown block formatting if present
    jsonText = jsonText.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    const quiz: Quiz = JSON.parse(jsonText);
    
    if (questionType === 'true_false') {
        const trueVal = language === 'ar' ? 'صح' : 'True';
        const falseVal = language === 'ar' ? 'خطأ' : 'False';
        quiz.questions.forEach(q => {
            q.options = [trueVal, falseVal];
        });
    }

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
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    
    // Check for 429 Too Many Requests / Quota Exceeded
    const errorMessage = error?.message || String(error);
    if (
        error?.status === 429 || 
        error?.status === "RESOURCE_EXHAUSTED" || 
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('Quota')
    ) {
        throw new Error("API Quota Exceeded: You have reached the limit for the Gemini API free tier. Please wait a minute and try again.");
    }

    throw new Error("Failed to generate quiz. Please try again.");
  }
}
