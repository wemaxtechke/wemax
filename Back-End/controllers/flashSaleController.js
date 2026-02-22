import FlashSaleSettings from '../models/FlashSaleSettings.js';

export const getFlashSaleSettings = async (req, res) => {
    try {
        const settings = await FlashSaleSettings.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Public: get remaining time based on last update (admin "reset")
export const getFlashSaleRemaining = async (req, res) => {
    try {
        const settings = await FlashSaleSettings.getSettings();

        const durationSeconds =
            (settings.hours || 0) * 3600 +
            (settings.minutes || 0) * 60 +
            (settings.seconds || 0);

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

        let settings = await FlashSaleSettings.findOne();
        if (!settings) {
            settings = await FlashSaleSettings.create({
                hours: hours || 1,
                minutes: minutes || 45,
                seconds: seconds || 30,
                isActive: isActive !== undefined ? isActive : true,
            });
        } else {
            if (hours !== undefined) settings.hours = Math.max(0, Math.min(23, Number(hours)));
            if (minutes !== undefined) settings.minutes = Math.max(0, Math.min(59, Number(minutes)));
            if (seconds !== undefined) settings.seconds = Math.max(0, Math.min(59, Number(seconds)));
            if (isActive !== undefined) settings.isActive = Boolean(isActive);
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
