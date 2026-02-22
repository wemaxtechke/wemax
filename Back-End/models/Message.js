import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['admin', 'customer'],
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        attachments: [
            {
                url: String,
                publicId: String,
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Update chat's lastMessageAt and unread counts
messageSchema.post('save', async function () {
    const Chat = mongoose.model('Chat');
    const chat = await Chat.findById(this.chat);

    if (chat) {
        chat.lastMessageAt = this.createdAt;
        if (this.senderRole === 'customer') {
            chat.unreadForAdmin = (chat.unreadForAdmin || 0) + 1;
        } else {
            chat.unreadForUser = (chat.unreadForUser || 0) + 1;
        }
        await chat.save();
    }
});

export default mongoose.model('Message', messageSchema);
