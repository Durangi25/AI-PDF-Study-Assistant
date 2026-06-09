import db from "../config/sqlite.js";
import {
  findRelevantChunks,
  generateAnswerFromChunks,
} from "../services/searchService.js";

// ASK QUESTION FROM PDF
export const askQuestion = (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        message: "Document ID and question are required",
      });
    }

    const document = db
      .prepare("SELECT * FROM documents WHERE id = ? AND user_id = ?")
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

    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No text chunks found for this document",
      });
    }

    const relevantChunks = findRelevantChunks(question, chunks);

    const answer = generateAnswerFromChunks(question, relevantChunks);

    const sources = JSON.stringify(
      relevantChunks.map((chunk) => ({
        chunkId: chunk.id,
        chunkIndex: chunk.chunk_index,
        score: chunk.score,
      }))
    );

    const result = db
      .prepare(
        `INSERT INTO chats 
        (user_id, document_id, question, answer, sources)
        VALUES (?, ?, ?, ?, ?)`
      )
      .run(userId, documentId, question, answer, sources);

    const chat = db
      .prepare("SELECT * FROM chats WHERE id = ?")
      .get(result.lastInsertRowid);

    res.json({
      success: true,
      message: "Answer generated successfully",
      chat,
      sources: relevantChunks.map((chunk) => ({
        chunkId: chunk.id,
        chunkIndex: chunk.chunk_index,
        score: chunk.score,
      })),
    });
  } catch (error) {
    console.error("Ask Question Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while asking question",
    });
  }
};

// GET CHAT HISTORY BY DOCUMENT
export const getChatHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.documentId;

    const chats = db
      .prepare(
        `SELECT id, user_id, document_id, question, answer, sources, created_at
         FROM chats
         WHERE user_id = ? AND document_id = ?
         ORDER BY created_at ASC`
      )
      .all(userId, documentId);

    res.json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    console.error("Get Chat History Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting chat history",
    });
  }
};

// GET ALL CHAT HISTORY FOR LOGGED-IN USER
export const getAllChatHistory = (req, res) => {
  try {
    const userId = req.user.id;

    const chats = db
      .prepare(
        `SELECT 
          chats.id,
          chats.user_id,
          chats.document_id,
          chats.question,
          chats.answer,
          chats.sources,
          chats.created_at,
          documents.original_name
        FROM chats
        JOIN documents ON chats.document_id = documents.id
        WHERE chats.user_id = ?
        ORDER BY chats.created_at DESC`
      )
      .all(userId);

    res.json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    console.error("Get All Chat History Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting all chat history",
    });
  }
};

// CLEAR CHAT HISTORY FOR ONE DOCUMENT
export const clearChatHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.documentId;

    db.prepare(
      `DELETE FROM chats 
       WHERE user_id = ? AND document_id = ?`
    ).run(userId, documentId);

    res.json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("Clear Chat History Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while clearing chat history",
    });
  }
};