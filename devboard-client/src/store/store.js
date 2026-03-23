import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { taskApi } from './services/taskApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [taskApi.reducerPath]: taskApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(taskApi.middleware),
})