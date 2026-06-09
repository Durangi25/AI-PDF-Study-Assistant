import express from "express";
import {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  summarizeDocument,
  getSummaryHistory,
  deleteSummary,
  deleteDocument,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", protect, upload.single("pdf"), uploadDocument);
router.get("/my-documents", protect, getMyDocuments);

router.get("/summaries/history", protect, getSummaryHistory);
router.delete("/summaries/:summaryId", protect, deleteSummary);

router.get("/:id", protect, getDocumentById);
router.post("/:id/summarize", protect, summarizeDocument);
router.delete("/:id", protect, deleteDocument);

export default router;