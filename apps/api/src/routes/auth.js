import express from "express";
import {register, login, confirmEmail} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/confirm", confirmEmail);
export default router;