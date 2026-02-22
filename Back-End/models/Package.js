import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        oldTotalPrice: {
            type: Number,
            min: 0,
        },
        freeShipping: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            trim: true,
        },
        tag: {
            type: String,
            trim: true,
        },
        images: [
            {
                url: String,
                publicId: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Virtual for discount percentage
packageSchema.virtual('discountPercent').get(function () {
    if (!this.oldTotalPrice || this.oldTotalPrice <= this.totalPrice) return 0;
    return Math.round(((this.oldTotalPrice - this.totalPrice) / this.oldTotalPrice) * 100);
});

packageSchema.set('toJSON', { virtuals: true });
packageSchema.set('toObject', { virtuals: true });

export default mongoose.model('Package', packageSchema);
