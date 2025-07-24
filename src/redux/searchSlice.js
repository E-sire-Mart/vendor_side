// src/redux/searchSlice.js
import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    searchText: '', // Initial search state
  },
  reducers: {
    setSearchText: (state, action) => {
      state.searchText = action.payload; // Update search text in state
    },
  },
});

// Export actions
export const { setSearchText } = searchSlice.actions;

// Export reducer
export default searchSlice.reducer;
