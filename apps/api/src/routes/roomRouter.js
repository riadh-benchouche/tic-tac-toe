import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import { createRoom, joinRoom, exitRoom} from "../controllers/RoomController";

const router = express.Router();

router.post("/", authMiddleware, createRoom);
router.post("/join/:roomId", authMiddleware, joinRoom);
router.post("/leave", authMiddleware, exitRoom);

export default router;