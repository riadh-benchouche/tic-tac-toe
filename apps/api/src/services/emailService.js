// @ts-ignore
import mailTransporter from "../config/mail-config.js";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

export const sendEmail = async (email, subject, template) => {
    try {
        await mailTransporter.sendMail({
            from: process.env.MAIL_SMTP_USER,
            to: email,
            subject,
            html: template,
        });
    } catch (error) {
        console.error(error);
    }
};

export const sendEmailConfirmation = async (email, token) => {
    try {
        const confirmationLink = `http://localhost:3000/auth/authorized?email=${email}&authentificationToken=${token}`;

        const subject = "Confirmation de votre compte";

        console.log("confirmationLink", confirmationLink)

        const htmlTemplate = fs.readFileSync(
            path.join(__dirname, "/src/templates/confirmation.html"),
            "utf8"
        );

        console.log("Template before replacement:", htmlTemplate);

        const template = htmlTemplate.replace(
            "{{confirmationLink}}",
            confirmationLink
        );

        console.log("Template after replacement:", template);

        await sendEmail(email, subject, template);

        return true;
    } catch (error) {
        console.error(`Error sending confirmation email : ${error.message}`);
    }
};