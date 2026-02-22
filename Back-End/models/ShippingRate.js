import mongoose from 'mongoose';

const shippingRateSchema = new mongoose.Schema(
    {
        carrier: {
            type: String,
            enum: ['G4S', 'Parcel Grid', 'Fargo wells', 'Shuttles and bus services'],
            required: true,
        },
        locationName: {
            type: String,
            required: true,
            trim: true,
        },
        regionCode: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        allowCashOnDelivery: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('ShippingRate', shippingRateSchema);
