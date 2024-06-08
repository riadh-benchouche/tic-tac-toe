import Room from "../models/Room";
import codeRoom from "../utils/codeRoom";

export const createRoom = async (req, res) => {
    const userId = req.body.user.userId;
    const roomCode = codeRoom(6);

    try {
        const newRoom = new Room({
            roomCode,
            players: [userId],
            activePlayer: userId,
            winner: null,
            isFinished: false,
        });

        const room = await newRoom.save();
        res.status(201).json({room});
    } catch (error) {
        res.status(500).json({error: `An error occurred while creating a room: ${error.message}`});
    }
};

export const joinRoom = async (req, res) => {
    const {roomId} = req.params;
    const userId = req.body.user.userId;
    try {
        const room = await Room.findOne({roomCode: roomId}).populate("players");

        if (!room) {
            return res.status(404).json({error: "Room not found"});
        }

        if (room.players.some(player => player.equals(userId))) {
            return res.status(400).json({error: "You are already in this room"});
        }

        if (room.players.length >= 2) {
            return res.status(400).json({error: "This room is full"});
        }

        room.players.push(userId);
        await room.save();

        res.json({room});
    } catch (error) {
        res.status(500).json({error: `An error occurred while joining a room: ${error.message}`});
    }
};

export const exitRoom = async (req, res) => {
    const {roomId} = req.params;
    const userId = req.user._id;

    try {
        const room = await Room.findOne({roomId});

        if (!room) {
            return res.status(404).json({error: "Room not found"});
        }

        const playerIndex = room.players.findIndex(player => player.equals(userId));

        if (playerIndex === -1) {
            return res.status(400).json({error: "You are not in this room"});
        }

        room.players.splice(playerIndex, 1);
        await room.save();

        res.json({room});
    } catch (error) {
        res.status(500).json({error: `An error occurred while leaving a room: ${error.message}`});
    }
};

export const getCurrentRoom = async (req, res) => {
    const roomCode = req.params.roomCode;

    try {
        const room = await Room.findOne({roomCode}).populate("players");
        if (!room) {
            return res.status(404).json({error: "Room not found"});
        }

        res.json({room});
    } catch (error) {
        res.status(500).json({error: `An error occurred while getting the current room: ${error.message}`});
    }
}
