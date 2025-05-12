import React, { useState } from 'react'
import { BiChevronRight } from 'react-icons/bi'
import { FiDownload, FiEye, FiMail, FiCheck } from 'react-icons/fi'
import StatusBadge from './StatusBadge'
import { useDispatch, useSelector } from 'react-redux'
import { updateInvoiceStatus, deleteInvoice } from '../store/invoicesSlice'
import { toggleModal } from '../store/modalSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import EmailInvoiceModal from './EmailInvoiceModal'

const InvoiceActionBar = ({ invoice, onExportPDF, onPreviewPDF, onTestPDF }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentWorkspace } = useSelector(state => state.workspaces);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

    const handlePaid = () => {
        dispatch(updateInvoiceStatus({
            id: invoice.id,
            status: 'paid',
            workspaceId: invoice.workspaceId || currentWorkspace?.id || 'default'
        }))
        toast.success('Invoice marked as paid')
    }

    const handleSent = () => {
        dispatch(updateInvoiceStatus({
            id: invoice.id,
            status: 'sent',
            workspaceId: invoice.workspaceId || currentWorkspace?.id || 'default'
        }))
        toast.success('Invoice marked as sent')
    }

    const handleDelete = () => {
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = () => {
        dispatch(deleteInvoice({
            id: invoice.id,
            workspaceId: invoice.workspaceId || currentWorkspace?.id || 'default'
        }))
        toast.success('Invoice deleted')
        navigate('/')
        setIsDeleteModalOpen(false)
    }

    const handleEdit = () => {
        dispatch(toggleModal({
            type: 'editInvoice',
            id: invoice.id,
            ...invoice
        }))
    }

    const handleEmailInvoice = () => {
        setIsEmailModalOpen(true)
    }

    // Helper to determine if buttons should be shown based on status
    const shouldShowSentButton = invoice.status === 'pending' || invoice.status === 'draft';
    const shouldShowPaidButton = invoice.status === 'sent' || invoice.status === 'pending';

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:flex justify-between items-center w-full bg-light-card dark:bg-dark-card p-5 rounded-lg shadow-sm mb-4 transition-colors duration-200">
                <div className="flex items-center">
                    <span className="text-sm font-medium mr-4 text-light-text-secondary dark:text-dark-text-secondary">Status</span>
                    <StatusBadge status={invoice.status} />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onPreviewPDF}
                        className="text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg px-4 py-2 rounded-full text-sm font-bold transition-colors"
                    >
                        <FiEye className="inline mr-2" />
                        Preview
                    </button>
                    <button
                        onClick={onExportPDF}
                        className="text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg px-4 py-2 rounded-full text-sm font-bold transition-colors"
                    >
                        <FiDownload className="inline mr-2" />
                        Export
                    </button>
                    <button
                        onClick={handleEmailInvoice}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#33D69F] dark:bg-[#33D69F] text-white rounded-full hover:bg-[#4be0af] dark:hover:bg-[#4be0af] transition-colors shadow-sm"
                    >
                        <FiMail size={16} />
                        <span className="font-bold text-sm">Email Invoice</span>
                    </button>
                    <button
                        className="bg-[#f3f3f3] dark:bg-[#252945] hover:bg-[#f8f8f8] dark:hover:bg-[#353B56] text-light-text-secondary dark:text-dark-text-secondary px-4 py-2 rounded-full text-sm font-bold transition-colors"
                        onClick={handleEdit}
                    >
                        Edit
                    </button>
                    <button
                        className="bg-[#EC5757] hover:bg-[#eb7676] text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                    {shouldShowSentButton && (
                        <button
                            className="bg-[#7C5DFA] hover:bg-[#9b82fc] text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
                            onClick={handleSent}
                        >
                            <FiMail className="inline mr-2" />
                            Mark as Sent
                        </button>
                    )}
                    {shouldShowPaidButton && (
                        <button
                            className="bg-[#33D69F] hover:bg-[#5fe3b7] text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
                            onClick={handlePaid}
                        >
                            <FiCheck className="inline mr-2" />
                            Mark as Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden w-full">
                <div className="flex justify-between items-center bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-sm mb-4 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Status</span>
                        <StatusBadge status={invoice.status} size="small" />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onPreviewPDF}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f3f3f3] dark:bg-[#252945] text-light-text-secondary dark:text-dark-text-secondary hover:bg-[#f8f8f8] dark:hover:bg-[#353B56] transition-colors"
                        >
                            <FiEye size={16} />
                        </button>
                        <button
                            onClick={onExportPDF}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f3f3f3] dark:bg-[#252945] text-light-text-secondary dark:text-dark-text-secondary hover:bg-[#f8f8f8] dark:hover:bg-[#353B56] transition-colors"
                        >
                            <FiDownload size={16} />
                        </button>
                        <button
                            onClick={handleEmailInvoice}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#33D69F] dark:bg-[#33D69F] text-white rounded-full hover:bg-[#4be0af] dark:hover:bg-[#4be0af] transition-colors shadow-sm"
                        >
                            <FiMail size={14} />
                            <span className="font-bold text-xs">Email</span>
                        </button>
                    </div>
                </div>

                {/* Fixed action bar at the bottom */}
                <div className="fixed bottom-0 left-0 right-0 bg-light-card dark:bg-dark-card p-4 shadow-lg flex justify-center gap-2 z-10 transition-colors duration-200">
                    <button
                        className="bg-[#f3f3f3] dark:bg-[#252945] hover:bg-[#f8f8f8] dark:hover:bg-[#353B56] text-light-text-secondary dark:text-dark-text-secondary px-4 py-3 rounded-full text-sm font-bold flex-1 transition-colors"
                        onClick={handleEdit}
                    >
                        Edit
                    </button>
                    <button
                        className="bg-[#EC5757] hover:bg-[#eb7676] text-white px-4 py-3 rounded-full text-sm font-bold flex-1 transition-colors"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                    {shouldShowSentButton && (
                        <button
                            className="bg-[#7C5DFA] hover:bg-[#9b82fc] text-white px-4 py-3 rounded-full text-sm font-bold flex-1 transition-colors"
                            onClick={handleSent}
                        >
                            <FiMail className="inline mr-1" />
                            Sent
                        </button>
                    )}
                    {shouldShowPaidButton && (
                        <button
                            className="bg-[#33D69F] hover:bg-[#5fe3b7] text-white px-4 py-3 rounded-full text-sm font-bold flex-1 transition-colors"
                            onClick={handlePaid}
                        >
                            <FiCheck className="inline mr-1" />
                            Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Delete"
                message={`Are you sure you want to delete invoice #${invoice.id}? This action cannot be undone.`}
            />

            {/* Email Invoice Modal */}
            <EmailInvoiceModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                invoice={invoice}
            />
        </>
    )
}

export default InvoiceActionBar