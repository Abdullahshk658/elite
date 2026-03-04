import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type FiltersState = {
  brand: string;
  size: string;
  minPrice: number | null;
  maxPrice: number | null;
  qualityTag: string;
  sort: string;
};

const initialState: FiltersState = {
  brand: '',
  size: '',
  minPrice: null,
  maxPrice: null,
  qualityTag: '',
  sort: 'newest'
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      Object.assign(state, action.payload);
    },
    clearFilters: () => initialState
  }
});

export const { setFilters, clearFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
