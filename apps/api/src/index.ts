import {log} from "@repo/logger";
import {error} from "@repo/logger";
// @ts-ignore
import Message from "./models/Message.js";
// @ts-ignore
import Room from "./models/Room.js";
import {Server} from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
// @ts-ignore
import app from "./server.js";
import http from "http";

dotenv.config()
const port = process.env.PORT || 3000;
const dbUri = process.env.DB_URI || "";
app.set("port", port);

const server = http.createServer(app);
const io = new Server(9005, {
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
    socket.on("joinChat", (user) => {
        usersChat.push({id: socket.id, user});
        io.emit("joinChat", usersChat);
    });

    socket.on("sendMessage", async (message) => {
        try {
            const {sender, isInRoom, content, roomCode} = message;
            const newMessage = new Message({
                roomCode,
                sender,
                isInRoom,
                content
            });
            const savedMessage = await newMessage.save();

            const populatedMessage = await Message.findById(
                savedMessage._id
            ).populate("sender", "username");

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

    socket.on("restartGame", async ({roomCode}) => {
        try {
            const room = await Room.findOne({roomCode}).populate("players", "username");

            if (!room) {
                console.error("Room not found");
                return;
            }
            room.board = [
                ["", "", ""],
                ["", "", ""],
                ["", "", ""]
            ];

            room.activePlayer = room.players[0]._id;
            await room.save();
            io.emit("restartGame", {room});
        } catch (err) {
            console.error(err);
        }
    })

    function checkWinner(board) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
    
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                console.log(`Winner found: ${board[a]}`);
                return board[a]; // Return the winner (X or O)
            }
        }

        return null;
    }

    socket.on("playerPlayed", async ({roomCode, userId, row, col}) => {
        try {
            const room = await Room.findOne({roomCode}).populate("players", "username");
            if (!room) {
                console.error("Room not found");
                return;
            }

            if (room.activePlayer.toString() !== userId) {
                console.error("Not the active player");
                return;
            }

            if (room.board[row][col] !== "") {
                console.error("Cell already occupied");
                return;
            }

            if (userId === room.players[0]._id.toString()) {
                room.board[row][col] = "X";
                room.activePlayer = room.players[1]._id;
            } else if (userId === room.players[1]._id.toString()) {
                room.board[row][col] = "O";
                room.activePlayer = room.players[0]._id;
            } else {
                console.error("User not part of the game");
                return;
            }

            const board = room.board.flat();
            const winnerSymbol = checkWinner(board);

            if (winnerSymbol) {
                room.isFinished = true;
                room.winner = (winnerSymbol === "X") ? room.players[0]._id : room.players[1]._id;
            }
    
            await room.save();
    
            if (room.isFinished) {
                io.emit("gameFinished", { roomCode, winner: room.winner });
            }
            io.emit("playerPlayed", {room});
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
