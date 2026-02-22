import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
        },
        comment: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Update product rating when review is saved
reviewSchema.post('save', async function () {
    const Review = mongoose.model('Review');
    const Product = mongoose.model('Product');

    const reviews = await Review.find({ product: this.product });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(this.product, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewsCount: reviews.length,
    });
});

// Update product rating when review is deleted
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const Review = mongoose.model('Review');
        const Product = mongoose.model('Product');

        const reviews = await Review.find({ product: doc.product });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        await Product.findByIdAndUpdate(doc.product, {
            averageRating: Math.round(averageRating * 10) / 10,
            reviewsCount: reviews.length,
        });
    }
});

export default mongoose.model('Review', reviewSchema);
