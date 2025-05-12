import { createSlice } from '@reduxjs/toolkit'

const modalSlice = createSlice({
    name: 'modal',
    initialState: {
        isOpen: false,
        editingInvoice: null,
        projectToInvoice: null
    },
    reducers: {
        toggleModal: (state, action) => {
            // Check how the action was dispatched
            if (action.payload && action.payload.type === 'addInvoice') {
                // For the "New Invoice" button case
                state.isOpen = true
                state.editingInvoice = null
                state.projectToInvoice = null
            } else if (action.payload) {
                // Toggle modal state
                state.isOpen = !state.isOpen

                // Reset previous values
                state.editingInvoice = null
                state.projectToInvoice = null

                // Check if we're editing an invoice or creating from a project
                if (action.payload.id) {
                    state.editingInvoice = action.payload
                } else if (action.payload.projectToInvoice) {
                    state.projectToInvoice = action.payload.projectToInvoice
                }
            } else {
                // Reset when closing
                state.isOpen = false
                state.editingInvoice = null
                state.projectToInvoice = null
            }
        }
    }
})

export const { toggleModal } = modalSlice.actions
export default modalSlice.reducer