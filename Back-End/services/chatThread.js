import { executeQuery } from '../lib/mysql.js';

export async function bumpChatAfterMessage(chatId, senderRole, at = new Date()) {
    const incAdmin = senderRole === 'customer' ? 1 : 0;
    const incUser = senderRole === 'admin' ? 1 : 0;
    await executeQuery(
        'UPDATE Chat SET lastMessageAt = ?, unreadForAdmin = unreadForAdmin + ?, unreadForUser = unreadForUser + ?, updatedAt = NOW() WHERE id = ?',
        [at, incAdmin, incUser, chatId]
    );
}
