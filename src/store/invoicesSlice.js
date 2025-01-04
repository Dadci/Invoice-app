import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    invoices: [],
    status: 'idle',
    error: null,
    filter: 'all' // Add filter state
}

const invoiceSlice = createSlice({
    name: 'invoices',
    initialState,
    reducers: {
        addInvoice: (state, action) => {
            const invoiceNumber = `RT${Math.floor(Math.random() * 9000) + 1000}`
            state.invoices.push({
                ...action.payload,
                id: invoiceNumber,
                status: action.payload.isDraft ? 'draft' : 'pending'
            })
        },
        updateInvoiceStatus: (state, action) => {
            const invoice = state.invoices.find(inv => inv.id === action.payload.id)
            if (invoice) {
                invoice.status = action.payload.status
            }
        },
        setFilter: (state, action) => {
            state.filter = action.payload
        },
        deleteInvoice: (state, action) => {
            state.invoices = state.invoices.filter(inv => inv.id !== action.payload)
        },
        editInvoice: (state, action) => {
            const index = state.invoices.findIndex(inv => inv.id === action.payload.id)
            if (index !== -1) {
                state.invoices[index] = action.payload
            }
        }
    }
})

export const { addInvoice, updateInvoiceStatus, setFilter, deleteInvoice, editInvoice } = invoiceSlice.actions
export default invoiceSlice.reducer