import * as pdfjsLib from 'pdfjs-dist';

// Set workerSrc to point to the CDN. This is required for the library to work.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs`;

/**
 * Extracts all text content from a given PDF file.
 * @param file The PDF file object to process.
 * @returns A promise that resolves to a single string containing all the text from the PDF.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  // Read the file into memory as an ArrayBuffer.
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document from the ArrayBuffer.
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  const numPages = pdf.numPages;

  // Iterate through each page of the PDF.
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // The text content is an array of items. We join them to form the page's text.
    // We add a space to separate text items.
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    
    // Append the text of the current page to the full text, with newlines for separation.
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}