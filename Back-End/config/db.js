import { mysqlPool } from '../lib/mysql.js';

export const connectDB = async () => {
    try {
        const connection = await mysqlPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('MySQL connected successfully (Ultra-Optimized with node-mysql2)');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};
