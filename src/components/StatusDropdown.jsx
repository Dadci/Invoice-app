import React, { useState, useRef, useEffect } from 'react';
import { BiChevronDown, BiCheck } from 'react-icons/bi';
import { useDispatch } from 'react-redux';
import { updateInvoiceStatus } from '../store/invoicesSlice';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';

const StatusDropdown = ({ invoice }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();

    const statuses = [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (newStatus) => {
        if (newStatus !== invoice.status) {
            dispatch(updateInvoiceStatus({
                id: invoice.id,
                status: newStatus
            }));

            // Show different toast messages based on status
            switch (newStatus) {
                case 'paid':
                    toast.success('Invoice marked as paid');
                    break;
                case 'sent':
                    toast.success('Invoice marked as sent');
                    break;
                case 'pending':
                    toast.success('Invoice marked as pending');
                    break;
                case 'draft':
                    toast.success('Invoice marked as draft');
                    break;
                default:
                    toast.success('Invoice status updated');
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-light-bg dark:bg-dark-bg rounded-md border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
            >
                <StatusBadge status={invoice.status} size="small" />
                <BiChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute mt-2 left-0 min-w-[160px] bg-light-card dark:bg-dark-card rounded-md shadow-md border border-light-border dark:border-dark-border z-10">
                    <ul className="py-1">
                        {statuses.map((status) => (
                            <li key={status.value}>
                                <button
                                    onClick={() => handleStatusChange(status.value)}
                                    className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
                                >
                                    <StatusBadge status={status.value} size="small" />
                                    {invoice.status === status.value && (
                                        <BiCheck className="ml-auto text-[#7C5DFA]" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StatusDropdown; 