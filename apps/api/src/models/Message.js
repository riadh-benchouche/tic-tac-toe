import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: false,
        },
        isInRoom: {
            type: Boolean,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true,

    }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;