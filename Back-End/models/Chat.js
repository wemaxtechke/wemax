import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        unreadForAdmin: {
            type: Number,
            default: 0,
        },
        unreadForUser: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Chat', chatSchema);
