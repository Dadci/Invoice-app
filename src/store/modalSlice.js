import { createSlice } from '@reduxjs/toolkit'

const modalSlice = createSlice({
    name: 'modal',
    initialState: {
        isOpen: false,
        editingInvoice: null
    },
    reducers: {
        toggleModal: (state, action) => {
            state.isOpen = !state.isOpen
            state.editingInvoice = action.payload
        }
    }
})

export const { toggleModal } = modalSlice.actions
export default modalSlice.reducer