import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getAllDocuments,
  deleteUserByAdmin,
  deleteDocumentByAdmin,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/documents", protect, adminOnly, getAllDocuments);
router.delete("/users/:id", protect, adminOnly, deleteUserByAdmin);
router.delete("/documents/:id", protect, adminOnly, deleteDocumentByAdmin);

export default router;