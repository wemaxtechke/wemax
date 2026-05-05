import { executeQuery } from '../lib/mysql.js';
import { formatFlashSale } from '../lib/apiFormatters.js';

async function getOrCreateSettings() {
    let settings = await executeQuery('SELECT * FROM FlashSaleSettings LIMIT 1');
    if (settings.length === 0) {
        await executeQuery(
            'INSERT INTO FlashSaleSettings (hours, minutes, seconds, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [1, 45, 30, true]
        );
        settings = await executeQuery('SELECT * FROM FlashSaleSettings LIMIT 1');
    }
    return settings[0];
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
            const updatedAt = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();
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

        let settings = await executeQuery('SELECT * FROM FlashSaleSettings LIMIT 1');
        if (settings.length === 0) {
            // Create new settings
            const validatedHours = hours != null ? Math.max(0, Math.min(23, Number(hours))) : 1;
            const validatedMinutes = minutes != null ? Math.max(0, Math.min(59, Number(minutes))) : 45;
            const validatedSeconds = seconds != null ? Math.max(0, Math.min(59, Number(seconds))) : 30;
            const validatedIsActive = isActive !== undefined ? Boolean(isActive) : true;

            await executeQuery(
                'INSERT INTO FlashSaleSettings (hours, minutes, seconds, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [validatedHours, validatedMinutes, validatedSeconds, validatedIsActive]
            );
        } else {
            // Update existing settings - build dynamic query to handle undefined values
            const updates = [];
            const values = [];
            
            if (hours !== undefined) {
                updates.push('hours = ?');
                values.push(Math.max(0, Math.min(23, Number(hours))));
            }
            if (minutes !== undefined) {
                updates.push('minutes = ?');
                values.push(Math.max(0, Math.min(59, Number(minutes))));
            }
            if (seconds !== undefined) {
                updates.push('seconds = ?');
                values.push(Math.max(0, Math.min(59, Number(seconds))));
            }
            if (isActive !== undefined) {
                updates.push('isActive = ?');
                values.push(Boolean(isActive) ? 1 : 0);
            }
            
            if (updates.length > 0) {
                updates.push('updatedAt = NOW()');
                values.push(settings[0].id);
                
                await executeQuery(
                    `UPDATE FlashSaleSettings SET ${updates.join(', ')} WHERE id = ?`,
                    values
                );
            }
        }

        // Get updated settings
        const updatedSettings = await executeQuery('SELECT * FROM FlashSaleSettings LIMIT 1');

        res.json(formatFlashSale(updatedSettings[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
