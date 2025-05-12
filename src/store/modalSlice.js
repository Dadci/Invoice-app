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
            // Toggle modal state
            state.isOpen = !state.isOpen

            if (action.payload) {
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
                state.editingInvoice = null
                state.projectToInvoice = null
            }
        }
    }
})

export const { toggleModal } = modalSlice.actions
export default modalSlice.reducer