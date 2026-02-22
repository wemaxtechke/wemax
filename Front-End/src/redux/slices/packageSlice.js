import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchPackages = createAsyncThunk('packages/fetchPackages', async (params = {}, { rejectWithValue }) => {
    try {
        const response = await api.get('/packages', { params });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch packages');
    }
});

export const fetchPackageById = createAsyncThunk('packages/fetchPackageById', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`/packages/${id}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch package');
    }
});

const packageSlice = createSlice({
    name: 'packages',
    initialState: {
        items: [],
        currentPackage: null,
        totalPages: 1,
        currentPage: 1,
        total: 0,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentPackage: (state) => {
            state.currentPackage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.packages;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
                state.total = action.payload.total;
            })
            .addCase(fetchPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPackageById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPackageById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPackage = action.payload;
            })
            .addCase(fetchPackageById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentPackage } = packageSlice.actions;
export default packageSlice.reducer;
