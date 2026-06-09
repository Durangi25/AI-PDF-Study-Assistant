import fs from "fs";
import db from "../config/sqlite.js";

// GET ADMIN STATS
export const getAdminStats = (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) AS count FROM users").get();
    const totalDocuments = db.prepare("SELECT COUNT(*) AS count FROM documents").get();
    const totalChats = db.prepare("SELECT COUNT(*) AS count FROM chats").get();

    const recentDocuments = db
      .prepare(
        `SELECT 
          documents.id,
          documents.original_name,
          documents.total_chunks,
          documents.created_at,
          users.name AS user_name,
          users.email AS user_email
        FROM documents
        JOIN users ON documents.user_id = users.id
        ORDER BY documents.created_at DESC
        LIMIT 5`
      )
      .all();

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count,
        totalDocuments: totalDocuments.count,
        totalChats: totalChats.count,
      },
      recentDocuments,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting admin stats",
    });
  }
};

// GET ALL USERS
export const getAllUsers = (req, res) => {
  try {
    const users = db
      .prepare(
        `SELECT id, name, email, role, created_at 
         FROM users 
         ORDER BY created_at DESC`
      )
      .all();

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting users",
    });
  }
};

// GET ALL DOCUMENTS
export const getAllDocuments = (req, res) => {
  try {
    const documents = db
      .prepare(
        `SELECT 
          documents.id,
          documents.user_id,
          documents.original_name,
          documents.file_path,
          documents.total_chunks,
          documents.created_at,
          users.name AS user_name,
          users.email AS user_email
        FROM documents
        JOIN users ON documents.user_id = users.id
        ORDER BY documents.created_at DESC`
      )
      .all();

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

// DELETE USER
export const deleteUserByAdmin = (req, res) => {
  try {
    const userId = req.params.id;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin user cannot be deleted",
      });
    }

    const documents = db
      .prepare("SELECT * FROM documents WHERE user_id = ?")
      .all(userId);

    documents.forEach((doc) => {
      if (doc.file_path && fs.existsSync(doc.file_path)) {
        fs.unlinkSync(doc.file_path);
      }
    });

    db.prepare("DELETE FROM chats WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM document_chunks WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM documents WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// DELETE DOCUMENT
export const deleteDocumentByAdmin = (req, res) => {
  try {
    const documentId = req.params.id;

    const document = db.prepare("SELECT * FROM documents WHERE id = ?").get(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.file_path && fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    db.prepare("DELETE FROM chats WHERE document_id = ?").run(documentId);
    db.prepare("DELETE FROM document_chunks WHERE document_id = ?").run(documentId);
    db.prepare("DELETE FROM documents WHERE id = ?").run(documentId);

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