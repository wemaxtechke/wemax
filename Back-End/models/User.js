import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: function () {
                return !this.googleId;
            },
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        googleId: {
            type: String,
            sparse: true,
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        cart: {
            items: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Product',
                    },
                    quantity: {
                        type: Number,
                        default: 1,
                    },
                    price: {
                        type: Number,
                    },
                },
            ],
            packages: [
                {
                    package: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Package',
                    },
                    quantity: {
                        type: Number,
                        default: 1,
                    },
                    price: {
                        type: Number,
                    },
                },
            ],
            subtotal: {
                type: Number,
                default: 0,
            },
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

userSchema.methods.comparePassword = async function (password) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('User', userSchema);
