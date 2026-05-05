import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { cn } from '../lib/utils.js';

const STARTER_CHIPS = ['Find a woofer under 15k', 'Phones under 25k', 'TV under 40k'];

function toApiMessages(list) {
    return list
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content }));
}

export default function ShopAssistantTab({ theme }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const inputBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendWithText = async (rawText) => {
        const trimmed = rawText.trim();
        if (!trimmed || loading) return;

        setError('');
        const userMsg = { role: 'user', content: trimmed.slice(0, 500) };
        const threadAfterUser = [...messages, userMsg];

        setLoading(true);
        try {
            const res = await api.post('/ai/shop-assistant', {
                messages: toApiMessages(threadAfterUser),
            });
            const { assistantText, quickReplies, products } = res.data;
            setMessages([
                ...threadAfterUser,
                {
                    role: 'assistant',
                    content: typeof assistantText === 'string' ? assistantText : '',
                    products: Array.isArray(products) ? products : [],
                    quickReplies: Array.isArray(quickReplies) ? quickReplies : [],
                },
            ]);
            setInput('');
        } catch (e) {
            const status = e.response?.status;
            const msg =
                e.response?.data?.message ||
                (status === 429
                    ? 'Too many requests. Please wait a few minutes and try again.'
                    : 'Something went wrong. Please try again.');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        sendWithText(input);
    };

    return (
        <div
            className={cn(
                'flex flex-col flex-1 min-h-0',
                theme === 'dark' ? 'bg-gray-950/50' : 'bg-gray-50/80'
            )}
        >
            {error && (
                <div className="shrink-0 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 border-b border-rose-500/30">
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-3 py-3 space-y-3 min-h-0">
                {messages.length === 0 && !loading && (
                    <div className="space-y-3">
                        <p className={cn('text-sm text-center', textSecondaryClass)}>
                            Ask for product ideas, budgets, or categories — we&apos;ll suggest matches from our catalog.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {STARTER_CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => sendWithText(chip)}
                                    disabled={loading}
                                    className={cn(
                                        'text-xs px-3 py-2 rounded-full border transition-colors',
                                        borderClass,
                                        textClass,
                                        theme === 'dark'
                                            ? 'hover:bg-gray-800 border-gray-600'
                                            : 'hover:bg-white border-gray-300',
                                        'disabled:opacity-50'
                                    )}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={`${idx}-${msg.role}-${msg.content?.slice(0, 12)}`} className="space-y-2">
                            <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                                <div
                                    className={cn(
                                        'max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                                        isUser
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : cn('rounded-bl-md', inputBgClass, textClass, borderClass, 'border')
                                    )}
                                >
                                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                </div>
                            </div>

                            {!isUser && msg.quickReplies?.length > 0 && (
                                <div className="flex flex-wrap gap-2 pl-0 sm:pl-1">
                                    {msg.quickReplies.map((chip) => (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => sendWithText(chip)}
                                            disabled={loading}
                                            className={cn(
                                                'text-xs px-2.5 py-1.5 rounded-full border transition-colors',
                                                borderClass,
                                                textSecondaryClass,
                                                theme === 'dark'
                                                    ? 'hover:bg-gray-800 hover:text-gray-200'
                                                    : 'hover:bg-white hover:text-gray-900',
                                                'disabled:opacity-50'
                                            )}
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!isUser && msg.products?.length > 0 && (
                                <div className="space-y-2 pl-0 sm:pl-1">
                                    {msg.products.map((p) => {
                                        const thumb = p.images?.[0]?.url;
                                        return (
                                            <Link
                                                key={p._id}
                                                to={`/products/${p._id}`}
                                                className={cn(
                                                    'flex gap-3 p-2 rounded-xl border transition-colors items-center',
                                                    borderClass,
                                                    theme === 'dark'
                                                        ? 'hover:bg-gray-800/80 bg-gray-900/40'
                                                        : 'hover:bg-white bg-white/60'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'w-14 h-14 shrink-0 rounded-lg overflow-hidden border',
                                                        borderClass,
                                                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                                    )}
                                                >
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                                                            No img
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className={cn('font-medium text-sm line-clamp-2', textClass)}>
                                                        {p.name}
                                                    </div>
                                                    <div className="text-xs font-semibold text-blue-600 mt-0.5">
                                                        KES {p.newPrice != null ? Number(p.newPrice).toLocaleString() : '—'}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div className={cn('flex items-center gap-2 py-2', textSecondaryClass)}>
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Thinking…</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form
                onSubmit={onSubmit}
                className={cn(
                    'shrink-0 px-3 py-3 sm:py-3 border-t flex gap-2 sm:gap-2 items-end',
                    borderClass,
                    theme === 'dark' ? 'bg-gray-900/90' : 'bg-white'
                )}
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe what you need…"
                    disabled={loading}
                    className={cn(
                        'flex-1 min-w-0 py-3 sm:py-2.5 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        inputBgClass,
                        borderClass,
                        textClass,
                        'placeholder-gray-400 dark:placeholder-gray-500',
                        'disabled:opacity-60 disabled:cursor-not-allowed'
                    )}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={cn(
                        'shrink-0 px-4 py-3 sm:py-2.5 rounded-xl text-sm font-semibold',
                        'bg-blue-600 hover:bg-blue-700 text-white',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        'disabled:opacity-60 disabled:cursor-not-allowed',
                        theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
                    )}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
