import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../redux/slices/authSlice.js';
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';
import GoogleIcon from '../components/GoogleIcon.jsx';
import wemaxDarkBg from '../assets/wemax-dark-bg.png';
import wemaxLightBg from '../assets/wemax-light-bg.png';

export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleRegister = () => {
        setGoogleLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(register(formData));
        if (register.fulfilled.match(result)) {
            navigate('/');
        }
    };

    const bgImage = theme === 'dark' ? wemaxDarkBg : wemaxLightBg;

    return (
        <div
            className="relative w-full min-h-screen flex items-center justify-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto 520px',
                backgroundAttachment: 'fixed',
                backgroundColor: theme === 'dark' ? '#020617' : '#f9fafb',
            }}
        >
            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-950/75' : 'bg-gray-50/75'} backdrop-blur-[1px]`} aria-hidden="true" />
            <div className={`relative z-10 w-full max-w-md rounded-lg p-6 sm:p-8 md:p-10 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <FaUser className="text-grey-600 text-2xl" />
                        <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Register
                        </h1>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Create your account to get started
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                        <p className="text-red-800 text-sm font-semibold">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Full Name
                        </label>
                        <div className="relative">
                            <FaUser className={`absolute left-3 top-3 text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email Address
                        </label>
                        <div className="relative">
                            <FaEnvelope className={`absolute left-3 top-3 text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                            />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Phone Number
                        </label>
                        <div className="relative">
                            <FaPhone className={`absolute left-3 top-3 text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="tel"
                                placeholder="+254 712 345 678"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Password
                        </label>
                        <div className="relative">
                            <FaLock className={`absolute left-3 top-3 text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-2.5 rounded-lg font-bold transition-all duration-300 text-sm sm:text-base mt-6"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                    <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
                    <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                </div>

                {/* Google Sign Up */}
                <button
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={googleLoading || loading}
                    className={`w-full py-2.5 rounded-lg font-bold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 border ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                    {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>

                {/* Login Link */}
                <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
