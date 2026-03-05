// client/src/features/products/productSlice.jsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../../services/api";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/products");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch products" });
    }
  },
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await API.post("/products", productData, config);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to create product" },
      );
    }
  },
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await API.put(`/products/${id}`, productData, config);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to update product" },
      );
    }
  },
);

// FIXED: Removed unused 'dispatch' parameter
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      
      console.log(`🗑️ Attempting to delete product ${id}`);
      const response = await API.delete(`/products/${id}`, config);
      console.log("✅ Delete response:", response.data);
      
      // Return both the id and the response data
      return { 
        id, 
        ...response.data,
        success: true 
      };
    } catch (err) {
      console.error("❌ Delete product error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { message: "Failed to delete product" },
      );
    }
  },
);

export const toggleLike = createAsyncThunk(
  "products/toggleLike",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await API.post(`/products/${id}/like`, {}, config);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to like product" },
      );
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    loading: false,
  },
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product - COMPLETELY REMOVE FROM STATE
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the product from items array completely
        const productId = action.payload.id;
        const previousLength = state.items.length;
        state.items = state.items.filter((p) => p._id !== productId);
        const newLength = state.items.length;
        
        console.log(`✅ Product ${productId} removed from Redux state. Items: ${previousLength} -> ${newLength}`);
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("❌ Delete rejected:", action.payload);
      })

      // Toggle like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { productId, likeCount } = action.payload;
        const product = state.items.find((p) => p._id === productId);
        if (product) {
          product.likeCount = likeCount;
        }
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;