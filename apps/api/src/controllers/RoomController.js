import Room from "../models/Room";
import User from "../models/User";
import generateString from "../utils/generateString";

export const createRoom = async (req, res) => {
    try {
        const roomId = generateString(6);
        const userId = req.body.user.userId;
        const room = await Room.create({
            roomId,
            players: [userId],
            activePlayer: userId,
            winner: null,
            gameOver: false,
        });

        res.status(201).json({room});
    } catch (error) {
        res.status(500).json({
            error: `An error occurred while creating a room: ${error}`,
        });
    }
}

export const joinRoom = async (req, res) => {
    try {
        const {roomId} = req.params;
        const userId = req.body.user.userId;

        const room = await Room.findOne({roomId});

        if (!room) {
            return res.sendStatus(404);
        }

        if (room.players.includes(userId)) {
            return res.status(400).json({
                error: "You are already in this room",
            });
        }

        if (room.players.length >= 2) {
            return res.status(400).json({
                error: "This room is full",
            });
        }

        room.players.push(userId);

        await room.save();

        res.json({room}).populate("players");
    } catch (error) {
        res.status(500).json({
            error: `An error occurred while joining a room: ${error}`,
        });
    }
}

export const leaveRoom = async (req, res) => {
    try {
        const {roomId} = req.params;
        const userId = req.user._id;

        const room = await Room.findOne({roomId});
        if (!room) {
            return res.sendStatus(404);
        }

        const index = room.players.indexOf(userId);
        if (index === -1) {
            return res.sendStatus(400);
        }
        room.players.splice(index, 1);
        await room.save();
        res.json({room});
    } catch (error) {
        res.status(500).json({
            error: `An error occurred while leaving a room: ${error}`,
        });
    }
}
