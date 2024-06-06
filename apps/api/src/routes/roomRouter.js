import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {
    createRoom,
    joinRoom,
    leaveRoom,
} from "../controllers/RoomController";

const router = express.Router();

router.post("/", authMiddleware, createRoom);
router.post("/join/:roomId", authMiddleware, joinRoom);
router.post("/leave", authMiddleware, leaveRoom);

export default router;