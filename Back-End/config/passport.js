import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma.js';

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
                    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

                    if (user) {
                        return done(null, user);
                    }

                    const email = profile.emails[0].value.toLowerCase().trim();
                    user = await prisma.user.findUnique({ where: { email } });

                    if (user) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { googleId: profile.id },
                        });
                        return done(null, user);
                    }

                    user = await prisma.user.create({
                        data: {
                            name: profile.displayName,
                            email,
                            googleId: profile.id,
                            role: 'customer',
                            isActive: true,
                            phone: email,
                        },
                    });

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
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
