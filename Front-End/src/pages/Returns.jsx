import { useSelector } from 'react-redux';
import { FaUndo, FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaClock, FaShieldAlt } from 'react-icons/fa';

export default function Returns() {
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
                            <FaUndo className="text-blue-600 text-4xl sm:text-5xl" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Returns & Refunds
                        </h1>
                        <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Our return and refund policy ensures your satisfaction
                        </p>
                    </div>

                    {/* Returns Policy */}
                    <div className={sectionClass}>
                        <FaCheckCircle className="text-green-500 text-2xl mb-3" />
                        <h2 className={headingClass}>Returns Policy</h2>
                        <p className={`${textClass} mb-3`}>
                            Returns are accepted within <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>24–72 hours</strong> of delivery if the product is:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Defective or damaged</li>
                            <li>Incorrect item received</li>
                            <li>Not as described</li>
                        </ul>
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                            <p className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Return Conditions:</p>
                            <ul className={`${listClass} list-disc list-inside ml-2`}>
                                <li>Product must be unused and in original packaging</li>
                                <li>All accessories and documentation must be included</li>
                                <li>Proof of purchase (invoice/receipt) is required</li>
                                <li>Product must be in resalable condition</li>
                            </ul>
                        </div>
                    </div>

                    {/* Return Process */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>How to Return an Item</h2>
                        <ol className={`${listClass} list-decimal list-inside ml-2 space-y-3`}>
                            <li>
                                <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Contact Us:</strong> Reach out to our customer support within 72 hours of delivery to initiate a return request.
                            </li>
                            <li>
                                <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Provide Details:</strong> Share your order number, reason for return, and photos if the item is damaged or defective.
                            </li>
                            <li>
                                <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Get Approval:</strong> We'll review your request and provide return authorization if eligible.
                            </li>
                            <li>
                                <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Pack & Ship:</strong> Package the item securely in its original packaging and ship it back using the provided instructions.
                            </li>
                            <li>
                                <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Inspection:</strong> Once received, we'll inspect the item to verify the condition and reason for return.
                            </li>
                            <li>
                                <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Processing:</strong> Upon approval, your refund or exchange will be processed.
                            </li>
                        </ol>
                    </div>

                    {/* Refund Policy */}
                    <div className={sectionClass}>
                        <FaShieldAlt className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Refund Policy</h2>
                        <p className={`${textClass} mb-3`}>
                            Refunds are processed within <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>5–14 working days</strong> after:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>We receive the returned item</li>
                            <li>Inspection and approval</li>
                            <li>Verification of the return reason</li>
                        </ul>
                        <p className={`${textClass} mb-3`}>Refund Method:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Refunds will be processed to the original payment method used</li>
                            <li>M-Pesa payments will be refunded to the same number</li>
                            <li>Bank transfers will be refunded to the same account</li>
                        </ul>
                    </div>

                    {/* Exchange Policy */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Exchange Policy</h2>
                        <p className={`${textClass} mb-3`}>
                            Product exchanges are allowed based on:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li>Availability of the desired replacement item</li>
                            <li>Condition of the returned item</li>
                            <li>Eligibility within the return timeframe</li>
                        </ul>
                        <p className={textClass}>
                            If the exchange item has a different price, the difference will be adjusted accordingly. If the exchange item costs less, you'll receive a refund for the difference. If it costs more, you'll need to pay the additional amount.
                        </p>
                    </div>

                    {/* Non-Returnable Items */}
                    <div className={sectionClass}>
                        <FaTimesCircle className="text-red-500 text-2xl mb-3" />
                        <h2 className={headingClass}>Non-Returnable Items</h2>
                        <p className={`${textClass} mb-3`}>The following items cannot be returned:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Items damaged due to customer misuse or negligence</li>
                            <li>Items without original packaging or accessories</li>
                            <li>Items returned after 72 hours</li>
                            <li>Items that have been used or modified</li>
                            <li>Personalized or custom-made items</li>
                            <li>Items purchased on clearance or final sale</li>
                        </ul>
                    </div>

                    {/* Return Shipping */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Return Shipping</h2>
                        <p className={`${textClass} mb-3`}>
                            Return shipping costs:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2 mb-4`}>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Defective/Incorrect Items:</strong> We cover return shipping costs</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Change of Mind:</strong> Customer is responsible for return shipping costs</li>
                        </ul>
                        <p className={textClass}>
                            We'll provide you with return shipping instructions and labels when applicable.
                        </p>
                    </div>

                    {/* Warranty Returns */}
                    <div className={sectionClass}>
                        <FaShieldAlt className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Warranty Returns</h2>
                        <p className={`${textClass} mb-3`}>
                            Items covered under warranty may be returned for repair or replacement. Please refer to our Warranty Policy for details on:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Warranty coverage period</li>
                            <li>Required documentation (warranty card, invoice)</li>
                            <li>Claim process</li>
                            <li>Warranty exclusions</li>
                        </ul>
                    </div>

                    {/* Timeline */}
                    <div className={sectionClass}>
                        <FaClock className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Important Timelines</h2>
                        <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                                <p className={textClass}>
                                    <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Return Request:</strong> Within 72 hours of delivery
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                                <p className={textClass}>
                                    <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Item Return:</strong> Within 7 days of return authorization
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                                <p className={textClass}>
                                    <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Refund Processing:</strong> 5–14 working days after approval
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Need Help with Returns?</h2>
                        <p className={textClass}>
                            If you need to initiate a return or have questions about our return policy, please contact us:
                        </p>
                        <ul className={`${listClass} mt-3`}>
                            <li>Email: <a href="mailto:support@wemax.co.ke" className="text-blue-500 hover:underline">support@wemax.co.ke</a></li>
                            <li>Phone: <a href="tel:+254798578998" className="text-blue-500 hover:underline">+254 798578998</a> or <a href="tel:+254112634313" className="text-blue-500 hover:underline">+254 112634313</a></li>
                        </ul>
                        <p className={`${textClass} mt-4`}>
                            Please have your order number ready when contacting us for faster assistance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
