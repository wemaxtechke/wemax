import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaHeadset } from 'react-icons/fa';

export default function Contact() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder: could POST to a backend or use mailto
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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

    const inputClass = `w-full px-4 py-3 rounded-lg border transition-colors ${
        theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-600/50'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/50'
    } outline-none`;

    const labelClass = `block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

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
                            <FaHeadset className="text-blue-600 text-4xl sm:text-5xl" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Contact Us
                        </h1>
                        <p className={`text-base sm:text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Have questions? Reach out and we'll get back to you as soon as possible.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} h-fit`}>
                            <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Get in Touch
                            </h2>
                            <div className="space-y-4">
                                <a
                                    href="mailto:support@wemax.co.ke"
                                    className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                                >
                                    <FaEnvelope className="text-blue-500 flex-shrink-0" />
                                    <span>support@wemax.co.ke</span>
                                </a>
                                <a
                                    href="tel:+254798578998"
                                    className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                                >
                                    <FaPhone className="text-blue-500 flex-shrink-0" />
                                    <span>+254 798578998</span>
                                </a>
                                <a
                                    href="tel:+254112634313"
                                    className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                                >
                                    <FaPhone className="text-blue-500 flex-shrink-0" />
                                    <span>+254 112634313</span>
                                </a>
                                <div className={`flex items-start gap-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span>Nakuru, Kenya</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className={`lg:col-span-2 rounded-xl p-6 sm:p-8 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Send a Message
                            </h2>

                            {submitted ? (
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-800'}`}>
                                    <p className="font-semibold">Thank you! Your message has been sent. We'll get back to you soon.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className={labelClass}>Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Your name"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className={labelClass}>Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="you@example.com"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className={labelClass}>Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder="How can we help?"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className={labelClass}>Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            placeholder="Your message..."
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        <FaPaperPlane /> Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
