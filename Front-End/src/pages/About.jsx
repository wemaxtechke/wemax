import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaInfoCircle, FaBullseye, FaHeart, FaAward, FaBox, FaCouch } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';

export default function About() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 md:mb-16">
                        <div className="flex justify-center mb-4">
                            <img src={wemaxLogo} alt="Wemax" className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl shadow-lg" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            About Wemax Tech
                        </h1>
                        <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Premium electronics and furniture for a smarter, more connected life.
                        </p>
                    </div>

                    {/* Mission & Story */}
                    <div className={`rounded-xl p-6 sm:p-8 mb-8 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <FaInfoCircle className="text-blue-600 text-2xl flex-shrink-0" />
                            <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Our Story
                            </h2>
                        </div>
                        <p className={`leading-relaxed mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Wemax Tech™ is an online electronics and technology solutions brand specializing in retail and product delivery using trusted courier partners including Panda Courier Services and Fargo Wells.
                        </p>
                        <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            We bring together premium electronics and designer furniture in one place. From church setups and event livestreams to home offices and living rooms, we curate packages and products that fit your needs. We operate a hybrid drop-shipping model, acting as an intermediary between suppliers and customers while maintaining full quality responsibility.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className={`rounded-xl p-6 sm:p-8 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <FaBullseye className="text-blue-600 text-2xl mb-4" />
                            <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Our Mission</h3>
                            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                To deliver quality electronics and furniture that enhance your spaces—whether for worship, work, or home.
                            </p>
                        </div>
                        <div className={`rounded-xl p-6 sm:p-8 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <FaAward className="text-blue-600 text-2xl mb-4" />
                            <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Our Vision</h3>
                            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                To be Kenya's trusted destination for electronics and furniture packages that combine value with quality.
                            </p>
                        </div>
                    </div>

                    {/* What We Offer */}
                    <div className={`rounded-xl p-6 sm:p-8 mb-8 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <FaHeart className="text-blue-600 text-2xl flex-shrink-0" />
                            <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                What We Offer
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <FaBox className="text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Electronics</h4>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Cameras, livestream gear, speakers, and tech for churches, events, and home.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FaCouch className="text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Furniture</h4>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Designer furniture and bundles to create comfortable, functional spaces.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            to="/packages"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                                theme === 'dark'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            <FaBox /> Explore Our Packages
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
