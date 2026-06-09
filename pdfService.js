import fs from "fs";
import { PDFParse } from "pdf-parse";

export const extractTextFromPDF = async (filePath) => {
  let parser;

  try {
    const buffer = fs.readFileSync(filePath);

    parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    const text = result.text
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } catch (error) {
    console.error("PDF Text Extraction Error:", error.message);
    return "";
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

export const splitTextIntoChunks = (text, chunkSize = 350, overlap = 80) => {
  const words = text.split(/\s+/);
  const chunks = [];

  let start = 0;

  while (start < words.length) {
    const end = start + chunkSize;
    const chunk = words.slice(start, end).join(" ");

    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
};