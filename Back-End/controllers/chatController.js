import { executeQuery } from '../lib/mysql.js';
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
            const chats = await executeQuery(`
                SELECT c.*, 
                       u.id as userId, u.name as userName, u.email as userEmail,
                       (SELECT COUNT(*) FROM Message WHERE chatId = c.id) as messageCount,
                       (SELECT MAX(createdAt) FROM Message WHERE chatId = c.id) as lastMessageAt
                FROM Chat c
                LEFT JOIN User u ON c.userId = u.id
                ORDER BY c.lastMessageAt DESC
            `);
            res.json(chats.map((c) => formatChat(c)));
        } else {
            const chats = await executeQuery(`
                SELECT c.*, 
                       u.id as userId, u.name as userName, u.email as userEmail,
                       (SELECT COUNT(*) FROM Message WHERE chatId = c.id) as messageCount,
                       (SELECT MAX(createdAt) FROM Message WHERE chatId = c.id) as lastMessageAt
                FROM Chat c
                LEFT JOIN User u ON c.userId = u.id
                WHERE c.userId = ?
                ORDER BY c.lastMessageAt DESC
                LIMIT 1
            `, [req.user.id]);
            
            res.json(chats.length > 0 ? [formatChat(chats[0])] : []);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyChat = async (req, res) => {
    try {
        let chat = await executeQuery('SELECT * FROM Chat WHERE userId = ?', [req.user.id]);

        if (chat.length === 0) {
            // Create new chat if none exists
            const result = await executeQuery(
                'INSERT INTO Chat (userId, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
                [req.user.id]
            );
            const newChats = await executeQuery('SELECT * FROM Chat WHERE id = ?', [result.insertId]);
            chat = newChats[0];
        } else {
            chat = chat[0];
        }

        // Get populated chat with user details
        const populatedChats = await executeQuery(`
            SELECT c.*, 
                   u.id as userId, u.name as userName, u.email as userEmail,
                   (SELECT COUNT(*) FROM Message WHERE chatId = c.id) as messageCount,
                   (SELECT MAX(createdAt) FROM Message WHERE chatId = c.id) as lastMessageAt
            FROM Chat c
            LEFT JOIN User u ON c.userId = u.id
            WHERE c.id = ?
        `, [chat.id]);

        res.json(formatChat(populatedChats[0]));
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

        // Check if chat exists and get user access
        const chats = await executeQuery(`
            SELECT c.*, u.id as userId, u.name as userName, u.email as userEmail
            FROM Chat c
            LEFT JOIN User u ON c.userId = u.id
            WHERE c.id = ?
        `, [chatId]);

        if (chats.length === 0) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const chat = chats[0];

        if (req.user.role === 'customer' && chat.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get messages with sender details
        const messages = await executeQuery(`
            SELECT m.*, 
                   s.id as senderId, s.name as senderName, s.email as senderEmail
            FROM Message m
            LEFT JOIN User s ON m.senderId = s.id
            WHERE m.chatId = ?
            ORDER BY m.createdAt ASC
        `, [chatId]);

        // Mark chat as read
        if (req.user.role === 'admin') {
            await executeQuery(
                'UPDATE Chat SET unreadForAdmin = 0 WHERE id = ?',
                [chatId]
            );
        } else {
            await executeQuery(
                'UPDATE Chat SET unreadForUser = 0 WHERE id = ?',
                [chatId]
            );
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

        let chat = null;
        if (chatId) {
            const chats = await executeQuery('SELECT * FROM Chat WHERE id = ?', [chatId]);
            if (chats.length === 0) {
                return res.status(404).json({ message: 'Chat not found' });
            }
            chat = chats[0];
        }

        if (!chat) {
            if (req.user.role === 'customer') {
                // Create new chat for customer
                const result = await executeQuery(
                    'INSERT INTO Chat (userId, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
                    [req.user.id]
                );
                const newChats = await executeQuery('SELECT * FROM Chat WHERE id = ?', [result.insertId]);
                chat = newChats[0];
            } else {
                return res.status(404).json({ message: 'Chat not found' });
            }
        }

        if (req.user.role === 'customer' && chat.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Insert message
        const messageResult = await executeQuery(
            'INSERT INTO Message (chatId, senderRole, senderId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [chat.id, req.user.role, req.user.id, content]
        );

        // Update chat last message timestamp
        await bumpChatAfterMessage(chat.id, req.user.role, new Date());

        // Get populated message
        const populatedMessages = await executeQuery(`
            SELECT m.*, 
                   s.id as senderId, s.name as senderName, s.email as senderEmail
            FROM Message m
            LEFT JOIN User s ON m.senderId = s.id
            WHERE m.id = ?
        `, [MessageResult.insertId]);

        res.status(201).json(formatMessage(populatedMessages[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
