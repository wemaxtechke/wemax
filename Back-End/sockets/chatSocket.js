import { executeQuery } from '../lib/mysql.js';
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

                let chats = chatIdNum ? await executeQuery('SELECT * FROM Chat WHERE id = ?', [chatIdNum]) : null;
                let chat = chats && chats.length > 0 ? chats[0] : null;

                if (!chat) {
                    if (socket.userRole === 'customer') {
                        const uid = parseIntId(socket.userId);
                        const result = await executeQuery(
                            'INSERT INTO Chat (userId, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
                            [uid]
                        );
                        const newChats = await executeQuery('SELECT * FROM Chat WHERE id = ?', [result.insertId]);
                        chat = newChats[0];
                    } else {
                        return socket.emit('error', { message: 'Chat not found' });
                    }
                }

                if (socket.userRole === 'customer' && String(chat.userId) !== String(socket.userId)) {
                    return socket.emit('error', { message: 'Access denied' });
                }

                const senderId = parseIntId(socket.userId);
                const messageResult = await executeQuery(
                    'INSERT INTO Message (chatId, senderRole, senderId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
                    [chat.id, socket.userRole, senderId, content]
                );

                await bumpChatAfterMessage(chat.id, socket.userRole, new Date());

                const populatedMessages = await executeQuery(`
                    SELECT m.*, 
                           s.id as senderId, s.name as senderName, s.email as senderEmail
                    FROM Message m
                    LEFT JOIN User s ON m.senderId = s.id
                    WHERE m.id = ?
                `, [messageResult.insertId]);

                const payload = formatMessage(populatedMessages[0]);

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

        socket.on('typing:start', async (data) => {
            const { chatId } = data;
            if (socket.userRole === 'customer') {
                io.to('admin').emit('typing:start', { chatId, userId: socket.userId });
            } else {
                try {
                    const chats = await executeQuery('SELECT * FROM Chat WHERE id = ?', [parseIntId(String(chatId))]);
                    const chat = chats.length > 0 ? chats[0] : null;
                    if (chat) {
                        io.to(`user_${chat.userId}`).emit('typing:start', { chatId, userId: socket.userId });
                    }
                } catch (error) {
                    console.error('Typing start error:', error);
                }
            }
        });

        socket.on('typing:stop', async (data) => {
            const { chatId } = data;
            if (socket.userRole === 'customer') {
                io.to('admin').emit('typing:stop', { chatId });
            } else {
                try {
                    const chats = await executeQuery('SELECT * FROM Chat WHERE id = ?', [parseIntId(String(chatId))]);
                    const chat = chats.length > 0 ? chats[0] : null;
                    if (chat) {
                        io.to(`user_${chat.userId}`).emit('typing:stop', { chatId });
                    }
                } catch (error) {
                    console.error('Typing stop error:', error);
                }
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
};
