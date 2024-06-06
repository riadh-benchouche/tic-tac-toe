import express from "express";
import {play, getGamesHistory} from "../controllers/gameController.js";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/play", authMiddleware, play);
router.get("/history", authMiddleware, getGamesHistory);

export default router;
