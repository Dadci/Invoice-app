import { configureStore } from '@reduxjs/toolkit'
import modalReducer from './modalSlice'
import invoiceReducer from './invoicesSlice'

export const store = configureStore({
    reducer: {
        modal: modalReducer,
        invoices: invoiceReducer
    }
})
