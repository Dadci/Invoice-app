import { configureStore } from '@reduxjs/toolkit'
import invoicesReducer from './invoicesSlice'
import modalReducer from './modalSlice'
import settingsReducer from './settingsSlice'
import themeReducer from './themeSlice'
import projectsReducer from './projectsSlice'
import notificationsReducer from './notificationsSlice'
import workspacesReducer from './workspacesSlice'

export const store = configureStore({
    reducer: {
        invoices: invoicesReducer,
        modal: modalReducer,
        settings: settingsReducer,
        theme: themeReducer,
        projects: projectsReducer,
        notifications: notificationsReducer,
        workspaces: workspacesReducer
    }
})

export default store
