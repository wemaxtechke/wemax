import { useSelector } from 'react-redux';
import { FaLock, FaDatabase, FaEnvelope, FaShieldAlt, FaUserShield, FaBan } from 'react-icons/fa';

export default function Privacy() {
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
                            <FaLock className="text-blue-600 text-4xl sm:text-5xl" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Privacy Policy
                        </h1>
                        <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Our Commitment</h2>
                        <p className={textClass}>
                            Wemax Tech respects customer privacy and data security. We are committed to protecting your personal information and ensuring transparency about how we collect, use, and safeguard your data.
                        </p>
                    </div>

                    {/* Data Collection */}
                    <div className={sectionClass}>
                        <FaDatabase className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Information We Collect</h2>
                        <p className={`${textClass} mb-3`}>We collect the following information:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Names</strong> - To process orders and communicate with you</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Phone numbers</strong> - For order confirmations, delivery updates, and customer support</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Addresses</strong> - For product delivery</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Payment references</strong> - To verify and process payments</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Email addresses</strong> - For order confirmations and communication</li>
                        </ul>
                    </div>

                    {/* Data Usage */}
                    <div className={sectionClass}>
                        <FaEnvelope className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>How We Use Your Information</h2>
                        <p className={`${textClass} mb-3`}>We use your data for the following purposes:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Order processing</strong> - To fulfill and manage your orders</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Delivery</strong> - To coordinate product delivery and provide tracking information</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Customer support</strong> - To respond to your inquiries and provide assistance</li>
                            <li><strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Marketing communication</strong> - To send you updates about products, promotions, and services (with your consent)</li>
                        </ul>
                    </div>

                    {/* Data Protection */}
                    <div className={sectionClass}>
                        <FaShieldAlt className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Data Protection Policy</h2>
                        <p className={`${textClass} mb-3`}>
                            Customer data is protected and not shared with third parties without consent. All customer information is confidential and stored securely.
                        </p>
                        <p className={textClass}>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                    </div>

                    {/* Data Sharing */}
                    <div className={sectionClass}>
                        <FaBan className="text-red-500 text-2xl mb-3" />
                        <h2 className={headingClass}>Data Sharing & Third Parties</h2>
                        <p className={`${textClass} mb-4`}>
                            <strong className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                We do not sell or share customer data with unauthorized third parties.
                            </strong>
                        </p>
                        <p className={`${textClass} mb-3`}>We may share your information only in the following circumstances:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>With trusted courier partners (Panda Courier Services, Fargo Wells) for delivery purposes</li>
                            <li>With payment processors to complete transactions</li>
                            <li>When required by law or legal process</li>
                            <li>With your explicit consent</li>
                        </ul>
                    </div>

                    {/* Communication Policy */}
                    <div className={sectionClass}>
                        <FaUserShield className="text-blue-600 text-2xl mb-3" />
                        <h2 className={headingClass}>Communication Policy</h2>
                        <p className={`${textClass} mb-3`}>
                            We use official communication channels only. No personal accounts are used for payments or official business communications.
                        </p>
                        <p className={textClass}>
                            You may receive communications via:
                        </p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>SMS/WhatsApp for order confirmations and delivery updates</li>
                            <li>Email for order receipts and important updates</li>
                            <li>Phone calls for customer support when necessary</li>
                        </ul>
                    </div>

                    {/* Marketing Policy */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Marketing & Consent</h2>
                        <p className={textClass}>
                            We practice consent-based marketing only. You will only receive marketing communications if you have opted in. You can unsubscribe from marketing emails at any time by contacting us or using the unsubscribe link in our emails.
                        </p>
                    </div>

                    {/* Your Rights */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Your Rights</h2>
                        <p className={`${textClass} mb-3`}>You have the right to:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Access your personal information</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data (subject to legal and business requirements)</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Request information about how your data is used</li>
                        </ul>
                        <p className={`${textClass} mt-4`}>
                            To exercise these rights, please contact us at <a href="mailto:support@wemax.co.ke" className="text-blue-500 hover:underline">support@wemax.co.ke</a>
                        </p>
                    </div>

                    {/* Data Retention */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Data Retention</h2>
                        <p className={textClass}>
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order and transaction records are typically retained for a minimum period as required by Kenyan law.
                        </p>
                    </div>

                    {/* Security Measures */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Security Measures</h2>
                        <p className={`${textClass} mb-3`}>We implement various security measures to protect your data:</p>
                        <ul className={`${listClass} list-disc list-inside ml-2`}>
                            <li>Secure data storage and transmission</li>
                            <li>Access controls and authentication</li>
                            <li>Regular security assessments</li>
                            <li>Employee training on data protection</li>
                        </ul>
                    </div>

                    {/* Changes to Policy */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Changes to This Policy</h2>
                        <p className={textClass}>
                            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className={sectionClass}>
                        <h2 className={headingClass}>Contact Us</h2>
                        <p className={textClass}>
                            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <ul className={`${listClass} mt-3`}>
                            <li>Email: <a href="mailto:support@wemax.co.ke" className="text-blue-500 hover:underline">support@wemax.co.ke</a></li>
                            <li>Phone: <a href="tel:+254798578998" className="text-blue-500 hover:underline">+254 798578998</a> or <a href="tel:+254112634313" className="text-blue-500 hover:underline">+254 112634313</a></li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className={`text-center mt-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p className="text-sm">
                            Wemax Tech © {new Date().getFullYear()}. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
