import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../redux/slices/orderSlice.js';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api.js';

const CARRIERS = ['G4S', 'Parcel Grid', 'Fargo wells', 'Shuttles and bus services'];

export default function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const { subtotal } = useSelector((state) => state.cart);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        region: '',
        addressLine: '',
    });

    const [carrier, setCarrier] = useState(CARRIERS[0]);
    const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' | 'cod'
    const [shippingRates, setShippingRates] = useState([]);
    const [shippingLoading, setShippingLoading] = useState(true);
    const [shippingError, setShippingError] = useState('');
    const [shippingCost, setShippingCost] = useState(null);
    const [allowCodForSelection, setAllowCodForSelection] = useState(false);

    useEffect(() => {
        const loadRates = async () => {
            setShippingLoading(true);
            setShippingError('');
            try {
                const res = await api.get('/shipping-rates/public');
                setShippingRates(res.data || []);
            } catch (e) {
                setShippingError(e.response?.data?.message || 'Failed to load shipping rates');
            } finally {
                setShippingLoading(false);
            }
        };
        loadRates();
    }, []);

    const recomputeShipping = (nextCarrier, nextCity) => {
        if (!nextCity) {
            setShippingCost(null);
            setAllowCodForSelection(false);
            return;
        }

        const city = nextCity.trim().toLowerCase();
        const applicable = shippingRates.filter((r) => !nextCarrier || r.carrier === nextCarrier);

        let rate =
            applicable.find(
                (r) =>
                    (r.locationName && r.locationName.toLowerCase().includes(city)) ||
                    (r.regionCode && r.regionCode.toLowerCase().includes(city))
            ) || applicable.find((r) => r.isDefault) || shippingRates.find((r) => r.isDefault);

        if (!rate) {
            setShippingCost(null);
            setAllowCodForSelection(false);
            return;
        }

        setShippingCost(rate.price ?? 0);
        const newAllowCod = !!(rate.allowCashOnDelivery && nextCarrier !== 'Shuttles and bus services');
        setAllowCodForSelection(newAllowCod);
    };

    // Reset payment method when COD becomes unavailable
    useEffect(() => {
        if (paymentMethod === 'cod' && (carrier === 'Shuttles and bus services' || !allowCodForSelection)) {
            setPaymentMethod('bank');
        }
    }, [carrier, allowCodForSelection, paymentMethod]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const orderData = {
            shippingAddress: formData,
            shippingLocation: formData.city,
            shippingCarrier: carrier,
            paymentMethod,
        };
        const result = await dispatch(createOrder(orderData));
        if (createOrder.fulfilled.match(result)) {
            navigate('/orders');
        }
    };

    return (
        <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FaTruck className="text-blue-600" /> Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Shipping Form */}
                    <div className="lg:col-span-2">
                        <div className={`rounded-lg p-6 md:p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <FaMapMarkerAlt className="text-blue-600" /> Shipping Address
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name */}
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
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
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
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>
                                </div>

                                {/* City and Region Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* City */}
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nairobi"
                                            value={formData.city}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prev) => ({ ...prev, city: value }));
                                                recomputeShipping(carrier, value);
                                            }}
                                            required
                                            className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>

                                    {/* Region */}
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Region
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Westlands"
                                            value={formData.region}
                                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                            required
                                            className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Address
                                    </label>
                                    <textarea
                                        placeholder="Enter your detailed address"
                                        value={formData.addressLine}
                                        onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                                        required
                                        rows="4"
                                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'} resize-none`}
                                    />
                                </div>

                                {/* Carrier selection */}
                                <div className="pt-4 border-t border-gray-700/40 mt-6">
                                    <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Delivery carrier
                                    </h3>
                                    <select
                                        value={carrier}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setCarrier(value);
                                            recomputeShipping(value, formData.city);
                                            if (value === 'Shuttles and bus services' || !allowCodForSelection) {
                                                setPaymentMethod('bank');
                                            }
                                        }}
                                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600'
                                        } focus:outline-none focus:ring-2 ${
                                            theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'
                                        }`}
                                    >
                                        {CARRIERS.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                    {shippingError && (
                                        <p className="mt-2 text-sm text-rose-400">
                                            {shippingError}
                                        </p>
                                    )}
                                </div>

                                {/* Payment method selection */}
                                <div className="pt-4 border-t border-gray-700/40 mt-6">
                                    <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Payment method
                                    </h3>
                                    <div className="space-y-3">
                                        <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                                            paymentMethod === 'bank'
                                                ? theme === 'dark'
                                                    ? 'bg-blue-900/30 border-blue-500'
                                                    : 'bg-blue-50 border-blue-500'
                                                : theme === 'dark'
                                                    ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                                                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="bank"
                                                checked={paymentMethod === 'bank'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                Pay now
                                            </span>
                                        </label>
                                        {carrier !== 'Shuttles and bus services' && allowCodForSelection && (
                                            <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                                                paymentMethod === 'cod'
                                                    ? theme === 'dark'
                                                        ? 'bg-emerald-900/30 border-emerald-500'
                                                        : 'bg-emerald-50 border-emerald-500'
                                                    : theme === 'dark'
                                                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                                                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                />
                                                <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                    Pay on delivery
                                                </span>
                                            </label>
                                        )}
                                        {carrier !== 'Shuttles and bus services' && !allowCodForSelection && formData.city && (
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Pay on delivery is not available for this carrier and location combination.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit"
                                    disabled={shippingLoading}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-bold transition-all duration-300 text-sm sm:text-base mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Place Order
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className={`rounded-lg p-6 h-fit ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Order Summary
                        </h2>

                        <div className="space-y-4 pb-6 border-b border-gray-300">
                            <div className="flex justify-between">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Subtotal
                                </span>
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    KES {subtotal?.toLocaleString() || '0'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Shipping
                                </span>
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {shippingCost != null ? `KES ${shippingCost.toLocaleString()}` : 'TBD'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Tax
                                </span>
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    TBD
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between my-6">
                            <span className="font-bold">Total</span>
                            <span className="text-2xl font-bold text-blue-600">
                                KES {(subtotal + (shippingCost || 0))?.toLocaleString() || '0'}
                            </span>
                        </div>

                        {/* Info */}
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                            <p>✓ Secure payment processing</p>
                            <p>✓ Fast delivery available</p>
                            <p>✓ 30-day return guarantee</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
