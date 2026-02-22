import mongoose from 'mongoose';
import dns from 'node:dns';

// Network fixes to prevent ECONNREFUSED errors
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};
