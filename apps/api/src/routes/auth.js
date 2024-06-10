import express from "express";
import {register, login, confirmEmail, updateAccount} from "../controllers/authController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/authorized", confirmEmail);
router.put("/update", authMiddleware, updateAccount);
export default router;