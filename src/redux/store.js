// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice'; // Import the search reducer

export const store = configureStore({
  reducer: {
    search: searchReducer, // Include the search slice
  },
});

export default store;
