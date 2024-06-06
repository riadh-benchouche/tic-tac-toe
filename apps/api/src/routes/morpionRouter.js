import express from "express";
import {launchGame, getMorpionsHistory} from "../controllers/morpionController.js";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/play", authMiddleware, launchGame);
router.get("/history", authMiddleware, getMorpionsHistory);

export default router;
