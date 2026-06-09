import fs from "fs";
import db from "../config/sqlite.js";
import {
  extractTextFromPDF,
  splitTextIntoChunks,
} from "../services/pdfService.js";
import { generateSmartSummary } from "../services/summaryService.js";

// UPLOAD PDF + EXTRACT TEXT
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    const userId = req.user.id;
    const fileName = req.file.filename;
    const originalName = req.file.originalname;
    const filePath = req.file.path;

    const extractedText = await extractTextFromPDF(filePath);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "PDF uploaded, but text could not be extracted. Please use a text-based PDF.",
      });
    }

    const textPreview = extractedText.substring(0, 300);
    const chunks = splitTextIntoChunks(extractedText, 350, 80);

    const result = db
      .prepare(
        `INSERT INTO documents 
        (user_id, file_name, original_name, file_path, text_content, text_preview, total_chunks)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        userId,
        fileName,
        originalName,
        filePath,
        extractedText,
        textPreview,
        chunks.length
      );

    const documentId = result.lastInsertRowid;

    const insertChunk = db.prepare(
      `INSERT INTO document_chunks 
      (document_id, user_id, chunk_text, embedding, chunk_index)
      VALUES (?, ?, ?, ?, ?)`
    );

    chunks.forEach((chunk, index) => {
      insertChunk.run(documentId, userId, chunk, "", index);
    });

    const document = db
      .prepare(
        `SELECT id, user_id, file_name, original_name, text_preview, total_chunks, created_at
         FROM documents 
         WHERE id = ?`
      )
      .get(documentId);

    res.status(201).json({
      success: true,
      message: "PDF uploaded and text extracted successfully",
      document,
    });
  } catch (error) {
    console.error("Upload Document Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during PDF upload",
    });
  }
};

// GET MY DOCUMENTS
export const getMyDocuments = (req, res) => {
  try {
    const userId = req.user.id;

    const documents = db
      .prepare(
        `SELECT id, user_id, file_name, original_name, text_preview, total_chunks, created_at 
         FROM documents 
         WHERE user_id = ? 
         ORDER BY created_at DESC`
      )
      .all(userId);

    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get Documents Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting documents",
    });
  }
};

// GET SINGLE DOCUMENT
export const getDocumentById = (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = db
      .prepare(
        `SELECT id, user_id, file_name, original_name, text_preview, total_chunks, created_at
         FROM documents
         WHERE id = ? AND user_id = ?`
      )
      .get(documentId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const chunks = db
      .prepare(
        `SELECT id, chunk_text, chunk_index
         FROM document_chunks
         WHERE document_id = ? AND user_id = ?
         ORDER BY chunk_index ASC`
      )
      .all(documentId, userId);

    res.json({
      success: true,
      document,
      chunks,
    });
  } catch (error) {
    console.error("Get Document Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting document",
    });
  }
};

// SUMMARIZE DOCUMENT + SAVE SUMMARY HISTORY
export const summarizeDocument = (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;
    const { wordLimit } = req.body;

    const selectedWordLimit = Number(wordLimit) || 200;

    const document = db
      .prepare(
        `SELECT id, user_id, original_name, text_content, total_chunks
         FROM documents
         WHERE id = ? AND user_id = ?`
      )
      .get(documentId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    let textForSummary = document.text_content;

    if (!textForSummary || textForSummary.trim().length === 0) {
      const chunks = db
        .prepare(
          `SELECT chunk_text
           FROM document_chunks
           WHERE document_id = ? AND user_id = ?
           ORDER BY chunk_index ASC`
        )
        .all(documentId, userId);

      textForSummary = chunks.map((chunk) => chunk.chunk_text).join(" ");
    }

    if (!textForSummary || textForSummary.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No extracted text or chunks found for this document. Please upload the PDF again.",
      });
    }

    const summary = generateSmartSummary(textForSummary, selectedWordLimit);

    const result = db
      .prepare(
        `INSERT INTO summaries (user_id, document_id, summary, word_limit)
         VALUES (?, ?, ?, ?)`
      )
      .run(userId, documentId, summary, selectedWordLimit);

    const summaryRecord = db
      .prepare("SELECT * FROM summaries WHERE id = ?")
      .get(result.lastInsertRowid);

    res.json({
      success: true,
      message: "Summary generated successfully",
      documentId: document.id,
      documentName: document.original_name,
      wordLimit: selectedWordLimit,
      summary,
      summaryRecord,
    });
  } catch (error) {
    console.error("Summarize Document Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while summarizing document",
    });
  }
};

// GET SUMMARY HISTORY
export const getSummaryHistory = (req, res) => {
  try {
    const userId = req.user.id;

    const summaries = db
      .prepare(
        `SELECT 
          summaries.id,
          summaries.user_id,
          summaries.document_id,
          summaries.summary,
          summaries.word_limit,
          summaries.created_at,
          documents.original_name
        FROM summaries
        JOIN documents ON summaries.document_id = documents.id
        WHERE summaries.user_id = ?
        ORDER BY summaries.created_at DESC`
      )
      .all(userId);

    res.json({
      success: true,
      count: summaries.length,
      summaries,
    });
  } catch (error) {
    console.error("Get Summary History Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting summary history",
    });
  }
};

// DELETE SUMMARY
export const deleteSummary = (req, res) => {
  try {
    const userId = req.user.id;
    const summaryId = req.params.summaryId;

    const summary = db
      .prepare("SELECT * FROM summaries WHERE id = ? AND user_id = ?")
      .get(summaryId, userId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Summary not found",
      });
    }

    db.prepare("DELETE FROM summaries WHERE id = ? AND user_id = ?").run(
      summaryId,
      userId
    );

    res.json({
      success: true,
      message: "Summary deleted successfully",
    });
  } catch (error) {
    console.error("Delete Summary Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting summary",
    });
  }
};

// DELETE DOCUMENT
export const deleteDocument = (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = db
      .prepare("SELECT * FROM documents WHERE id = ? AND user_id = ?")
      .get(documentId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.file_path && fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    db.prepare("DELETE FROM document_chunks WHERE document_id = ?").run(
      documentId
    );

    db.prepare("DELETE FROM chats WHERE document_id = ?").run(documentId);

    db.prepare("DELETE FROM summaries WHERE document_id = ?").run(documentId);

    db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").run(
      documentId,
      userId
    );

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete Document Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting document",
    });
  }
};