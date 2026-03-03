// client/src/features/products/productSlice.jsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../../services/api";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await API.get("/products");
    return response.data;
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
      await API.delete(`/products/${id}`, config);
      return id; // Return the id of deleted product
    } catch (err) {
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle like - Update both likeCount and likes array
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { productId, liked, likeCount } = action.payload;
        const product = state.items.find((p) => p._id === productId);
        if (product) {
          product.likeCount = likeCount;

          // Update likes array if user info is available
          if (product.likes) {
            if (liked) {
              // Add current user to likes array (we don't have user ID here, but backend handles it)
              // This is just to keep UI consistent - the actual data is in the database
            } else {
              // Remove current user from likes array
            }
          }
        }
      });
  },
});

export default productSlice.reducer;
