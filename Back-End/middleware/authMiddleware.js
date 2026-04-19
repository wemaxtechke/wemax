import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { formatUserPublic } from '../lib/apiFormatters.js';

export const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = Number(decoded.userId);
        if (!Number.isInteger(userId) || userId < 1) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid or inactive user' });
        }

        req.user = formatUserPublic(user);
        req.user.id = user.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const requireAdmin = async (req, res, next) => {
    try {
        await requireAuth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        return res.status(401).json({ message: 'Authentication required' });
    }
};
