import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../lib/mysql.js';

export const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = Number(decoded.userId);
            if (!Number.isInteger(userId) || userId < 1) {
                return next(new Error('Authentication error'));
            }

            const users = await executeQuery('SELECT * FROM User WHERE id = ?', [userId]);
            const user = users.length > 0 ? users[0] : null;

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = String(user.id);
            socket.userRole = user.role;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        socket.join(`user_${socket.userId}`);

        if (socket.userRole === 'admin') {
            socket.join('admin');
        }

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};
