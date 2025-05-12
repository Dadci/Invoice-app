import { createSlice } from '@reduxjs/toolkit'

// Get initial theme without touching DOM or localStorage
// We'll use ThemeInitializer to synchronize with localStorage
const initialState = {
    theme: '' // Start empty and let ThemeInitializer handle initialization
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark'
            // Don't manipulate DOM or localStorage here
            // Let the ThemeInitializer handle that
        },
        setTheme: (state, action) => {
            state.theme = action.payload
            // Don't manipulate DOM or localStorage here
            // Let the ThemeInitializer handle that
        }
    }
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer 