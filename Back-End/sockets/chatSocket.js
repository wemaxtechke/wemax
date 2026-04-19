import { prisma } from '../lib/prisma.js';
import { formatMessage } from '../lib/apiFormatters.js';
import { bumpChatAfterMessage } from '../services/chatThread.js';
import { parseIntId } from '../lib/parseId.js';

const messageInclude = {
    sender: { select: { id: true, name: true } },
    attachments: true,
};

export const setupChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        socket.join(`user_${socket.userId}`);

        if (socket.userRole === 'admin') {
            socket.join('admin');
        }

        socket.on('message:send', async (data) => {
            try {
                let { chatId, content } = data;
                const chatIdNum = chatId != null ? parseIntId(String(chatId)) : null;

                let chat = chatIdNum ? await prisma.chat.findUnique({ where: { id: chatIdNum } }) : null;

                if (!chat) {
                    if (socket.userRole === 'customer') {
                        const uid = parseIntId(socket.userId);
                        chat = await prisma.chat.create({
                            data: { userId: uid },
                        });
                    } else {
                        return socket.emit('error', { message: 'Chat not found' });
                    }
                }

                if (socket.userRole === 'customer' && String(chat.userId) !== String(socket.userId)) {
                    return socket.emit('error', { message: 'Access denied' });
                }

                const senderId = parseIntId(socket.userId);
                const message = await prisma.message.create({
                    data: {
                        chatId: chat.id,
                        senderRole: socket.userRole,
                        senderId,
                        content,
                    },
                });

                await bumpChatAfterMessage(chat.id, socket.userRole, message.createdAt);

                const populatedMessage = await prisma.message.findUnique({
                    where: { id: message.id },
                    include: messageInclude,
                });

                const payload = formatMessage(populatedMessage);

                if (socket.userRole === 'customer') {
                    io.to('admin').emit('message:new', payload);
                }

                if (socket.userRole === 'admin') {
                    io.to(`user_${chat.userId}`).emit('message:new', payload);
                }

                socket.emit('message:sent', payload);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        socket.on('typing:start', (data) => {
            const { chatId } = data;
            if (socket.userRole === 'customer') {
                io.to('admin').emit('typing:start', { chatId, userId: socket.userId });
            } else {
                prisma.chat.findUnique({ where: { id: parseIntId(String(chatId)) } }).then((chat) => {
                    if (chat) {
                        io.to(`user_${chat.userId}`).emit('typing:start', { chatId, userId: socket.userId });
                    }
                });
            }
        });

        socket.on('typing:stop', (data) => {
            const { chatId } = data;
            if (socket.userRole === 'customer') {
                io.to('admin').emit('typing:stop', { chatId });
            } else {
                prisma.chat.findUnique({ where: { id: parseIntId(String(chatId)) } }).then((chat) => {
                    if (chat) {
                        io.to(`user_${chat.userId}`).emit('typing:stop', { chatId });
                    }
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
};
