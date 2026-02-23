import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      // MongoDB _id ወይም id መሆኑን ቼክ ያደርጋል
      const itemId = newItem._id || newItem.id;
      const existingItem = state.items.find((item) => (item._id || item.id) === itemId);

      if (!existingItem) {
        state.items.push({ ...newItem, quantity: 1 });
      } else {
        existingItem.quantity++;
      }
      state.totalAmount += newItem.price;
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find((item) => (item._id || item.id) === id);
      
      if (existingItem) {
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => (item._id || item.id) !== id);
      }
    },
    // መጠኑን ለመጨመር ወይም ለመቀነስ (Optional)
    updateQuantity: (state, action) => {
      const { id, amount } = action.payload;
      const item = state.items.find((i) => (i._id || i.id) === id);
      if (item) {
        state.totalAmount += item.price * amount;
        item.quantity += amount;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => (i._id || i.id) !== id);
        }
      }
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;