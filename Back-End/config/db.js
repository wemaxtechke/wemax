import { prisma } from '../lib/prisma.js';

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ MySQL connected successfully (Prisma)');
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};
