import React, { useState } from "react";
import { BiChevronRight, BiCalendarCheck, BiBuildings, BiCheck, BiPencil, BiTrash, BiEnvelope } from "react-icons/bi";
import StatusBadge from "./StatusBadge";
import { format, isPast, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateInvoiceStatus, deleteInvoice } from "../store/invoicesSlice";
import { toggleModal } from "../store/modalSlice";
import toast from 'react-hot-toast';
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EmailInvoiceModal from "./EmailInvoiceModal";

const InvoiceItem = ({ invoice, isBulkMode = false, isSelected = false, onToggleSelect }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { symbol = '£' } = useSelector(state => state.settings?.currency || { symbol: '£' });
    const { theme } = useSelector(state => state.theme);
    const { currentWorkspace } = useSelector(state => state.workspaces);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    // Check if payment is overdue
    const isOverdue = invoice.status === 'pending' && isPast(new Date(invoice.paymentDue)) && !isToday(new Date(invoice.paymentDue));

    // Format the date with "Today" or "Overdue" text if applicable
    const formatDueDate = () => {
        if (isToday(new Date(invoice.paymentDue))) {
            return "Due Today";
        } else if (isOverdue) {
            return `Overdue (${format(new Date(invoice.paymentDue), 'dd MMM yyyy')})`;
        } else {
            return `Due ${format(new Date(invoice.paymentDue), 'dd MMM yyyy')}`;
        }
    };

    // Handle click events based on mode
    const handleItemClick = (e) => {
        if (isBulkMode) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect(invoice.id);
        } else {
            navigate(`/invoice/${invoice.id}`);
        }
    };

    // Handle checkbox click without navigating
    const handleCheckboxClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleSelect(invoice.id);
    };

    // Quick action handlers
    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleModal({
            type: 'editInvoice',
            id: invoice.id,
            ...invoice
        }));
    };

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteInvoice({
            id: invoice.id,
            workspaceId: invoice.workspaceId || currentWorkspace?.id || 'default'
        }));
        toast.success('Invoice deleted');
        setIsDeleteModalOpen(false);
    };

    const handleEmailInvoice = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEmailModalOpen(true);
    };

    return (
        <>
            <div
                className={`w-full bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md border-l-4 ${isSelected
                    ? "border-[#7C5DFA]"
                    : "border-transparent hover:border-l-4 hover:border-[#7C5DFA]"
                    } group ${isSelected ? "ring-2 ring-[#7C5DFA] ring-opacity-30" : ""} relative`}
                onClick={handleItemClick}
                style={{
                    boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.02)'
                }}
            >
                {/* Desktop Layout */}
                <div className="hidden md:flex md:flex-row md:justify-between md:items-center w-full">
                    {isBulkMode && (
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 border-2 transition-colors duration-200 ${isSelected
                                ? "bg-[#7C5DFA] border-[#7C5DFA]"
                                : "border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input"
                                }`}
                            onClick={handleCheckboxClick}
                        >
                            {isSelected && <BiCheck className="text-white" />}
                        </div>
                    )}

                    <div className="flex items-center gap-3 flex-shrink-0 min-w-[120px]">
                        <h1 className="text-[15px] font-bold text-light-text dark:text-dark-text transition-colors duration-200">#{invoice.id}</h1>
                        {invoice.projectDescription && (
                            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary bg-light-bg/50 dark:bg-dark-bg/50 px-2 py-1 rounded-full truncate max-w-[120px] transition-colors duration-200 group-hover:bg-light-bg dark:group-hover:bg-dark-bg/70">
                                {invoice.projectDescription}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 min-w-[140px]">
                        <BiCalendarCheck className="text-[#7C5DFA]" />
                        <p className={`text-[13px] ${isOverdue ? 'text-[#EC5757] font-bold' : 'text-light-text-secondary dark:text-dark-text-secondary'} transition-colors duration-200`}>
                            {formatDueDate()}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 min-w-[120px] max-w-[150px]">
                        <BiBuildings className="text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200" />
                        <p className="text-[14px] text-light-text-secondary dark:text-dark-text-secondary truncate transition-colors duration-200">{invoice.clientName || 'No Client'}</p>
                    </div>

                    <h1 className="text-[15px] font-bold text-light-text dark:text-dark-text transition-colors duration-200 flex-shrink-0 min-w-[70px]">{symbol} {(invoice.total || 0).toFixed(2)}</h1>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={invoice.status} size="small" />
                    </div>

                    {/* Action buttons inside the row */}
                    {!isBulkMode && (
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <button
                                onClick={handleEdit}
                                className="p-1.5 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] hover:bg-light-bg dark:hover:bg-dark-border transition-colors"
                                title="Edit Invoice"
                            >
                                <BiPencil size={18} />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] hover:bg-light-bg dark:hover:bg-dark-border transition-colors"
                                title="Delete Invoice"
                            >
                                <BiTrash size={18} />
                            </button>
                            <button
                                onClick={handleEmailInvoice}
                                className="p-1.5 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:text-[#33D69F] hover:bg-light-bg dark:hover:bg-dark-border transition-colors"
                                title="Email Invoice"
                            >
                                <BiEnvelope size={18} />
                            </button>
                            <span className="text-[#7C5DFA] ml-1">
                                <BiChevronRight size={24} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </div>
                    )}
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden w-full">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            {isBulkMode && (
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 border-2 transition-colors duration-200 ${isSelected
                                        ? "bg-[#7C5DFA] border-[#7C5DFA]"
                                        : "border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input"
                                        }`}
                                    onClick={handleCheckboxClick}
                                >
                                    {isSelected && <BiCheck className="text-white" />}
                                </div>
                            )}

                            <h1 className="text-[15px] font-bold text-light-text dark:text-dark-text transition-colors duration-200">#{invoice.id}</h1>
                            {invoice.projectDescription && (
                                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary bg-light-bg/50 dark:bg-dark-bg/50 px-2 py-1 rounded-full truncate max-w-[100px] transition-colors duration-200 group-hover:bg-light-bg dark:group-hover:bg-dark-bg/70">
                                    {invoice.projectDescription}
                                </span>
                            )}
                        </div>
                        <p className="text-[14px] text-light-text-secondary dark:text-dark-text-secondary truncate max-w-[120px] transition-colors duration-200">{invoice.clientName || 'No Client'}</p>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <p className={`text-[13px] flex items-center gap-1 ${isOverdue ? 'text-[#EC5757] font-bold' : 'text-light-text-secondary dark:text-dark-text-secondary'} transition-colors duration-200`}>
                                <BiCalendarCheck className={isOverdue ? 'text-[#EC5757]' : 'text-[#7C5DFA]'} />
                                {formatDueDate()}
                            </p>
                            <h1 className="text-[15px] font-bold text-light-text dark:text-dark-text transition-colors duration-200">
                                {symbol} {(invoice.total || 0).toFixed(2)}
                            </h1>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={invoice.status} size="small" />

                            {/* Mobile Action Buttons */}
                            {!isBulkMode && (
                                <div className="flex mt-2 gap-1 items-center">
                                    <button
                                        onClick={handleEdit}
                                        className="p-1 bg-light-bg dark:bg-dark-border rounded-full text-light-text-secondary dark:text-dark-text-secondary"
                                        title="Edit Invoice"
                                    >
                                        <BiPencil size={14} />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-1 bg-light-bg dark:bg-dark-border rounded-full text-light-text-secondary dark:text-dark-text-secondary"
                                        title="Delete Invoice"
                                    >
                                        <BiTrash size={14} />
                                    </button>
                                    <button
                                        onClick={handleEmailInvoice}
                                        className="p-1 bg-light-bg dark:bg-dark-border rounded-full text-light-text-secondary dark:text-dark-text-secondary"
                                        title="Email Invoice"
                                    >
                                        <BiEnvelope size={14} />
                                    </button>
                                    <BiChevronRight size={18} className="text-[#7C5DFA] group-hover:translate-x-1 transition-transform duration-300 ml-1" />
                                </div>
                            )}
                        </div>
                    </div>
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
    );
};

export default InvoiceItem;
