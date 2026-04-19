import { prisma } from '../lib/prisma.js';
import { formatFlashSale } from '../lib/apiFormatters.js';

async function getOrCreateSettings() {
    let settings = await prisma.flashSaleSettings.findFirst();
    if (!settings) {
        settings = await prisma.flashSaleSettings.create({
            data: { hours: 1, minutes: 45, seconds: 30, isActive: true },
        });
    }
    return settings;
}

export const getFlashSaleSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(formatFlashSale(settings));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFlashSaleRemaining = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();

        const durationSeconds =
            (settings.hours || 0) * 3600 + (settings.minutes || 0) * 60 + (settings.seconds || 0);

        let remainingSeconds = 0;

        if (settings.isActive && durationSeconds > 0) {
            const updatedAt = settings.updatedAt ? settings.updatedAt.getTime() : Date.now();
            const elapsedSeconds = Math.floor((Date.now() - updatedAt) / 1000);
            remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
        }

        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        res.json({
            isActive: settings.isActive,
            hours,
            minutes,
            seconds,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateFlashSaleSettings = async (req, res) => {
    try {
        const { hours, minutes, seconds, isActive } = req.body;

        let settings = await prisma.flashSaleSettings.findFirst();
        if (!settings) {
            settings = await prisma.flashSaleSettings.create({
                data: {
                    hours: hours != null ? Math.max(0, Math.min(23, Number(hours))) : 1,
                    minutes: minutes != null ? Math.max(0, Math.min(59, Number(minutes))) : 45,
                    seconds: seconds != null ? Math.max(0, Math.min(59, Number(seconds))) : 30,
                    isActive: isActive !== undefined ? Boolean(isActive) : true,
                },
            });
        } else {
            const data = {};
            if (hours !== undefined) data.hours = Math.max(0, Math.min(23, Number(hours)));
            if (minutes !== undefined) data.minutes = Math.max(0, Math.min(59, Number(minutes)));
            if (seconds !== undefined) data.seconds = Math.max(0, Math.min(59, Number(seconds)));
            if (isActive !== undefined) data.isActive = Boolean(isActive);
            settings = await prisma.flashSaleSettings.update({
                where: { id: settings.id },
                data,
            });
        }

        res.json(formatFlashSale(settings));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
