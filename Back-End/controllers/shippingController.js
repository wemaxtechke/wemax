import { prisma } from '../lib/prisma.js';
import { parseIntId } from '../lib/parseId.js';
import { formatShippingRate } from '../lib/apiFormatters.js';

export const getShippingRates = async (req, res) => {
    try {
        const rates = await prisma.shippingRate.findMany({ orderBy: { locationName: 'asc' } });
        res.json(rates.map(formatShippingRate));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPublicShippingRates = async (req, res) => {
    try {
        const rates = await prisma.shippingRate.findMany({
            select: {
                id: true,
                carrier: true,
                locationName: true,
                regionCode: true,
                price: true,
                isDefault: true,
                allowCashOnDelivery: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { locationName: 'asc' },
        });
        res.json(rates.map(formatShippingRate));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createShippingRate = async (req, res) => {
    try {
        if (req.body.isDefault) {
            await prisma.shippingRate.updateMany({ data: { isDefault: false } });
        }

        const rate = await prisma.shippingRate.create({ data: req.body });
        res.status(201).json(formatShippingRate(rate));
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

        const rate = await prisma.shippingRate.findUnique({ where: { id } });
        if (!rate) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        if (req.body.isDefault) {
            await prisma.shippingRate.updateMany({
                where: { id: { not: id } },
                data: { isDefault: false },
            });
        }

        const updatedRate = await prisma.shippingRate.update({
            where: { id },
            data: req.body,
        });

        res.json(formatShippingRate(updatedRate));
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

        const rate = await prisma.shippingRate.findUnique({ where: { id } });
        if (!rate) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        await prisma.shippingRate.delete({ where: { id } });
        res.json({ message: 'Shipping rate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
