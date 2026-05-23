import * as pdfjsLib from 'pdfjs-dist';

// We explicitly set the worker source to the version matching the import map (4.5.136).
// This prevents version mismatch errors which cause extraction to fail.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs`;

/**
 * Extracts all text content from a given PDF file.
 * @param file The PDF file object to process.
 * @returns A promise that resolves to a single string containing all the text from the PDF.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  // Read the file into memory as an ArrayBuffer.
  const arrayBuffer = await file.arrayBuffer();
  
  // Create a Uint8Array from the buffer. pdfjs-dist v4+ prefers typed arrays or the { data: ... } format.
  const typedArray = new Uint8Array(arrayBuffer);

  // Load the PDF document using the data object property.
  // CRITICAL: We add cMapUrl and cMapPacked to support non-Latin scripts like Arabic.
  const loadingTask = pdfjsLib.getDocument({
    data: typedArray,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  
  let fullText = '';
  const numPages = pdf.numPages;

  // Iterate through each page of the PDF.
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // The text content is an array of items. We join them to form the page's text.
    // 'str' is the actual text content of the item.
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    
    // Append the text of the current page to the full text, with newlines for separation.
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}