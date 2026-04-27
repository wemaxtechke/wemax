import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaComments, FaTimes } from 'react-icons/fa';
import { io } from 'socket.io-client';
import api from '../utils/api.js';
import { cn } from '../lib/utils.js';

export default function SupportChatWidget({ isOpen, setIsOpen }) {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingChat, setLoadingChat] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const loadMessages = async (chatId, { silent = false } = {}) => {
        if (!chatId) return;
        if (!silent) setLoadingMessages(true);
        try {
            const res = await api.get(`/chats/${chatId}/messages`);
            setMessages(res.data || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load messages');
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    };

    const loadMyChat = async ({ withMessages = true, silent = false } = {}) => {
        if (!silent) setLoadingChat(true);
        try {
            const res = await api.get('/chats/me');
            const nextChat = res.data;
            setChat(nextChat);

            if (withMessages && nextChat?._id) {
                await loadMessages(nextChat._id, { silent });
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load chat');
        } finally {
            if (!silent) setLoadingChat(false);
        }
    };

    useEffect(() => {
        if (isOpen && !chat && isAuthenticated && user?.role !== 'admin') {
            loadMyChat({ withMessages: true });
        }
    }, [isOpen, chat, isAuthenticated, user?.role]);

    useEffect(() => {
        if (!isOpen || !chat?._id) return;
        const interval = setInterval(() => {
            loadMessages(chat._id, { silent: true });
        }, 5000);
        return () => clearInterval(interval);
    }, [isOpen, chat?._id]);

    useEffect(() => {
        if (!isOpen || !isAuthenticated || user?.role === 'admin' || !chat?._id) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const baseURL = api.defaults.baseURL || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
        const socketURL = baseURL.replace(/\/api\/?$/, '');

        const socket = io(socketURL, {
            auth: { token },
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('message:sent', (msg) => {
            if (msg.chat === chat._id) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        socket.on('message:new', (msg) => {
            if (msg.chat === chat._id) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        socket.on('error', (err) => {
            if (err?.message) {
                setError(err.message);
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isOpen, isAuthenticated, user?.role, chat?._id]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !chat?._id) return;
        setSending(true);
        setError('');
        const payload = {
            chatId: chat._id,
            content: reply.trim(),
        };

        const socket = socketRef.current;

        if (socket && socket.connected) {
            socket.emit('message:send', payload);
            setReply('');
            setSending(false);
            return;
        }

        try {
            const res = await api.post('/chats/send', payload);
            setMessages((prev) => [...prev, res.data]);
            setReply('');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const inputBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={cn(
                    'fixed z-[110] flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300',
                    'hover:bg-blue-700 hover:scale-105 active:scale-95',
                    'right-4 h-7 w-7 sm:right-6 sm:h-16 sm:w-16',
                    'bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(7.6rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]',
                    isOpen
                        ? 'pointer-events-none opacity-0'
                        : 'opacity-50 hover:opacity-100 focus-visible:opacity-100 active:opacity-100'
                )}
                aria-label="Open chat with admin"
            >
                <FaComments className="text-sm sm:text-2xl" />
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[115] bg-black/40 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none"
                    aria-hidden
                    onClick={() => setIsOpen(false)}
                />
            )}

            {isOpen && (
                <div
                    className={cn(
                        'fixed z-[120] overflow-hidden flex flex-col min-h-0',
                        'inset-x-0 bottom-0 rounded-t-2xl sm:rounded-t-none',
                        'h-[min(90vh,36rem)] sm:h-[28rem]',
                        'sm:inset-auto sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 sm:rounded-2xl sm:shadow-2xl',
                        bgClass,
                        borderClass,
                        'border'
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center justify-between shrink-0 px-4 py-3 sm:py-3.5 border-b',
                            borderClass,
                            theme === 'dark'
                                ? 'bg-gradient-to-r from-gray-800 to-gray-900'
                                : 'bg-gradient-to-r from-gray-50 to-white'
                        )}
                    >
                        <div className="min-w-0 flex-1 pr-2">
                            <h3 className={cn('font-semibold text-base sm:text-sm truncate', textClass)}>
                                Chat with Admin
                            </h3>
                            <p className={cn('text-xs mt-0.5', textSecondaryClass)}>
                                We usually reply in a few minutes.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                'shrink-0 flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full border text-sm transition-colors',
                                borderClass,
                                theme === 'dark'
                                    ? 'text-gray-300 hover:bg-gray-700 border-gray-600'
                                    : 'text-gray-600 hover:bg-gray-100 border-gray-300'
                            )}
                            aria-label="Close chat"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {error && (
                        <div className="shrink-0 px-4 py-2.5 text-xs sm:text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 border-b border-rose-500/30">
                            {error}
                        </div>
                    )}

                    {!isAuthenticated ? (
                        <div
                            className={cn(
                                'flex flex-col flex-1 min-h-[12rem] px-4 py-8 items-center justify-center text-center',
                                theme === 'dark' ? 'bg-gray-950/50' : 'bg-gray-50/80'
                            )}
                        >
                            <p className={cn('text-sm mb-4', textSecondaryClass)}>
                                Sign in to message our team. Shop AI works without an account.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-sm font-semibold border',
                                        borderClass,
                                        textClass,
                                        theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                    )}
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'flex flex-col flex-1 min-h-0',
                                theme === 'dark' ? 'bg-gray-950/50' : 'bg-gray-50/80'
                            )}
                        >
                            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-3 py-3 space-y-3 min-h-0">
                                {loadingChat ? (
                                    <div className={cn('flex items-center gap-2 py-4', textSecondaryClass)}>
                                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm">Loading chat...</span>
                                    </div>
                                ) : loadingMessages && messages.length === 0 ? (
                                    <div className={cn('flex items-center gap-2 py-4', textSecondaryClass)}>
                                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm">Loading messages...</span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div
                                        className={cn(
                                            'text-sm text-center py-8 px-4 rounded-xl border border-dashed',
                                            textSecondaryClass,
                                            borderClass
                                        )}
                                    >
                                        Start a conversation with our team.
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.senderRole === 'customer';
                                        return (
                                            <div
                                                key={msg._id}
                                                className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                                            >
                                                <div
                                                    className={cn(
                                                        'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                                                        isMine
                                                            ? 'bg-blue-600 text-white rounded-br-md'
                                                            : cn(
                                                                  'rounded-bl-md',
                                                                  inputBgClass,
                                                                  textClass,
                                                                  borderClass,
                                                                  'border'
                                                              )
                                                    )}
                                                >
                                                    <div className="whitespace-pre-wrap break-words">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                onSubmit={sendMessage}
                                className={cn(
                                    'shrink-0 px-3 py-3 sm:py-3 border-t flex gap-2 sm:gap-2 items-end',
                                    borderClass,
                                    theme === 'dark' ? 'bg-gray-900/90' : 'bg-white'
                                )}
                            >
                                <input
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your message..."
                                    disabled={sending || loadingChat}
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
                                    disabled={sending || !reply.trim() || !chat?._id}
                                    className={cn(
                                        'shrink-0 px-4 py-3 sm:py-2.5 rounded-xl text-sm font-semibold',
                                        'bg-blue-600 hover:bg-blue-700 text-white',
                                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                        'disabled:opacity-60 disabled:cursor-not-allowed',
                                        theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
                                    )}
                                >
                                    {sending ? '…' : 'Send'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
