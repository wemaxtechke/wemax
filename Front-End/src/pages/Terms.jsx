import { useSelector } from 'react-redux';
import { FaFileContract, FaShippingFast, FaCreditCard, FaUndo, FaShieldAlt, FaBan, FaExclamationTriangle } from 'react-icons/fa';

export default function Terms() {
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
                            <FaFileContract className="text-blue-600 text-4xl sm:text-5xl" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Terms & Conditions
                        </h1>
                        <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Acceptance */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Acceptance of Terms</h2>
                        <p className={textClass}>
                            By using Wemax Tech™ services, you agree to provide accurate information, follow payment rules, respect delivery procedures, comply with return and refund policies, and comply with all our terms and conditions.
                        </p>
                    </div>

                    {/* Ordering Policy */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Ordering Policy</h2>
                        <p className={`${textClass} mb-3`}>
                            All orders are confirmed after customer verification. Orders may require partial or full payment before processing. Orders placed after 5PM are processed the next business day.
                        </p>
                    </div>

                    {/* Payment Policy */}
                    <div className={sectionClass}>
                        <FaCreditCard className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Payment Policy</h2>
                        <p className={`${textClass} mb-3`}>Accepted payment methods include:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>M-Pesa</li>
                            <li>Bank Transfer</li>
                            <li>Authorized mobile payments</li>
                        </ul>
                        <p className={`${textClass} mt-4 mb-3`}>Payment Structure:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Some products require full payment before dispatch (High-end products)</li>
                            <li>Some products require a deposit before processing (50% deposit)</li>
                            <li>Cash on Delivery (COD) is limited and subject to approval (may be available for repeat customers)</li>
                        </ul>
                        <p className={`${textClass} mt-4`}>
                            <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Important:</strong> Orders without payment confirmation will not be processed. No cash handling.
                        </p>
                    </div>

                    {/* Delivery Policy */}
                    <div className={sectionClass}>
                        <FaShippingFast className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Delivery Policy</h2>
                        <p className={`${textClass} mb-3`}>Official Courier Partners:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Panda Courier Services</li>
                            <li>Fargo Wells</li>
                            <li>G4S</li>
                            <li>Shuttles Parcel Grid Courier Services</li>
                        </ul>
                        <p className={`${textClass} mb-3`}>Delivery Timelines:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li><strong>Nairobi:</strong> Same-day or next-day delivery</li>
                            <li><strong>Other towns:</strong> 24–72 hours</li>
                            <li><strong>Remote areas:</strong> 2–5 working days</li>
                        </ul>
                        <p className={`${textClass} mb-3`}>Delivery Process:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Orders are processed after payment confirmation</li>
                            <li>Customers receive delivery confirmation via SMS/WhatsApp</li>
                            <li>Delivery tracking is provided where applicable</li>
                        </ul>
                        <p className={`${textClass} mb-3`}>Delivery Fees:</p>
                        <p className={textClass}>
                            Delivery charges depend on location and courier rates and will be communicated before dispatch.
                        </p>
                    </div>

                    {/* Failed Delivery Policy */}
                    <div className={sectionClass}>
                        <FaExclamationTriangle className="text-yellow-500 text-2xl mb-3" />
                        <h2 className={headingClass}>Failed Delivery Policy</h2>
                        <p className={`${textClass} mb-3`}>A delivery is considered failed if:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Customer is unreachable</li>
                            <li>Incorrect address provided</li>
                            <li>Customer unavailable at delivery time</li>
                        </ul>
                        <p className={textClass}>
                            <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Re-delivery costs shall be borne by the customer.</strong>
                        </p>
                    </div>

                    {/* Returns & Refunds */}
                    <div className={sectionClass}>
                        <FaUndo className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Returns & Refund Policy</h2>
                        <p className={`${textClass} mb-3`}>Returns Policy:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Returns accepted within 24–72 hours if product is defective, damaged, or incorrect</li>
                            <li>Product must be unused and in original packaging</li>
                        </ul>
                        <p className={`${textClass} mb-3`}>Refund Policy:</p>
                        <p className={textClass}>
                            Refunds processed within 5–14 working days after inspection and approval.
                        </p>
                        <p className={`${textClass} mt-4 mb-3`}>Exchange Policy:</p>
                        <p className={textClass}>
                            Product exchanges allowed based on availability and condition of returned item.
                        </p>
                    </div>

                    {/* Warranty Policy */}
                    <div className={sectionClass}>
                        <FaShieldAlt className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Warranty Policy</h2>
                        <p className={`${textClass} mb-3`}>Warranty Coverage:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Manufacturer warranty where applicable</li>
                            <li>Store warranty for selected items</li>
                        </ul>
                        <p className={`${textClass} mb-3`}>Warranty Exclusions:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Physical damage</li>
                            <li>Water damage</li>
                            <li>Power surge damage</li>
                            <li>Unauthorized repairs</li>
                            <li>Improper use</li>
                        </ul>
                        <p className={`${textClass} mb-3`}>Claim Process:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Proof of purchase required</li>
                            <li>Inspection mandatory</li>
                            <li>Verification before replacement or repair</li>
                            <li>Warranty cards and invoices must be presented</li>
                        </ul>
                    </div>

                    {/* Company Rights */}
                    <div className={sectionClass}>
                        <FaBan className="text-red-500 text-2xl mb-3" />
                        <h2 className={headingClass}>Company Rights</h2>
                        <p className={`${textClass} mb-3`}>Wemax Tech™ reserves the right to:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Refuse service</li>
                            <li>Cancel orders</li>
                            <li>Update prices</li>
                            <li>Modify policies</li>
                            <li>Terminate suspicious accounts</li>
                        </ul>
                    </div>

                    {/* Limitations of Liability */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Limitations of Liability</h2>
                        <p className={`${textClass} mb-3`}>Wemax Tech™ is not liable for:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Indirect damages</li>
                            <li>Third-party courier failures</li>
                            <li>Customer misuse of products</li>
                            <li>Delays caused by weather conditions</li>
                            <li>Courier system failures</li>
                            <li>Natural disasters</li>
                            <li>Public emergencies</li>
                        </ul>
                    </div>

                    {/* Additional Policies */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Additional Policies</h2>
                        <div className="space-y-4">
                            
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cancellation Policy</h3>
                                <p className={textClass}>
                                    Orders can only be cancelled before dispatch.
                                </p>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quality Control Policy</h3>
                                <p className={textClass}>
                                    All products undergo verification before dispatch to ensure quality assurance.
                                </p>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Responsibility Policy</h3>
                                <p className={textClass}>
                                    Customers must provide accurate delivery details and be available for delivery.
                                </p>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Fraud Prevention Policy</h3>
                                <p className={textClass}>
                                    Suspicious transactions will be flagged, investigated, and possibly cancelled.
                                </p>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dispute Resolution Policy</h3>
                                <p className={textClass}>
                                    All disputes resolved through negotiation and arbitration before legal action.
                                </p>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Legal Compliance Policy</h3>
                                <p className={textClass}>
                                    Wemax Tech operates under Kenyan e-commerce and business laws.
                                </p>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Intellectual Property Policy</h3>
                                <p className={textClass}>
                                    All branding, logos, and content belong to Wemax Tech.
                                </p>
                            </div>
                            <div>
                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Amendment Policy</h3>
                                <p className={textClass}>
                                    Policies may be updated periodically. Continued use of services implies acceptance of updated terms.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`text-center mt-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p className="text-sm">
                            Wemax Tech © {new Date().getFullYear()}. All Rights Reserved.
                        </p>
                        <p className="text-xs mt-2">
                            Official Courier Partners: Panda Courier Services | Fargo Wells
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
