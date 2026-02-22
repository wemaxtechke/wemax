import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import productReducer from './slices/productSlice.js';
import packageReducer from './slices/packageSlice.js';
import cartReducer from './slices/cartSlice.js';
import orderReducer from './slices/orderSlice.js';
import uiReducer from './slices/uiSlice.js';
import chatReducer from './slices/chatSlice.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        packages: packageReducer,
        cart: cartReducer,
        orders: orderReducer,
        ui: uiReducer,
        chat: chatReducer,
    },
});
