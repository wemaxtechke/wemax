import mongoose from 'mongoose';

const flashSaleSettingsSchema = new mongoose.Schema(
    {
        hours: {
            type: Number,
            default: 1,
            min: 0,
            max: 23,
        },
        minutes: {
            type: Number,
            default: 45,
            min: 0,
            max: 59,
        },
        seconds: {
            type: Number,
            default: 30,
            min: 0,
            max: 59,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one document exists
flashSaleSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({ hours: 1, minutes: 45, seconds: 30, isActive: true });
    }
    return settings;
};

export default mongoose.model('FlashSaleSettings', flashSaleSettingsSchema);
