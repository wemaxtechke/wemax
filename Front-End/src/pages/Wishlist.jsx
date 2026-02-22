import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

function Wishlist() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    return (
        <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FaHeart className="text-red-500" /> My Wishlist
                </h1>

                {/* Empty State */}
                <div className={`rounded-lg p-12 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <FaHeart className="text-6xl mx-auto mb-6 opacity-50" />
                    <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        You have no items in your wishlist yet. Browse products and tap the heart icon to save your favorites.
                    </p>
                    <Link 
                        to="/products" 
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Wishlist;

