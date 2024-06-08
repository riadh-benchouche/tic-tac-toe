import Message from "../models/Message";

export const getChatMessages = async (req, res) => {
    try {
        const messages = await Message.find({isInRoom: false})
            .populate("sender", "username");

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({message: `An error occurred while retrieving chat messages: ${error.message}`});
    }
};

export const getRoomMessages = async (req, res) => {
    const {roomId} = req.params;

    try {
        const messages = await Message.find({roomCode: roomId})
            .populate("sender", "username");

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({message: `An error occurred while retrieving room messages: ${error.message}`});
    }
};

export const createMessage = async (req, res) => {
    const {roomCode, isInRoom, content} = req.body;
    const sender = req.body.user.userId;

    try {
        const newMessage = new Message({
            roomCode,
            isInRoom,
            sender,
            content,
        });

        const message = await newMessage.save();
        res.status(201).json({message});
    } catch (error) {
        res.status(500).json({message: `An error occurred while creating a message: ${error.message}`});
    }
};

export const updateMessage = async (req, res) => {
    const {messageId} = req.params;
    const {content} = req.body;

    try {
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
        res.status(500).json({message: `An error occurred while updating the message: ${error.message}`});
    }
};

export const deleteMessage = async (req, res) => {
    const {messageId} = req.params;

    try {
        const message = await Message.findByIdAndDelete(messageId);

        if (!message) {
            return res.status(404).json({message: "Message not found"});
        }

        res.status(204).send("Message deleted successfully");
    } catch (error) {
        res.status(500).json({message: `An error occurred while deleting the message: ${error.message}`});
    }
};
