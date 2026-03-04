import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  token: string | null;
  user: { id: string; name: string; email: string; isAdmin: boolean } | null;
};

const initialState: AuthState = {
  token: null,
  user: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState['user'] }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: () => initialState
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
