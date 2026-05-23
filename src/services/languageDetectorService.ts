import { Language } from "../types";

/**
 * A simple language detector to differentiate between English and Arabic.
 * It checks for the presence of Arabic characters in the text.
 * @param text The text to analyze.
 * @returns 'ar' if Arabic characters are found, otherwise 'en'.
 */
export function detectLanguage(text: string): Language {
    // Regular expression to detect Arabic characters.
    const arabicRegex = /[\u0600-\u06FF]/;
    
    if (arabicRegex.test(text)) {
        return 'ar';
    }
    
    // Default to English if no Arabic characters are found.
    return 'en';
}
