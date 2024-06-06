import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({
    path: ".env",
});
const mailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: process.env.MAIL_SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_SMTP_USER,
        pass: process.env.MAIL_SMTP_KEY,
    },
});

export default mailTransporter;