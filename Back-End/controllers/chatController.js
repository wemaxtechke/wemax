import { prisma } from '../lib/prisma.js';
import { parseIntId } from '../lib/parseId.js';
import { formatChat, formatMessage } from '../lib/apiFormatters.js';
import { bumpChatAfterMessage } from '../services/chatThread.js';

const chatInclude = {
    user: { select: { id: true, name: true, email: true } },
};

const messageInclude = {
    sender: { select: { id: true, name: true } },
    attachments: true,
};

export const getChats = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const chats = await prisma.chat.findMany({
                include: chatInclude,
                orderBy: { lastMessageAt: 'desc' },
            });
            res.json(chats.map((c) => formatChat(c)));
        } else {
            const chat = await prisma.chat.findUnique({
                where: { userId: req.user.id },
                include: chatInclude,
            });
            res.json(chat ? [formatChat(chat)] : []);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyChat = async (req, res) => {
    try {
        let chat = await prisma.chat.findUnique({
            where: { userId: req.user.id },
        });

        if (!chat) {
            chat = await prisma.chat.create({
                data: { userId: req.user.id },
            });
        }

        const populatedChat = await prisma.chat.findUnique({
            where: { id: chat.id },
            include: chatInclude,
        });
        res.json(formatChat(populatedChat));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const chatId = parseIntId(req.params.chatId);
        if (!chatId) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const chat = await prisma.chat.findUnique({ where: { id: chatId } });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (req.user.role === 'customer' && chat.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await prisma.message.findMany({
            where: { chatId },
            include: messageInclude,
            orderBy: { createdAt: 'asc' },
        });

        if (req.user.role === 'admin') {
            await prisma.chat.update({
                where: { id: chatId },
                data: { unreadForAdmin: 0 },
            });
        } else {
            await prisma.chat.update({
                where: { id: chatId },
                data: { unreadForUser: 0 },
            });
        }

        res.json(messages.map((m) => formatMessage(m)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        let { chatId, content } = req.body;
        chatId = chatId != null ? parseIntId(String(chatId)) : null;

        let chat = chatId ? await prisma.chat.findUnique({ where: { id: chatId } }) : null;

        if (!chat) {
            if (req.user.role === 'customer') {
                chat = await prisma.chat.create({
                    data: { userId: req.user.id },
                });
            } else {
                return res.status(404).json({ message: 'Chat not found' });
            }
        }

        if (req.user.role === 'customer' && chat.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const message = await prisma.message.create({
            data: {
                chatId: chat.id,
                senderRole: req.user.role,
                senderId: req.user.id,
                content,
            },
            include: messageInclude,
        });

        await bumpChatAfterMessage(chat.id, req.user.role, message.createdAt);

        const populatedMessage = await prisma.message.findUnique({
            where: { id: message.id },
            include: messageInclude,
        });

        res.status(201).json(formatMessage(populatedMessage));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
