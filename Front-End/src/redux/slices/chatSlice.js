import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: [],
        currentChat: null,
        messages: [],
        unreadCount: 0,
        isOpen: false,
    },
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        toggleChat: (state) => {
            state.isOpen = !state.isOpen;
        },
        setChatOpen: (state, action) => {
            state.isOpen = action.payload;
        },
    },
});

export const { setChats, setCurrentChat, setMessages, addMessage, setUnreadCount, toggleChat, setChatOpen } = chatSlice.actions;
export default chatSlice.reducer;
