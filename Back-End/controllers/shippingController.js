import ShippingRate from '../models/ShippingRate.js';

export const getShippingRates = async (req, res) => {
    try {
        const rates = await ShippingRate.find().sort('locationName');
        res.json(rates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPublicShippingRates = async (req, res) => {
    try {
        const rates = await ShippingRate.find()
            .select('carrier locationName regionCode price isDefault allowCashOnDelivery')
            .sort('locationName');
        res.json(rates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createShippingRate = async (req, res) => {
    try {
        // If this is set as default, unset other defaults
        if (req.body.isDefault) {
            await ShippingRate.updateMany({}, { $set: { isDefault: false } });
        }

        const rate = await ShippingRate.create(req.body);
        res.status(201).json(rate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateShippingRate = async (req, res) => {
    try {
        const rate = await ShippingRate.findById(req.params.id);

        if (!rate) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        // If this is set as default, unset other defaults
        if (req.body.isDefault) {
            await ShippingRate.updateMany({ _id: { $ne: req.params.id } }, { $set: { isDefault: false } });
        }

        const updatedRate = await ShippingRate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedRate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteShippingRate = async (req, res) => {
    try {
        const rate = await ShippingRate.findById(req.params.id);

        if (!rate) {
            return res.status(404).json({ message: 'Shipping rate not found' });
        }

        await ShippingRate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Shipping rate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
