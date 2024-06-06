import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
        roomId: {
            type: String,
            required: true,
            unique: true,
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
        board: {
            type: [[String]],
            default: [
                ["", "", ""],
                ["", "", ""],
                ["", "", ""],
            ],
        },
        gameOver: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,

    }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;