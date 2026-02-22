import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/cart');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/cart', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ itemId, ...data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/cart/${itemId}`, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async ({ itemId, type }, { rejectWithValue }) => {
    try {
        await api.delete(`/cart/${itemId}`, { data: { type } });
        return itemId;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
    try {
        await api.delete('/cart');
        return null;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
});

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        packages: [],
        subtotal: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.packages = action.payload.packages || [];
                state.subtotal = action.payload.subtotal || 0;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.items = action.payload.items || [];
                state.packages = action.payload.packages || [];
                state.subtotal = action.payload.subtotal || 0;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.items = action.payload.items || [];
                state.packages = action.payload.packages || [];
                state.subtotal = action.payload.subtotal || 0;
            })
            .addCase(removeFromCart.fulfilled, (state) => {
                // Cart will be refetched
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
                state.packages = [];
                state.subtotal = 0;
            });
    },
});

export default cartSlice.reducer;
