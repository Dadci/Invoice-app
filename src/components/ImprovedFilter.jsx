import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, setClientFilter, clearInvoiceFilters } from '../store/invoicesSlice';
import { motion } from 'framer-motion';
import { BiX, BiChevronDown } from 'react-icons/bi';
import { FiChevronDown } from 'react-icons/fi';

const ImprovedFilter = ({ closeFilters }) => {
    const dispatch = useDispatch();
    const filter = useSelector(state => state.invoices.filter);
    const clientFilter = useSelector(state => state.invoices.clientFilter);
    const invoices = useSelector(state => state.invoices.invoices);

    const [showClientDropdown, setShowClientDropdown] = useState(false);

    // Extract unique client names for filtering
    const clientOptions = useMemo(() => {
        const clientNames = new Set();
        invoices.forEach(invoice => {
            if (invoice.clientName) {
                clientNames.add(invoice.clientName);
            }
        });
        return [...clientNames].sort();
    }, [invoices]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filter !== 'all') count++;
        if (clientFilter !== 'all') count++;
        return count;
    }, [filter, clientFilter]);

    const handleStatusFilterChange = (newFilter) => {
        dispatch(setFilter(newFilter));
    };

    const handleClientFilterChange = (clientName) => {
        dispatch(setClientFilter(clientName));
        setShowClientDropdown(false);
    };

    const handleClearFilters = () => {
        dispatch(clearInvoiceFilters());
    };

    const getSelectedClientName = () => {
        if (clientFilter === 'all') return 'All Clients';
        return clientFilter;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-5 mb-6 flex flex-wrap gap-4 items-center transition-colors duration-200"
        >
            <div>
                <label className="block text-xs font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
                    Status
                </label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleStatusFilterChange("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "all"
                            ? "bg-[#7C5DFA] text-white"
                            : "bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleStatusFilterChange("draft")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "draft"
                            ? "bg-[#373B53] dark:bg-[#DFE3FA]/40 text-white dark:text-dark-text"
                            : "bg-light-bg dark:bg-dark-bg text-[#373B53] dark:text-[#DFE3FA]"
                            }`}
                    >
                        Draft
                    </button>
                    <button
                        onClick={() => handleStatusFilterChange("pending")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "pending"
                            ? "bg-[#FF8F00] text-white"
                            : "bg-light-bg dark:bg-dark-bg text-[#FF8F00]"
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => handleStatusFilterChange("paid")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "paid"
                            ? "bg-[#33D69F] text-white"
                            : "bg-light-bg dark:bg-dark-bg text-[#33D69F]"
                            }`}
                    >
                        Paid
                    </button>
                </div>
            </div>

            {clientOptions.length > 0 && (
                <div className="min-w-[180px]">
                    <label className="block text-xs font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
                        Client
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowClientDropdown(!showClientDropdown)}
                            className="w-full flex items-center justify-between bg-light-bg dark:bg-dark-bg rounded-md p-2 text-sm text-light-text dark:text-dark-text"
                        >
                            <span>{getSelectedClientName()}</span>
                            <FiChevronDown className={`transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showClientDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-light-bg dark:bg-dark-bg rounded-md shadow-lg py-1 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => handleClientFilterChange('all')}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border ${clientFilter === 'all' ? 'bg-light-border dark:bg-dark-border font-medium' : ''}`}
                                >
                                    All Clients
                                </button>
                                {clientOptions.map(clientName => (
                                    <button
                                        key={clientName}
                                        onClick={() => handleClientFilterChange(clientName)}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border ${clientFilter === clientName ? 'bg-light-border dark:bg-dark-border font-medium' : ''}`}
                                    >
                                        {clientName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="ml-auto flex items-center gap-3">
                {activeFilterCount > 0 && (
                    <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-1 text-sm text-[#7C5DFA] hover:text-[#9277FF] transition-colors duration-200"
                    >
                        <BiX size={18} />
                        Clear filters
                    </button>
                )}

                <button
                    onClick={closeFilters}
                    className="flex items-center justify-center w-8 h-8 text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border rounded-full transition-colors duration-200"
                >
                    <BiX size={20} />
                </button>
            </div>
        </motion.div>
    );
};

export default ImprovedFilter; 