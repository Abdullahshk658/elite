import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  qty: number;
  price: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existing = state.items.find(
        (entry) => entry.productId === item.productId && entry.size === item.size
      );
      if (existing) {
        existing.qty += item.qty;
      } else {
        state.items.push(item);
      }
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; size: string }>
    ) => {
      state.items = state.items.filter(
        (entry) =>
          !(entry.productId === action.payload.productId && entry.size === action.payload.size)
      );
    },
    updateQty: (
      state,
      action: PayloadAction<{ productId: string; size: string; qty: number }>
    ) => {
      const item = state.items.find(
        (entry) =>
          entry.productId === action.payload.productId && entry.size === action.payload.size
      );
      if (item) {
        item.qty = Math.max(1, action.payload.qty);
      }
    },
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
