import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPackages } from '../redux/slices/packageSlice.js';
import { FaBox } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';

function Packages() {
    const dispatch = useDispatch();
    const { items: packages, loading, error } = useSelector((state) => state.packages);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    useEffect(() => {
        dispatch(fetchPackages());
    }, [dispatch]);

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

    if (error) {
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
                    <div className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                        <p className="font-semibold">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

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
                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <FaBox className="text-blue-600" /> Packages & Bundles
                    </h1>
                    <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Curated setups for churches, events, livestreams, and home comfort.
                    </p>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {packages.length > 0 ? (
                        packages.map((pkg) => (
                            <Link 
                                key={pkg._id} 
                                to={`/packages/${pkg._id}`}
                                className={`group rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'}`}
                            >
                                {/* Package Image */}
                                <div className={`relative overflow-hidden h-48 sm:h-56 md:h-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <img 
                                        src={pkg.images?.[0]?.url || wemaxLogo} 
                                        alt={pkg.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {pkg.discountPercent > 0 && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                                            -{pkg.discountPercent}%
                                        </div>
                                    )}
                                </div>

                                {/* Package Info */}
                                <div className="p-4 md:p-5">
                                    <h3 className={`text-lg sm:text-xl font-bold mb-2 line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {pkg.name}
                                    </h3>

                                    <p className={`text-sm mb-4 line-clamp-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {pkg.description?.slice(0, 100)}
                                        {pkg.description && pkg.description.length > 100 ? '…' : ''}
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <p className="text-2xl md:text-3xl font-bold text-blue-600">
                                            KES {pkg.totalPrice?.toLocaleString()}
                                        </p>
                                        {pkg.discountPercent > 0 && (
                                            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                                Save {pkg.discountPercent}%
                                            </span>
                                        )}
                                    </div>

                                    {/* View Details Button */}
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base">
                                        View Package
                                    </button>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className={`col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <FaBox className="text-5xl mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No packages available yet. Check back soon.</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}

export default Packages;

