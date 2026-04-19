import { prisma } from '../lib/prisma.js';

export async function bumpChatAfterMessage(chatId, senderRole, at = new Date()) {
    const incAdmin = senderRole === 'customer' ? 1 : 0;
    const incUser = senderRole === 'admin' ? 1 : 0;
    await prisma.chat.update({
        where: { id: chatId },
        data: {
            lastMessageAt: at,
            unreadForAdmin: { increment: incAdmin },
            unreadForUser: { increment: incUser },
        },
    });
}
