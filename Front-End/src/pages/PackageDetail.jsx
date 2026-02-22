import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchPackageById } from '../redux/slices/packageSlice.js';
import { FaShoppingCart, FaBox, FaCheckCircle, FaStar } from 'react-icons/fa';
import { FaStarHalfStroke } from 'react-icons/fa6';
import wemaxLogo from '../assets/wemax-logo.jpg';

export default function PackageDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentPackage, loading } = useSelector((state) => state.packages);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        // Scroll to top when component mounts or ID changes
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        dispatch(fetchPackageById(id));
    }, [dispatch, id]);

    const vignetteDark = 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(3, 7, 18, 0.4) 100%)';
    const vignetteLight = 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(238, 242, 255, 0.5) 100%)';
    const bgImageDark = [
        vignetteDark,
        'radial-gradient(ellipse 140% 90% at 50% -15%, rgba(59, 130, 246, 0.28), transparent 55%)',
        'radial-gradient(ellipse 90% 70% at 100% 50%, rgba(30, 64, 175, 0.18), transparent 50%)',
        'radial-gradient(ellipse 80% 60% at 0% 55%, rgba(99, 102, 241, 0.18), transparent 50%)',
        'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(59, 130, 246, 0.12), transparent 55%)',
    ].join(', ');
    const bgImageLight = [
        vignetteLight,
        'radial-gradient(ellipse 140% 90% at 50% -15%, rgba(96, 165, 250, 0.32), transparent 55%)',
        'radial-gradient(ellipse 90% 70% at 100% 50%, rgba(147, 197, 253, 0.28), transparent 50%)',
        'radial-gradient(ellipse 80% 60% at 0% 55%, rgba(199, 210, 254, 0.28), transparent 50%)',
        'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(186, 230, 253, 0.2), transparent 55%)',
    ].join(', ');

    if (loading) {
        return (
            <div className="relative w-full min-h-screen overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                        backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                        backgroundAttachment: 'fixed',
                        backgroundSize: 'cover',
                    }}
                />
                <div className={`relative z-10 w-full min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!currentPackage) {
        return (
            <div className="relative w-full min-h-screen overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                        backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                        backgroundAttachment: 'fixed',
                        backgroundSize: 'cover',
                    }}
                />
                <div className={`relative z-10 w-full min-h-screen flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Package not found
                    </p>
                </div>
            </div>
        );
    }

    const items = currentPackage.items || [];
    const images = currentPackage.images || [{ url: wemaxLogo }];

    // Calculate review data from products in the package
    const calculateReviewData = () => {
        if (!items || items.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }

        let totalRating = 0;
        let totalReviews = 0;
        let productsWithReviews = 0;

        items.forEach((item) => {
            const product = item.product;
            if (product && product.averageRating && product.reviewsCount) {
                totalRating += product.averageRating * product.reviewsCount;
                totalReviews += product.reviewsCount || 0;
                productsWithReviews++;
            }
        });

        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        return {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            totalReviews: totalReviews,
        };
    };

    const reviewData = calculateReviewData();

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={`full-${i}`} className="text-yellow-400" />
                ))}
                {hasHalfStar && <FaStarHalfStroke className="text-yellow-400" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <FaStar key={`empty-${i}`} className="text-gray-400" />
                ))}
            </>
        );
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                    backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                    backgroundAttachment: 'fixed',
                    backgroundSize: 'cover',
                }}
            />
            <div className={`relative z-10 w-full min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    {/* Package Images Section */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className={`relative rounded-lg overflow-hidden h-80 sm:h-96 md:h-[500px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center`}>
                            <img
                                src={images[selectedImage]?.url || wemaxLogo}
                                alt={currentPackage.name}
                                className="w-full h-full object-contain p-4"
                            />
                            {currentPackage.discountPercent > 0 && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                                    -{currentPackage.discountPercent}%
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImage === idx 
                                                ? 'border-blue-600 ring-2 ring-blue-400' 
                                                : theme === 'dark' 
                                                    ? 'border-gray-700 hover:border-gray-600' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`${currentPackage.name} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Package Details */}
                    <div className="space-y-6">
                        {/* Title and Rating */}
                        <div>
                            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <FaBox className="text-blue-600" /> {currentPackage.name}
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1">
                                    {renderStars(reviewData.averageRating)}
                                </div>
                                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    ({reviewData.totalReviews} {reviewData.totalReviews === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-2">
                            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Package Price
                            </p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-3xl md:text-4xl font-bold text-blue-600">
                                    KES {currentPackage.totalPrice?.toLocaleString()}
                                </p>
                                {currentPackage.discountPercent > 0 && (
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        Save {currentPackage.discountPercent}%
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Package Overview
                            </h3>
                            <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {currentPackage.description}
                            </p>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="space-y-4 pt-4 border-t border-gray-300">
                            {/* Quantity */}
                            <div className="flex items-center gap-4">
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Quantity:
                                </span>
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className={`text-xl font-bold transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        −
                                    </button>
                                    <span className={`min-w-[40px] text-center font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className={`text-xl font-bold transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-lg">
                                <FaShoppingCart /> Add Package to Cart
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className={`p-4 rounded-lg space-y-2 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                            <p className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>
                                <FaCheckCircle /> Perfect Bundle
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-green-400/70' : 'text-green-700'}`}>
                                Save up to {currentPackage.discountPercent}% when you buy this complete package
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Included */}
                {items.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            📦 What's Included
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {items.map((item, idx) => (
                                <div 
                                    key={idx}
                                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                >
                                    <p className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        ✓ {item.productName || item.name}
                                    </p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Qty: {item.quantity || 1}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
