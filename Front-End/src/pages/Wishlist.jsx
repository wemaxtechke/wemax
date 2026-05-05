import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

function Wishlist() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    return (
        <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`mb-8 text-xl font-bold sm:text-2xl md:mb-12 md:text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    My Wishlist
                </h1>

                {/* Empty State — compact (Packages / Orders pattern) */}
                <div className={`rounded-lg px-5 py-10 text-center sm:px-8 sm:py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <FaHeart className="mx-auto mb-3 text-3xl opacity-50 sm:text-4xl" />
                    <p className={`mx-auto mb-5 max-w-md text-sm sm:mb-6 sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        You have no items in your wishlist yet. Browse products and tap the heart icon to save your favorites.
                    </p>
                    <Link
                        to="/products"
                        className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold !text-white transition-colors duration-300 hover:bg-blue-700 hover:!text-white sm:px-8 sm:py-3 sm:text-base"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Wishlist;

