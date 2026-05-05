import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../../utils/api.js';
import { cn } from '../../lib/utils.js';

export default function AdminChats() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState('');
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const currentChatIdRef = useRef(null);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const loadChats = async () => {
        try {
            const res = await api.get('/chats');
            setChats(res.data || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChats();
    }, []);

    const loadMessages = async (chatId) => {
        if (!chatId) return;
        setLoadingMessages(true);
        try {
            const res = await api.get(`/chats/${chatId}/messages`);
            setMessages(res.data || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    const selectChat = (chat) => {
        setSelectedChat(chat);
        loadMessages(chat._id);
    };

    // Track current selected chat id in a ref for socket handlers
    useEffect(() => {
        currentChatIdRef.current = selectedChat?._id || null;
    }, [selectedChat?._id]);

    useEffect(() => {
        if (selectedChat) loadMessages(selectedChat._id);
    }, [selectedChat?._id]);

    // Setup Socket.io for real-time updates
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const baseURL = api.defaults.baseURL || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
        const socketURL = baseURL.replace(/\/api\/?$/, '');

        const socket = io(socketURL, {
            auth: { token },
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('message:new', (msg) => {
            // Refresh chats list to update unread counts and ordering
            loadChats();

            // If this message belongs to the currently open chat, append it
            if (currentChatIdRef.current && msg.chat === currentChatIdRef.current) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        socket.on('message:sent', (msg) => {
            // Messages sent by admin via socket (if we ever emit from here)
            if (currentChatIdRef.current && msg.chat === currentChatIdRef.current) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedChat) return;
        setSending(true);
        setError('');
        const payload = { chatId: selectedChat._id, content: reply.trim() };

        const socket = socketRef.current;

        if (socket && socket.connected) {
            // Prefer Socket.io for real-time messaging
            socket.emit('message:send', payload);
            setReply('');
            setSending(false);
            return;
        }

        // Fallback to HTTP if socket is not available
        try {
            const res = await api.post('/chats/send', payload);
            setMessages((prev) => [...prev, res.data]);
            setReply('');
            loadChats();
        } catch (e) {
            setError(e.response?.data?.message || 'Send failed');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
    const inputBgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

    return (
        <div>
            <div className={cn('mb-2 border-b-2 pb-3 sm:mb-4 sm:pb-4', borderClass)}>
                <div className="min-w-0">
                    <h1 className={cn('text-xl font-bold sm:text-2xl md:text-3xl', textClass)}>Customer Chats</h1>
                    <p className={cn('mt-0.5 text-xs sm:mt-1 sm:text-sm', textSecondaryClass)}>Respond quickly and keep support premium.</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-rose-500 bg-rose-500/15 p-3 text-sm text-rose-400 sm:mb-6 sm:p-4" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex min-h-[240px] items-center justify-center sm:min-h-[300px]">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600 sm:h-12 sm:w-12" />
                </div>
            ) : (
                <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                    {/* Chats list */}
                    <div className={cn(
                        'w-full overflow-hidden rounded-xl border shadow-sm md:w-80 md:rounded-2xl',
                        bgClass,
                        borderClass,
                        selectedChat ? "hidden md:block" : "block"
                    )}>
                        <div className={cn('border-b px-3 py-2 sm:px-4 sm:py-3', borderClass, theme === 'dark' ? 'bg-gray-900/60' : 'bg-gray-50')}>
                            <div className={cn('text-xs font-semibold sm:text-sm', textClass)}>Chats</div>
                            <div className={cn('text-[11px] sm:text-xs', textSecondaryClass)}>{chats.length} conversation(s)</div>
                        </div>
                        <div className="max-h-[55vh] overflow-y-auto md:max-h-[70vh]">
                            {chats.length === 0 ? (
                                <div className={cn('px-3 py-8 text-center text-sm sm:px-4 sm:py-10', textSecondaryClass)}>No customer chats yet.</div>
                            ) : (
                                chats.map((chat) => {
                                    const isActive = selectedChat?._id === chat._id;
                                    return (
                                        <button
                                            type="button"
                                            key={chat._id}
                                            className={cn(
                                                'w-full border-b px-3 py-2.5 text-left transition-all last:border-b-0 sm:px-4 sm:py-3',
                                                borderClass,
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                                                    : cn(hoverBgClass, textClass)
                                            )}
                                            onClick={() => selectChat(chat)}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className={cn('truncate text-sm font-semibold sm:text-base', isActive ? "text-white" : textClass)}>
                                                        {chat.user?.name || chat.user?.email || 'Customer'}
                                                    </div>
                                                    <div className={cn('truncate text-[11px] sm:text-xs', isActive ? "text-white/80" : textSecondaryClass)}>
                                                        {chat.user?.email || '—'}
                                                    </div>
                                                </div>
                                                {chat.unreadForAdmin > 0 && (
                                                    <span className={cn(
                                                        "shrink-0 inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full text-xs font-bold",
                                                        isActive ? "bg-white/20 text-white" : "bg-rose-500 text-white"
                                                    )}>
                                                        {chat.unreadForAdmin}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Messages panel */}
                    <div className={cn(
                        'flex-1 overflow-hidden rounded-xl border shadow-sm md:rounded-2xl',
                        bgClass,
                        borderClass,
                        selectedChat ? "block" : "hidden md:block"
                    )}>
                        {!selectedChat ? (
                            <div className="flex min-h-[min(50vh,420px)] items-center justify-center p-6 sm:min-h-[420px] sm:p-8">
                                <div className={cn('text-center', textSecondaryClass)}>
                                    <div className={cn('text-base font-semibold sm:text-lg', textClass)}>Select a chat</div>
                                    <div className="mt-1 text-xs sm:text-sm">Choose a conversation to view messages.</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-[min(72dvh,620px)] flex-col md:h-[70vh]">
                                <div className={cn('flex items-center justify-between gap-2 border-b px-3 py-2 sm:gap-3 sm:px-4 sm:py-3', borderClass, theme === 'dark' ? 'bg-gray-900/60' : 'bg-gray-50')}>
                                    <div className="min-w-0">
                                        <div className={cn('truncate text-sm font-semibold sm:text-base', textClass)}>
                                            {selectedChat.user?.name || selectedChat.user?.email}
                                        </div>
                                        <div className={cn('truncate text-[11px] sm:text-xs', textSecondaryClass)}>
                                            {selectedChat.user?.email || '—'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedChat(null)}
                                        className={cn(
                                            'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all md:hidden sm:px-3 sm:py-1.5 sm:text-xs',
                                            theme === 'dark'
                                                ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        Back
                                    </button>
                                </div>

                                <div className={cn('flex-1 space-y-2 overflow-y-auto px-3 py-3 sm:space-y-3 sm:px-4 sm:py-4', theme === 'dark' ? 'bg-gray-900/30' : 'bg-gray-50')}>
                                    {loadingMessages ? (
                                        <div className={cn('text-xs sm:text-sm', textSecondaryClass)}>Loading messages...</div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isAdmin = msg.senderRole === 'admin';
                                            return (
                                                <div key={msg._id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                                                    <div className={cn(
                                                        'max-w-[90%] rounded-xl border px-3 py-2 shadow-sm sm:max-w-[70%] sm:rounded-2xl sm:px-4 sm:py-3',
                                                        isAdmin
                                                            ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white border-blue-500/30"
                                                            : cn(inputBgClass, textClass, borderClass)
                                                    )}>
                                                        <div className={cn('whitespace-pre-wrap break-words text-xs sm:text-sm', isAdmin ? "text-white" : textClass)}>
                                                            {msg.content}
                                                        </div>
                                                        <div className={cn('mt-1.5 text-[10px] opacity-90 sm:mt-2 sm:text-[11px]', isAdmin ? "text-white/80" : textSecondaryClass)}>
                                                            {msg.sender?.name || '—'} · {formatTime(msg.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={sendMessage} className={cn('flex gap-2 border-t p-3 sm:gap-3 sm:p-4', borderClass, bgClass)}>
                                    <input
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Type a reply..."
                                        disabled={sending}
                                        className={cn(
                                            'flex-1 rounded-lg border px-3 py-2 text-sm transition-all sm:rounded-xl sm:px-4 sm:text-base',
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass,
                                            "disabled:opacity-60 disabled:cursor-not-allowed"
                                        )}
                                    />
                                    <button
                                        type="submit"
                                        className={cn(
                                            'shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-3 py-2 text-xs font-semibold !text-white transition-all hover:!text-white sm:rounded-xl sm:px-5 sm:text-sm',
                                            'hover:shadow-md hover:-translate-y-0.5 sm:hover:shadow-lg',
                                            'disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none',
                                        )}
                                        disabled={sending || !reply.trim()}
                                    >
                                        {sending ? 'Sending...' : 'Send'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
