import { createSlice } from '@reduxjs/toolkit';

const cartFromStorage = localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      :[];
      const initialTotal = cartFromStorage.reduce((acc, item) => acc + item.price * item.quantity, 0)
     
const initialState = {
  items: cartFromStorage,
  totalAmount: initialTotal,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {

    addToCart: (state, action) => {
      const newItem = action.payload;
      const itemId = newItem._id || newItem.id;
      const existingItem = state.items.find((item) => (item._id || item.id) === itemId);

      if (!existingItem) {
        // ገና ከሆነ 1 እንጨምራለን (ክምችት ካለ ብቻ)
        if (newItem.countInStock > 0) {
          state.items.push({ ...newItem, quantity: 1 });
          state.totalAmount += newItem.price;
        }
      } else {
        // ቀድሞ ካለ፣ መጠኑ ከክምችቱ (countInStock) ያነሰ መሆኑን እናረጋግጣለን
        if (existingItem.quantity < newItem.countInStock) {
          existingItem.quantity++;
          state.totalAmount += newItem.price;
        } else {
          alert("ከክምችት በላይ ማዘዝ አይቻልም!");
        }
      }
      state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find((item) => (item._id || item.id) === id);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
      if (existingItem) {
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => (item._id || item.id) !== id);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      localStorage.removeItem('cartItems');
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
        state.totalAmount = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;