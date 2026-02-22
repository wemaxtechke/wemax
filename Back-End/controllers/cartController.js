import User from '../models/User.js';
import Product from '../models/Product.js';
import Package from '../models/Package.js';

export const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.items.product').populate('cart.packages.package');
        res.json(user.cart || { items: [], packages: [], subtotal: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, packageId, quantity = 1 } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.cart) {
            user.cart = { items: [], packages: [], subtotal: 0 };
        }

        if (productId) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const existingItem = user.cart.items.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += Number(quantity);
            } else {
                user.cart.items.push({
                    product: productId,
                    quantity: Number(quantity),
                    price: product.newPrice,
                });
            }
        }

        if (packageId) {
            const packageDoc = await Package.findById(packageId);
            if (!packageDoc) {
                return res.status(404).json({ message: 'Package not found' });
            }

            const existingPackage = user.cart.packages.find(
                pkg => pkg.package.toString() === packageId
            );

            if (existingPackage) {
                existingPackage.quantity += Number(quantity);
            } else {
                user.cart.packages.push({
                    package: packageId,
                    quantity: Number(quantity),
                    price: packageDoc.totalPrice,
                });
            }
        }

        // Calculate subtotal
        let subtotal = 0;
        for (const item of user.cart.items) {
            subtotal += item.price * item.quantity;
        }
        for (const pkg of user.cart.packages) {
            subtotal += pkg.price * pkg.quantity;
        }
        user.cart.subtotal = subtotal;

        await user.save();
        const populatedUser = await User.findById(user._id)
            .populate('cart.items.product')
            .populate('cart.packages.package');

        res.json(populatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity, type } = req.body; // type: 'product' or 'package'
        const user = await User.findById(req.user._id);

        if (type === 'product') {
            const item = user.cart.items.id(itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            item.quantity = Number(quantity);
        } else if (type === 'package') {
            const pkg = user.cart.packages.id(itemId);
            if (!pkg) {
                return res.status(404).json({ message: 'Package not found' });
            }
            pkg.quantity = Number(quantity);
        }

        // Recalculate subtotal
        let subtotal = 0;
        for (const item of user.cart.items) {
            subtotal += item.price * item.quantity;
        }
        for (const pkg of user.cart.packages) {
            subtotal += pkg.price * pkg.quantity;
        }
        user.cart.subtotal = subtotal;

        await user.save();
        const populatedUser = await User.findById(user._id)
            .populate('cart.items.product')
            .populate('cart.packages.package');

        res.json(populatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { type } = req.body; // type: 'product' or 'package'
        const user = await User.findById(req.user._id);

        if (type === 'product') {
            user.cart.items = user.cart.items.filter(
                item => item._id.toString() !== itemId
            );
        } else if (type === 'package') {
            user.cart.packages = user.cart.packages.filter(
                pkg => pkg._id.toString() !== itemId
            );
        }

        // Recalculate subtotal
        let subtotal = 0;
        for (const item of user.cart.items) {
            subtotal += item.price * item.quantity;
        }
        for (const pkg of user.cart.packages) {
            subtotal += pkg.price * pkg.quantity;
        }
        user.cart.subtotal = subtotal;

        await user.save();
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = { items: [], packages: [], subtotal: 0 };
        await user.save();
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
