import { executeQuery } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatShippingRate } from '../lib/apiFormatters.js';

export const getShippingRates = async (req, res) => {
    try {
        const rates = await executeQuery('SELECT * FROM ShippingRate ORDER BY locationName ASC');
        res.json(rates.map(formatShippingRate));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPublicShippingRates = async (req, res) => {
    try {
        const rates = await executeQuery(`
            SELECT id, carrier, locationName, regionCode, price, isDefault, allowCashOnDelivery, createdAt, updatedAt
            FROM ShippingRate
            ORDER BY locationName ASC
        `);
        res.json(rates.map(formatShippingRate));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createShippingRate = async (req, res) => {
    try {
        if (req.body.isDefault) {
            await executeQuery('UPDATE ShippingRate SET isDefault = false');
        }

        const { carrier, locationName, regionCode, price, isDefault, allowCashOnDelivery } = req.body;
        const result = await executeQuery(
            `INSERT INTO ShippingRate (carrier, locationName, regionCode, price, isDefault, allowCashOnDelivery, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [carrier, locationName, regionCode || null, price, isDefault || false, allowCashOnDelivery !== false]
        );

        const rates = await executeQuery('SELECT * FROM ShippingRate WHERE id = ?', [result.insertId]);
        res.status(201).json(formatShippingRate(rates[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateShippingRate = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        const rates = await executeQuery('SELECT * FROM ShippingRate WHERE id = ?', [id]);
        if (rates.length === 0) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        if (req.body.isDefault) {
            await executeQuery('UPDATE ShippingRate SET isDefault = false WHERE id != ?', [id]);
        }

        const { carrier, locationName, regionCode, price, isDefault, allowCashOnDelivery } = req.body;
        await executeQuery(
            `UPDATE ShippingRate SET
                carrier = ?, locationName = ?, regionCode = ?, price = ?,
                isDefault = ?, allowCashOnDelivery = ?, updatedAt = NOW()
            WHERE id = ?`,
            [carrier, locationName, regionCode || null, price, isDefault || false, allowCashOnDelivery !== false, id]
        );

        const updatedRates = await executeQuery('SELECT * FROM ShippingRate WHERE id = ?', [id]);
        res.json(formatShippingRate(updatedRates[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteShippingRate = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        const rates = await executeQuery('SELECT * FROM ShippingRate WHERE id = ?', [id]);
        if (rates.length === 0) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        await executeQuery('DELETE FROM ShippingRate WHERE id = ?', [id]);
        res.json({ message: 'Shipping rate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
