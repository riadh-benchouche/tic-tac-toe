import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        token: {
            type: String,
        },
        color: {
            type: String,
            default: "#3f51b5",
        },
        confirmed: {
            type: Boolean,
        }
    },
    {
        timestamps: true,

    }
);

const User = mongoose.model("User", userSchema);

export default User;