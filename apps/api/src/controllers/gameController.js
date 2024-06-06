import Room from "../models/Room";

export const play = async (req, res) => {
    try {
        const room = await Room.findOne({
            players: req.user.userId,
            gameOver: false,
        }).populate("players", "username color");
        if (!room) return res.status(404).json({error: "Room not found"});

        const {row, column} = req.body;
        if (room.activePlayer !== req.user.userId)
            return res.status(400).json({error: "It's not your turn"});

        if (room.board[row][column] !== "")
            return res.status(400).json({error: "Invalid move"});

        if (req.user.userId === room.players[0]) room.board[row][column] = "X";
        else room.board[row][column] = "O";
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getGamesHistory = async (req, res) => {
    try {
        const games = await Room.find({
            players: req.user.userId,
            gameOver: true,
        }).populate("players", "username color").sort({createdAt: -1});

        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}