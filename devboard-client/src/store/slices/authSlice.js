import { createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  user:        null,
  accessToken: null,
  loading:     true,  
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    setCredentials: (state, action) => {
      state.user        = action.payload.user
      state.accessToken = action.payload.accessToken
      state.loading     = false
      api.defaults.headers.common['Authorization'] =
        `Bearer ${action.payload.accessToken}`
    },

    clearCredentials: (state) => {
      state.user        = null
      state.accessToken = null
      state.loading     = false
      delete api.defaults.headers.common['Authorization']
    },


    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions


export const selectUser            = (state) => state.auth.user
export const selectAccessToken     = (state) => state.auth.accessToken
export const selectIsAuthenticated = (state) => !!state.auth.user
export const selectAuthLoading     = (state) => state.auth.loading

export default authSlice.reducer