import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../../services/api";
import { syncCartWithBackend } from "../cart/cartSlice"; // Import the sync action

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post("/auth/register", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Registration failed" },
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.post("/auth/login", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Sync cart after login - get items from localStorage
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        if (cartItems.length > 0) {
          await dispatch(syncCartWithBackend()).unwrap();
        }
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  },
);

export const getUserProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/auth/profile");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Failed to get profile" },
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Keep cart items in localStorage for next login (don't clear them)
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
