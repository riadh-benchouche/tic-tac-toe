import {log} from "@repo/logger";
import {error} from "@repo/logger";
// @ts-ignore
import {createServer} from "./server.js";
// @ts-ignore
import {launchGame} from "./controllers/morpionController.js";
// @ts-ignore
import Message from "./models/Message.js";
import {Server} from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./server.js";
import http from "http";

dotenv.config()
const port = process.env.PORT;
const dbUri = process.env.DB_URI || "";
app.set("port", port);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization"],
        credentials: true,
    }
});

let usersLogged: {
    id: string; user: any;
}[] = [];
let usersChat: any[] = [];
io.on("connection", (socket) => {
    socket.on("userLogged", (user) => {
        usersLogged.push({id: socket.id, user});
        io.emit("usersLogged", usersLogged);
    });

    socket.on("joinChat", (user) => {
        usersChat.push({id: socket.id, user});
        io.emit("joinChat", usersChat);
    });

    socket.on("sendMessage", async (message) => {
        try {
            const {sender, isInRoom, content} = message;
            const newMessage = new Message({
                sender,
                isInRoom,
                content
            });
            const savedMessage = await newMessage.save();

            const populatedMessage = await Message.findById(
                savedMessage._id
            ).populate("sender", "username color");

            io.emit("newMessage", populatedMessage);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("editMessage", async (messageId, newText) => {
        try {
            await Message.findByIdAndUpdate(messageId, {text: newText});
            io.emit("editMessage", messageId, newText);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("deleteMessage", async (messageId) => {
        try {
            await Message.findByIdAndDelete(messageId);
            io.emit("deleteMessage", messageId);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("userJoinedGame", ({room, user}) => {
        io.emit("userJoinedGame", {room, user});
    });

    socket.on("userLeftGame", ({roomId, user}) => {
        io.emit("userLeftGame", {roomId, user});
    });

    socket.on("playerPlayed", async ({userId, row, col}) => {
        try {
            const room = await launchGame({userId, row, col});
            io.emit("playerPlayed", room);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("disconnect", () => {
        const userDisconnectedFromChat = usersChat.find(
            (data) => data.id === socket.id
        );
        usersChat = usersChat.filter(
            (data) => data.id !== socket.id
        );
        io.emit("leaveChat", userDisconnectedFromChat);

        const userIndex = usersLogged.findIndex(
            (data) => data.id === socket.id
        );
        if (userIndex !== -1) {
            usersLogged.splice(userIndex, 1);
        }
    });
});



app.set("socketio", io);
app.listen(port, () => {
    log(`api running on ${port}`);
});

try {
    mongoose.connect(dbUri).then(() => {
        log("Connected to database");
    })
} catch (e) {
    error(e);
}
