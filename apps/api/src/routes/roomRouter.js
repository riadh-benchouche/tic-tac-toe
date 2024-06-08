import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {createRoom, joinRoom, exitRoom, getCurrentRoom} from "../controllers/RoomController";

const router = express.Router();

router.post("/", authMiddleware, createRoom);
router.post("/join/:roomId", authMiddleware, joinRoom);
router.post("/leave", authMiddleware, exitRoom);
router.get("/getCurrentRoom/:roomCode", authMiddleware, getCurrentRoom);

export default router;