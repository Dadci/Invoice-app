import React from 'react'

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title = "Confirm Deletion", message }) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-200"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark-card rounded-lg shadow-xl z-50 w-[420px] md:w-[480px] p-8 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-[#0C0E16] dark:text-white mb-4 transition-colors duration-200">{title}</h2>
                <p className="text-[#888EB0] dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                    {message}
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-[#F9FAFE] dark:bg-[#252945] text-[#7C5DFA] rounded-full font-bold hover:bg-[#DFE3FA] dark:hover:bg-[#353B56] transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-3 bg-[#EC5757] hover:bg-[#FF9797] text-white rounded-full font-bold transition-colors duration-200"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </>
    )
}

export default DeleteConfirmationModal