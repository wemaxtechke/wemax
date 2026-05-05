import bcrypt from 'bcrypt';
import { executeQuery } from '../lib/mysql.js';
import { generateToken } from '../utils/generateToken.js';
import { formatUserPublic } from '../lib/apiFormatters.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUsers = await executeQuery(
            'SELECT * FROM User WHERE email = ?',
            [email.toLowerCase().trim()]
        );
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await executeQuery(
            `INSERT INTO User (name, email, passwordHash, phone, role, isActive, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, 'customer', true, NOW(), NOW())`,
            [name.trim(), email.toLowerCase().trim(), passwordHash, phone.trim()]
        );

        const users = await executeQuery('SELECT * FROM User WHERE id = ?', [result.insertId]);
        const user = users[0];

        const token = generateToken(user.id, user.role);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: 'Registration successful',
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const users = await executeQuery(
            'SELECT * FROM User WHERE email = ?',
            [email.toLowerCase().trim()]
        );
        const user = users.length > 0 ? users[0] : null;

        if (!user || !user.passwordHash) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is inactive' });
        }

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            message: 'Login successful',
            user: formatUserPublic(user),
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
    try {
        const users = await executeQuery('SELECT * FROM User WHERE id = ?', [req.user.id]);
        const user = users.length > 0 ? users[0] : null;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(formatUserPublic(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
