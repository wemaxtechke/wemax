import { useSelector } from 'react-redux';
import { FaShippingFast, FaTruck, FaMapMarkerAlt, FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

export default function Shipping() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'light' });

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

    const sectionClass = `rounded-xl p-6 sm:p-8 mb-6 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`;
    const headingClass = `text-lg sm:text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
    const textClass = `leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`;
    const listClass = `space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`;

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
                    <div className="text-center mb-10 md:mb-12">
                        <div className="flex justify-center mb-4">
                            <FaShippingFast className="text-blue-600 text-4xl sm:text-5xl" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Shipping & Delivery
                        </h1>
                        <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Fast, reliable delivery across Kenya
                        </p>
                    </div>

                    {/* Courier Partners */}
                    <div className={sectionClass}>
                        <FaTruck className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Our Courier Partners</h2>
                        <p className={`${textClass} mb-3`}>We work with trusted courier services to ensure reliable delivery:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Panda Courier Services</li>
                            <li>Fargo Wells</li>
                            <li>G4S</li>
                            <li>Shuttles Parcel Grid Courier Services</li>
                        </ul>
                    </div>

                    {/* Delivery Timelines */}
                    <div className={sectionClass}>
                        <FaClock className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Delivery Timelines</h2>
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                                    Nairobi
                                </h3>
                                <p className={textClass}>Same-day or next-day delivery</p>
                            </div>
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                                    Other Towns
                                </h3>
                                <p className={textClass}>24–72 hours</p>
                            </div>
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                                    Remote Areas
                                </h3>
                                <p className={textClass}>2–5 working days</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Process */}
                    <div className={sectionClass}>
                        <FaCheckCircle className="text-green-500 text-2xl mb-3" />
                        <h2 className={headingClass}>Delivery Process</h2>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Orders are processed after payment confirmation</li>
                            <li>Customers receive delivery confirmation via SMS/WhatsApp</li>
                            <li>Delivery tracking is provided where applicable</li>
                            <li>You'll be notified when your order is dispatched</li>
                            <li>Our courier partner will contact you before delivery</li>
                        </ul>
                    </div>

                    {/* Delivery Fees */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Delivery Fees</h2>
                        <p className={`${textClass} mb-3`}>
                            Delivery charges depend on:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Location (Nairobi, other towns, or remote areas)</li>
                            <li>Product size and weight</li>
                            <li>Courier rates</li>
                            <li>Urgency of delivery</li>
                        </ul>
                        <p className={textClass}>
                            <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Important:</strong> Delivery charges will be communicated before dispatch and must be confirmed before your order is processed.
                        </p>
                    </div>

                    {/* Failed Deliveries */}
                    <div className={sectionClass}>
                        <FaExclamationTriangle className="text-yellow-500 text-2xl mb-3" />
                        <h2 className={headingClass}>Failed Deliveries</h2>
                        <p className={`${textClass} mb-3`}>A delivery is considered failed if:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Customer is unreachable at the provided contact number</li>
                            <li>Incorrect or incomplete address provided</li>
                            <li>Customer unavailable at the delivery time</li>
                            <li>Delivery location is inaccessible</li>
                        </ul>
                        <div className={`p-4 rounded-lg mt-4 ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                            <p className={`${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                <strong>Re-delivery Policy:</strong> Re-delivery costs shall be borne by the customer. Please ensure your contact details and delivery address are accurate.
                            </p>
                        </div>
                    </div>

                    {/* Delays Disclaimer */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Delays Disclaimer</h2>
                        <p className={`${textClass} mb-3`}>
                            Wemax Tech™ is not liable for delays caused by:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Weather conditions</li>
                            <li>Courier system failures</li>
                            <li>Natural disasters</li>
                            <li>Public emergencies</li>
                            <li>Strikes or industrial actions</li>
                            <li>Force majeure events</li>
                        </ul>
                        <p className={`${textClass} mt-4`}>
                            We will do our best to keep you informed of any delays and work with our courier partners to resolve issues promptly.
                        </p>
                    </div>

                    {/* Order Processing */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Order Processing</h2>
                        <p className={`${textClass} mb-3`}>
                            Orders placed after 5PM are processed the next business day. Orders are confirmed after customer verification and payment confirmation.
                        </p>
                        <p className={textClass}>
                            Once your order is confirmed and payment is received, we'll process it immediately and arrange for dispatch with our courier partners.
                        </p>
                    </div>

                    {/* Tracking */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Track Your Order</h2>
                        <p className={textClass}>
                            Once your order is dispatched, you'll receive tracking information via SMS or WhatsApp. You can use this information to track your package's journey to your location.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Need Help?</h2>
                        <p className={textClass}>
                            If you have questions about shipping or need to update your delivery address, please contact us:
                        </p>
                        <ul className={`${listClass} mt-3`}>
                            <li>Email: <a href="mailto:support@wemax.co.ke" className="text-blue-500 hover:underline">support@wemax.co.ke</a></li>
                            <li>Phone: <a href="tel:+254798578998" className="text-blue-500 hover:underline">+254 798578998</a> or <a href="tel:+254112634313" className="text-blue-500 hover:underline">+254 112634313</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
