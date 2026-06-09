import express from "express";
import {
  askQuestion,
  getChatHistory,
  getAllChatHistory,
  clearChatHistory,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/ask", protect, askQuestion);
router.get("/history/all", protect, getAllChatHistory);
router.get("/:documentId", protect, getChatHistory);
router.delete("/:documentId", protect, clearChatHistory);

export default router;