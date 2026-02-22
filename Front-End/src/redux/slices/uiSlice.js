import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
};

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        theme: getInitialTheme(),
        cursorVisible: true,
        sidebarOpen: false,
    },
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', state.theme);
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        setCursorVisible: (state, action) => {
            state.cursorVisible = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
    },
});

export const { toggleTheme, setTheme, setCursorVisible, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
