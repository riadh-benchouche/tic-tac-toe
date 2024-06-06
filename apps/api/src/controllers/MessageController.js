import Message from "../models/Message";

export const getChatMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            isPrivate: false,
        }).populate("sender", "username");

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getRoomMessages = async (req, res) => {
    try {
        const {roomId} = req.params;
        const messages = await Message.find({
            roomId,
        }).populate("sender", "username");

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const createMessage = async (req, res) => {
    try {
        const {roomId, isPrivate, content} = req.body;
        const sender = req.body.user.userId;

        const message = new Message({
            roomId,
            isPrivate,
            sender,
            content,
        });

        await message.save();

        res.status(201).json({message});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const updateMessage = async (req, res) => {
    try {
        const {messageId} = req.params;
        const {content} = req.body;

        const message = await Message.findByIdAndUpdate(
            messageId,
            {content},
            {new: true}
        );
        if (!message) {
            return res.status(404).json({message: "Message not found"});
        }

        res.status(200).json({message});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const {messageId} = req.params;

        const message = await Message.findByIdAndDelete(messageId);

        if (!message) {
            return res.status(404).json({message: "Message not found"});
        }

        res.status(204).json('Message deleted successfully');
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
