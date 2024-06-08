import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
        roomCode: {
            type: String,
            required: true
        },
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        activePlayer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isFinished: {
            type: Boolean,
            default: false,
        },
        board: {
            type: [[String]],
            default: [
                ['', '', ''],
                ['', '', ''],
                ['', '', ''],
            ],
        },
    },
    {
        timestamps: true,

    }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;