import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bulkDeleteInvoices } from '../store/invoicesSlice';
import toast from 'react-hot-toast';

const BulkDeleteModal = ({ isOpen, onClose, selectedInvoices }) => {
    const dispatch = useDispatch();
    const { currentWorkspace } = useSelector(state => state.workspaces);

    if (!isOpen) return null;

    const handleConfirmDelete = () => {
        if (selectedInvoices.length === 0) {
            toast.error('No invoices selected');
            return;
        }

        // Use the bulkDeleteInvoices action to delete all selected invoices at once
        // with the correct workspace ID
        dispatch(bulkDeleteInvoices({
            ids: selectedInvoices,
            workspaceId: currentWorkspace?.id || 'default'
        }));

        toast.success(`${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? 's' : ''} deleted`);
        onClose();
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-200"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark-card rounded-lg shadow-xl z-50 w-[420px] md:w-[480px] p-8 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-[#0C0E16] dark:text-white mb-4 transition-colors duration-200">Bulk Delete Invoices</h2>

                <p className="text-[#888EB0] dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                    Are you sure you want to delete {selectedInvoices.length} selected invoice{selectedInvoices.length > 1 ? 's' : ''}? This action cannot be undone.
                </p>

                {selectedInvoices.length > 0 && (
                    <div className="mb-6 max-h-[150px] overflow-y-auto bg-[#F9FAFE] dark:bg-[#252945] rounded-lg p-3 transition-colors duration-200">
                        <p className="text-[#888EB0] dark:text-dark-text-secondary font-medium mb-2 transition-colors duration-200">Selected invoices:</p>
                        <ul className="space-y-1">
                            {selectedInvoices.map(invoiceId => (
                                <li key={invoiceId} className="text-sm text-light-text dark:text-dark-text transition-colors duration-200">
                                    #{invoiceId}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-[#F9FAFE] dark:bg-[#252945] text-[#7C5DFA] rounded-full font-bold hover:bg-[#DFE3FA] dark:hover:bg-[#353B56] transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="px-6 py-3 bg-[#EC5757] hover:bg-[#FF9797] text-white rounded-full font-bold transition-colors duration-200"
                    >
                        Delete All
                    </button>
                </div>
            </div>
        </>
    );
};

export default BulkDeleteModal; 