import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
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
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        shippingAddress: {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            region: {
                type: String,
                required: true,
            },
            addressLine: {
                type: String,
                required: true,
            },
        },
        shippingLocation: {
            type: String,
            required: true,
        },
        shippingCarrier: {
            type: String,
            enum: ['G4S', 'Parcel Grid', 'Fargo wells', 'Shuttles and bus services'],
        },
        shippingCost: {
            type: Number,
            required: true,
            default: 0,
        },
        subtotal: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        payment: {
            method: {
                type: String,
                default: 'bank',
            },
            paybillNumber: {
                type: String,
            },
            accountNumber: {
                type: String,
            },
            proofImage: {
                url: String,
                publicId: String,
            },
            paidAt: {
                type: Date,
            },
            status: {
                type: String,
                enum: ['Pending', 'Paid'],
                default: 'Pending',
            },
        },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Order', orderSchema);
