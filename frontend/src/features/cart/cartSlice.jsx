import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../../services/api";

// Async thunk to fetch cart from backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        return { cartItems: [] };
      }
      const { data } = await API.get("/cart");
      return data;
    } catch (err) {
      console.error("Fetch cart error:", err);
      return rejectWithValue(
        err.response?.data || { message: "Failed to fetch cart" },
      );
    }
  },
);

// Async thunk to add to cart on backend
export const addToCartBackend = createAsyncThunk(
  "cart/addToBackend",
  async ({ productId, quantity }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        return rejectWithValue({ message: "User not logged in" });
      }

      console.log("Adding to cart:", { productId, quantity });
      const { data } = await API.post("/cart", { productId, quantity });
      console.log("Add to cart response:", data);
      return data;
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { message: "Failed to add to cart" },
      );
    }
  },
);

// Async thunk to update cart item
export const updateCartItemBackend = createAsyncThunk(
  "cart/updateBackend",
  async ({ id, quantity }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        return rejectWithValue({ message: "User not logged in" });
      }

      const { data } = await API.put(`/cart/${id}`, { quantity });
      return data;
    } catch (err) {
      console.error("Update cart error:", err);
      return rejectWithValue(
        err.response?.data || { message: "Update failed" },
      );
    }
  },
);

// Async thunk to remove from cart
export const removeFromCartBackend = createAsyncThunk(
  "cart/removeFromBackend",
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        return rejectWithValue({ message: "User not logged in" });
      }

      const { data } = await API.delete(`/cart/${id}`);
      return data;
    } catch (err) {
      console.error("Remove from cart error:", err);
      return rejectWithValue(
        err.response?.data || { message: "Remove failed" },
      );
    }
  },
);

// Async thunk to sync cart with backend
export const syncCartWithBackend = createAsyncThunk(
  "cart/syncWithBackend",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, cart } = getState();
      if (!auth.user) {
        return { cartItems: [] };
      }

      const { data } = await API.post("/cart/sync", { localCart: cart.items });
      return data;
    } catch (err) {
      console.error("Sync cart error:", err);
      return rejectWithValue(err.response?.data || { message: "Sync failed" });
    }
  },
);

const initialState = {
  items: JSON.parse(localStorage.getItem("cartItems") || "[]"),
  totalAmount: 0,
  loading: false,
  error: null,
};

// Calculate total amount
const calculateTotal = (items) => {
  return items.reduce(
    (acc, item) =>
      acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  );
};

// Initialize total amount
initialState.totalAmount = calculateTotal(initialState.items);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Local cart operations (for guests)
    addToCartLocal: (state, action) => {
      const newItem = action.payload;
      const itemId = newItem._id || newItem.id;
      const existingItem = state.items.find(
        (item) => (item._id || item.id) === itemId,
      );

      if (!existingItem) {
        if (newItem.countInStock > 0) {
          state.items.push({
            ...newItem,
            quantity: 1,
            _id: newItem._id || newItem.id,
            id: newItem.id || newItem._id,
          });
        }
      } else {
        if (existingItem.quantity < newItem.countInStock) {
          existingItem.quantity += 1;
        } else {
          state.error = { message: "Cannot add more than available stock!" };
        }
      }

      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    removeFromCartLocal: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => (item._id || item.id) !== id);
      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    updateQuantityLocal: (state, action) => {
      const { id, amount } = action.payload;
      const item = state.items.find((i) => (i._id || i.id) === id);

      if (item) {
        const newQuantity = item.quantity + amount;
        if (newQuantity <= 0) {
          state.items = state.items.filter((i) => (i._id || i.id) !== id);
        } else if (newQuantity <= item.countInStock) {
          item.quantity = newQuantity;
        } else {
          state.error = {
            message: `Only ${item.countInStock} items available!`,
          };
        }

        state.totalAmount = calculateTotal(state.items);
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      localStorage.removeItem("cartItems");
    },

    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.cartItems) {
          state.items = action.payload.cartItems.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            _id: item.product._id,
          }));
          state.totalAmount = calculateTotal(state.items);
          localStorage.setItem("cartItems", JSON.stringify(state.items));
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to cart backend
      .addCase(addToCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.cartItems) {
          state.items = action.payload.cartItems.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            _id: item.product._id,
          }));
          state.totalAmount = calculateTotal(state.items);
          localStorage.setItem("cartItems", JSON.stringify(state.items));
        }
      })
      .addCase(addToCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update cart backend
      .addCase(updateCartItemBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemBackend.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.cartItems) {
          state.items = action.payload.cartItems.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            _id: item.product._id,
          }));
          state.totalAmount = calculateTotal(state.items);
          localStorage.setItem("cartItems", JSON.stringify(state.items));
        }
      })
      .addCase(updateCartItemBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from cart backend
      .addCase(removeFromCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.cartItems) {
          state.items = action.payload.cartItems.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            _id: item.product._id,
          }));
          state.totalAmount = calculateTotal(state.items);
          localStorage.setItem("cartItems", JSON.stringify(state.items));
        }
      })
      .addCase(removeFromCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Sync cart
      .addCase(syncCartWithBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartWithBackend.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.cartItems) {
          state.items = action.payload.cartItems.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            _id: item.product._id,
          }));
          state.totalAmount = calculateTotal(state.items);
          localStorage.setItem("cartItems", JSON.stringify(state.items));
        }
      })
      .addCase(syncCartWithBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export all actions
export const {
  addToCartLocal,
  removeFromCartLocal,
  updateQuantityLocal,
  clearCart,
  clearCartError,
} = cartSlice.actions;

// Add alias for backward compatibility
export const addToCart = addToCartLocal;

export default cartSlice.reducer;
