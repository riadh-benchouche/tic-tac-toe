import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import codeRoom from "../utils/codeRoom.js";
import {sendEmailConfirmation} from "../services/mailService";

dotenv.config();

export const confirmEmail = async (req, res, next) => {
    try {
        const {email, authentificationToken} = req.query;

        if (!email || !authentificationToken) {
            return res.status(400).json({message: 'Invalid confirmation link'});
        }

        const user = await User.findOne({email, token: authentificationToken});

        if (!user) {
            return res.status(400).json({message: 'Invalid confirmation link'});
        }

        user.confirmed = true;

        await user.save();

        res.status(200).json({message: 'Account confirmed successfully'});
    } catch (error) {
        console.error(`Error confirming account: ${error}`);
        res.status(500).json({message: 'Server error'});
    }
};

export const register = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if (!(username && email && password))
            return new Error("Invalid arguments");

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({email});
        if (existingUser)
            return res.sendStatus(409);

        const authentificationToken = codeRoom(6);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            token: authentificationToken,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
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
                _id: user._id,
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

export const updateAccount = async (req, res) => {
    try {
        const {username, password} = req.body;

        const user = await User.findById(req.body.user.userId);

        if (!user) {
            return res.sendStatus(404);
        }

        if (username) {
            user.username = username;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            error: `An error occurred while updating account: ${error}`,
        });
    }
}

