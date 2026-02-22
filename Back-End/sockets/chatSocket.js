import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const setupChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join user-specific room
        socket.join(`user_${socket.userId}`);

        // Admin joins admin room
        if (socket.userRole === 'admin') {
            socket.join('admin');
        }

        // Handle sending messages
        socket.on('message:send', async (data) => {
            try {
                const { chatId, content } = data;

                let chat = await Chat.findById(chatId);

                if (!chat) {
                    if (socket.userRole === 'customer') {
                        chat = await Chat.create({ user: socket.userId });
                    } else {
                        return socket.emit('error', { message: 'Chat not found' });
                    }
                }

                // Check access
                if (socket.userRole === 'customer' && chat.user.toString() !== socket.userId) {
                    return socket.emit('error', { message: 'Access denied' });
                }

                const message = await Message.create({
                    chat: chat._id,
                    senderRole: socket.userRole,
                    sender: socket.userId,
                    content,
                });

                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'name');

                // Emit to admin room if customer sent
                if (socket.userRole === 'customer') {
                    io.to('admin').emit('message:new', populatedMessage);
                }

                // Emit to specific user room
                if (socket.userRole === 'admin') {
                    io.to(`user_${chat.user}`).emit('message:new', populatedMessage);
                }

                // Also emit back to sender
                socket.emit('message:sent', populatedMessage);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Handle typing indicators
        socket.on('typing:start', (data) => {
            const { chatId } = data;
            if (socket.userRole === 'customer') {
                io.to('admin').emit('typing:start', { chatId, userId: socket.userId });
            } else {
                const chat = Chat.findById(chatId).then(chat => {
                    if (chat) {
                        io.to(`user_${chat.user}`).emit('typing:start', { chatId, userId: socket.userId });
                    }
                });
            }
        });

        socket.on('typing:stop', (data) => {
            const { chatId } = data;
            if (socket.userRole === 'customer') {
                io.to('admin').emit('typing:stop', { chatId });
            } else {
                const chat = Chat.findById(chatId).then(chat => {
                    if (chat) {
                        io.to(`user_${chat.user}`).emit('typing:stop', { chatId });
                    }
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
};
