import React, { useState } from 'react'
import { BiChevronRight } from 'react-icons/bi'
import StatusBadge from './StatusBadge'
import { useDispatch } from 'react-redux'
import { updateInvoiceStatus, deleteInvoice } from '../store/invoicesSlice'
import { toggleModal } from '../store/modalSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DeleteConfirmationModal from './DeleteConfirmationModal'

const InvoiceActionBar = ({ invoice }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const handlePaid = () => {
        dispatch(updateInvoiceStatus({
            id: invoice.id,
            status: 'paid'
        }))
        toast.success('Invoice marked as paid')
    }

    const handleDelete = () => {
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = () => {
        dispatch(deleteInvoice(invoice.id))
        toast.success('Invoice deleted')
        navigate('/')
        setIsDeleteModalOpen(false)
    }

    const handleEdit = () => {
        
        dispatch(toggleModal(invoice))
    }

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:flex max-w-3xl bg-white p-6 rounded-lg shadow-sm justify-between items-center">
                <div className='flex items-center gap-5'>
                    <h1 className="text-[13px] font-medium text-[#888EB0]">Status</h1>
                    <StatusBadge status={invoice.status} />
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        className="bg-[#f3f3f3] hover:bg-[#f8f8f8] text-[#888EB0] px-6 py-3 rounded-full text-sm font-bold"
                        onClick={handleEdit}
                    >
                        Edit
                    </button>
                    <button
                        className="bg-[#EC5757] hover:bg-[#eb7676] text-white px-6 py-3 rounded-full text-sm font-bold"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                    {invoice.status !== 'paid' && (
                        <button
                            className="bg-[#7C5DFA] hover:bg-[#9b82fc] text-white px-6 py-3 rounded-full text-sm font-bold"
                            onClick={handlePaid}
                        >
                            Mark as Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden w-full">
               
                <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
                    <div className='flex items-center justify-between gap-4'>
                        <h1 className="text-[13px] font-medium text-[#888EB0]">Status</h1>
                        <StatusBadge status={invoice.status} />
                    </div>
                </div>

              
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-center gap-2">
                    <button
                        className="bg-[#f3f3f3] hover:bg-[#f8f8f8] text-[#888EB0] px-4 py-3 rounded-full text-sm font-bold flex-1"
                        onClick={handleEdit}
                    >
                        Edit
                    </button>
                    <button
                        className="bg-[#EC5757] hover:bg-[#eb7676] text-white px-4 py-3 rounded-full text-sm font-bold flex-1"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                    {invoice.status !== 'paid' && (
                        <button
                            className="bg-[#7C5DFA] hover:bg-[#9b82fc] text-white px-4 py-3 rounded-full text-sm font-bold flex-1"
                            onClick={handlePaid}
                        >
                            Mark as Paid
                        </button>
                    )}
                </div>
                
            </div>

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                invoiceId={invoice.id}
            />
        </>
    )
}

export default InvoiceActionBar