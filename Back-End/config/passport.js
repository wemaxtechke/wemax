import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { executeQuery } from '../lib/mysql.js';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const users = await executeQuery('SELECT * FROM User WHERE googleId = ?', [profile.id]);
                    let user = users.length > 0 ? users[0] : null;

                    if (user) {
                        return done(null, user);
                    }

                    const email = profile.emails[0].value.toLowerCase().trim();
                    const existingUsers = await executeQuery('SELECT * FROM User WHERE email = ?', [email]);
                    user = existingUsers.length > 0 ? existingUsers[0] : null;

                    if (user) {
                        await executeQuery('UPDATE User SET googleId = ? WHERE id = ?', [profile.id, user.id]);
                        user.googleId = profile.id;
                        return done(null, user);
                    }

                    const result = await executeQuery(
                        'INSERT INTO User (name, email, googleId, role, isActive, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                        [profile.displayName, email, profile.id, 'customer', true, email]
                    );

                    const newUsers = await executeQuery('SELECT * FROM User WHERE id = ?', [result.insertId]);
                    user = newUsers[0];

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const users = await executeQuery('SELECT * FROM User WHERE id = ?', [id]);
        const user = users.length > 0 ? users[0] : null;
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
