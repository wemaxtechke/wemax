import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const getChats = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const chats = await Chat.find()
                .populate('user', 'name email')
                .sort('-lastMessageAt');
            res.json(chats);
        } else {
            const chat = await Chat.findOne({ user: req.user._id })
                .populate('user', 'name email');
            res.json(chat ? [chat] : []);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyChat = async (req, res) => {
    try {
        let chat = await Chat.findOne({ user: req.user._id });

        if (!chat) {
            chat = await Chat.create({ user: req.user._id });
        }

        const populatedChat = await Chat.findById(chat._id).populate('user', 'name email');
        res.json(populatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check access
        if (req.user.role === 'customer' && chat.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'name')
            .sort('createdAt');

        // Mark messages as read
        if (req.user.role === 'admin') {
            chat.unreadForAdmin = 0;
        } else {
            chat.unreadForUser = 0;
        }
        await chat.save();

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;

        let chat = await Chat.findById(chatId);

        if (!chat) {
            // For customers, create chat if it doesn't exist
            if (req.user.role === 'customer') {
                chat = await Chat.create({ user: req.user._id });
            } else {
                return res.status(404).json({ message: 'Chat not found' });
            }
        }

        // Check access
        if (req.user.role === 'customer' && chat.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const message = await Message.create({
            chat: chat._id,
            senderRole: req.user.role,
            sender: req.user._id,
            content,
        });

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
