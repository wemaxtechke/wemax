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
        <div className={`w-full ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} py-3 px-2.5 sm:py-12 sm:px-6 md:py-16 md:px-8`}>
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <h1 className={`mb-3 flex items-center gap-1.5 text-lg font-bold sm:mb-8 sm:gap-3 sm:text-4xl md:text-5xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FaTruck className="shrink-0 text-sm text-blue-600 sm:text-3xl md:text-4xl" /> Checkout
                </h1>

                <div className="grid grid-cols-1 gap-3 md:gap-8 lg:grid-cols-3">
                    {/* Shipping Form */}
                    <div className="lg:col-span-2">
                        <div className={`rounded-lg border p-3 sm:p-6 md:p-8 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                            <h2 className={`mb-2 flex items-center gap-1 text-sm font-bold sm:mb-6 sm:gap-2 sm:text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <FaMapMarkerAlt className="shrink-0 text-xs text-blue-600 sm:text-xl" /> Shipping Address
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-5">
                                {/* Name */}
                                <div>
                                    <label className={`mb-0.5 block text-[11px] font-semibold sm:mb-2 sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <FaUser className={`pointer-events-none absolute left-2 top-1.5 text-xs sm:left-3 sm:top-2.5 sm:text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className={`w-full rounded-md border py-1.5 pl-8 pr-2.5 text-xs transition-colors sm:rounded-lg sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={`mb-0.5 block text-[11px] font-semibold sm:mb-2 sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <FaPhone className={`pointer-events-none absolute left-2 top-1.5 text-xs sm:left-3 sm:top-2.5 sm:text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <input
                                            type="tel"
                                            placeholder="+254 712 345 678"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            className={`w-full rounded-md border py-1.5 pl-8 pr-2.5 text-xs transition-colors sm:rounded-lg sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>
                                </div>

                                {/* City and Region Grid */}
                                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-4">
                                    {/* City */}
                                    <div>
                                        <label className={`mb-0.5 block text-[11px] font-semibold sm:mb-2 sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                                            className={`w-full rounded-md border px-2.5 py-1.5 text-xs transition-colors sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>

                                    {/* Region */}
                                    <div>
                                        <label className={`mb-0.5 block text-[11px] font-semibold sm:mb-2 sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Region
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Westlands"
                                            value={formData.region}
                                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                            required
                                            className={`w-full rounded-md border px-2.5 py-1.5 text-xs transition-colors sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className={`mb-0.5 block text-[11px] font-semibold sm:mb-2 sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Address
                                    </label>
                                    <textarea
                                        placeholder="Enter your detailed address"
                                        value={formData.addressLine}
                                        onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                                        required
                                        rows={3}
                                        className={`w-full resize-none rounded-md border px-2.5 py-1.5 text-xs transition-colors sm:min-h-[6.5rem] sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-blue-600'} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-600/50' : 'focus:ring-blue-500/50'}`}
                                    />
                                </div>

                                {/* Carrier selection */}
                                <div className={`mt-3 border-t pt-2 sm:mt-6 sm:pt-4 ${theme === 'dark' ? 'border-gray-700/40' : 'border-gray-200'}`}>
                                    <h3 className={`mb-1.5 text-sm font-semibold sm:mb-3 sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                                        className={`w-full rounded-md border px-2.5 py-1.5 text-xs transition-colors sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm ${
                                            theme === 'dark'
                                                ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500'
                                                : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-600'
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
                                        <p className="mt-1.5 text-[11px] text-rose-400 sm:mt-2 sm:text-sm">
                                            {shippingError}
                                        </p>
                                    )}
                                </div>

                                {/* Payment method selection */}
                                <div className={`mt-4 border-t pt-3 sm:mt-6 sm:pt-4 ${theme === 'dark' ? 'border-gray-700/40' : 'border-gray-200'}`}>
                                    <h3 className={`mb-2 text-base font-semibold sm:mb-3 sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Payment method
                                    </h3>
                                    <div className="space-y-2 sm:space-y-3">
                                        <label className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors sm:gap-3 sm:p-3 ${
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
                                            <span className={`text-xs font-medium sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                Pay now
                                            </span>
                                        </label>
                                        {carrier !== 'Shuttles and bus services' && allowCodForSelection && (
                                            <label className={`flex cursor-pointer items-center gap-1.5 rounded-md border p-1.5 transition-colors sm:gap-3 sm:rounded-lg sm:p-3 ${
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
                                                <span className={`text-xs font-medium sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                    Pay on delivery
                                                </span>
                                            </label>
                                        )}
                                        {carrier !== 'Shuttles and bus services' && !allowCodForSelection && formData.city && (
                                            <p className={`text-[11px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Pay on delivery is not available for this carrier and location combination.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit"
                                    disabled={shippingLoading}
                                    className="mt-4 w-full rounded-md bg-gradient-to-r from-green-600 to-green-700 py-2 text-xs font-bold text-white transition-all duration-300 hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-8 sm:rounded-lg sm:py-3 sm:text-base"
                                >
                                    Place Order
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className={`h-fit rounded-lg border p-3 sm:p-6 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                        <h2 className={`mb-3 text-sm font-bold sm:mb-6 sm:text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Order Summary
                        </h2>

                        <div className="space-y-1.5 border-b border-gray-300 pb-3 sm:space-y-4 sm:pb-6">
                            <div className="flex justify-between text-xs sm:text-base">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Subtotal
                                </span>
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    KES {subtotal?.toLocaleString() || '0'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-base">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Shipping
                                </span>
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {shippingCost != null ? `KES ${shippingCost.toLocaleString()}` : 'TBD'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-base">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Tax
                                </span>
                                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    TBD
                                </span>
                            </div>
                        </div>

                        <div className="my-3 flex justify-between sm:my-6">
                            <span className={`text-xs font-bold sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                            <span className={`text-base font-bold sm:text-2xl ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`}>
                                KES {(subtotal + (shippingCost || 0))?.toLocaleString() || '0'}
                            </span>
                        </div>

                        {/* Info */}
                        <div className={`rounded-md border p-2.5 text-[10px] leading-snug sm:rounded-lg sm:p-4 sm:text-sm sm:leading-normal ${theme === 'dark' ? 'border-blue-800 bg-blue-900/20 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
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
