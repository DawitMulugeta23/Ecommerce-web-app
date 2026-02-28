import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ከባክአንድ ካርቱን ለመሳብ
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get("/api/cart", config);
      return data.cartItems;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalAmount: 0,
    status: "idle",
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.totalAmount = action.payload.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0,
      );
    });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
