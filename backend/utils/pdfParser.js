import fs from "fs/promises";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Extract text from PDF
 * @param {string} filePath
 * @returns {Promise<string>} The raw text extracted from the PDF
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);

        const data = await pdfParse(dataBuffer);

        // ✅ FIX: Return ONLY the text string.
        // Your controller expects a string to pass into chunkText()
        return data.text;
        
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};