import express from "express";

const router = express.Router();
import {
    getChatMessages,
    getRoomMessages,
    createMessage,
    updateMessage,
    deleteMessage,
} from "../controllers/MessageController.js";

import {authMiddleware} from "../middlewares/authMiddleware";

router.get("/", authMiddleware, getChatMessages);
router.get("/room/:roomId", authMiddleware, getRoomMessages);
router.post("/", authMiddleware, createMessage);
router.put("/:messageId", authMiddleware, updateMessage);
router.delete("/:messageId", authMiddleware, deleteMessage);

export default router;
