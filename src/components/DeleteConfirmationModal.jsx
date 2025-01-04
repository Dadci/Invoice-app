import React from 'react'

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, invoiceId }) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/70 z-40"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[420px] md:w-[480px]  p-8">
                <h2 className="text-2xl font-bold text-[#0C0E16] mb-4">Confirm Deletion</h2>
                <p className="text-[#888EB0] mb-6">
                    Are you sure you want to delete invoice #{invoiceId}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-[#F9FAFE] text-[#7C5DFA] rounded-full font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-3 bg-[#EC5757] hover:bg-[#FF9797] text-white rounded-full font-bold"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </>
    )
}

export default DeleteConfirmationModal