import User from '../models/User.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json(user.wishlist || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.wishlist) {
            user.wishlist = [];
        }

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        user.wishlist.push(productId);
        await user.save();

        const populatedUser = await User.findById(user._id).populate('wishlist');
        res.json(populatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(
            id => id.toString() !== productId
        );
        await user.save();

        const populatedUser = await User.findById(user._id).populate('wishlist');
        res.json(populatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
