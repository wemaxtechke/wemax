import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
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
        category: {
            type: String,
            required: true,
            enum: ['Electronics', 'Furniture', 'Instruments', 'Kitchen Appliances'],
        },
        subCategory: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            trim: true,
        },
        newPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        oldPrice: {
            type: Number,
            min: 0,
        },
        freeShipping: {
            type: Boolean,
            default: false,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        locationShipping: {
            type: Map,
            of: Number,
            default: {},
        },
        images: [
            {
                url: String,
                publicId: String,
            },
        ],
        specifications: [
            {
                key: String,
                value: String,
            },
        ],
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewsCount: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isFlashDeal: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdByEmail: {
            type: String,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
    if (!this.oldPrice || this.oldPrice <= this.newPrice) return 0;
    return Math.round(((this.oldPrice - this.newPrice) / this.oldPrice) * 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
