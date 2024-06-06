import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import generateString from "../utils/generateString.js";
import {sendEmailConfirmation} from "../services/emailService";

dotenv.config();
export const register = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if (!(username && email && password))
            return new Error("Invalid arguments");

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({email});
        if (existingUser)
            return res.sendStatus(409);

        const authentificationToken = generateString(6);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            token: authentificationToken,
            confirmed: false,
        });

        const payload = {
            userId: user._id,
        };

        const options = {
            expiresIn: "12h",
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, options);

        await sendEmailConfirmation(
            email,
            authentificationToken
        );


        await user.save();
        res.json({user, token});
    } catch (error) {
        res.status(500).json({
            error: `An error occurred while registering: ${error}`,
        });
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.sendStatus(401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.sendStatus(401);
        }

        if (!user.confirmed) {
            return res.sendStatus(403);
        }

        const payload = {
            userId: user._id,
        };

        const options = {
            expiresIn: "12h",
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, options);
        res.json({
            user: {
                username: user.username,
                email: user.email,
                confirmed: user.confirmed,
                color: user.color,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({
            error: `An error occurred while logging in: ${error}`,
        });
    }
};

export const confirmEmail = async (req, res) => {
    try {
        const {email, token} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.sendStatus(404);
        }

        if (user.token !== token) {
            return res.sendStatus(401);
        }

        user.confirmed = true;
        user.token = null;

        await user.save();

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            error: `An error occurred while confirming email: ${error}`,
        });
    }
}