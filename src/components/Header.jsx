import React, { useState, useMemo } from "react";
import { BiChevronDown, BiPlus, BiSearch, BiFilter, BiX } from "react-icons/bi";
import { useDispatch, useSelector } from 'react-redux'
import { toggleModal } from '../store/modalSlice'
import { setSearchQuery, clearInvoiceFilters } from '../store/invoicesSlice'
import ImprovedFilter from "./ImprovedFilter";
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/animations';
import NotificationIcon from "./NotificationIcon";
import GenerateInvoiceButton from './GenerateInvoiceButton';

const Header = () => {
    const dispatch = useDispatch();
    const invoices = useSelector(state => state.invoices.invoices);
    const searchQuery = useSelector(state => state.invoices.searchQuery || '');
    const filter = useSelector(state => state.invoices.filter);
    const clientFilter = useSelector(state => state.invoices.clientFilter);

    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filter !== 'all') count++;
        if (clientFilter !== 'all') count++;
        if (searchQuery.trim()) count++;
        return count;
    }, [filter, clientFilter, searchQuery]);

    const handleSearchChange = (e) => {
        dispatch(setSearchQuery(e.target.value));
    };

    const handleClearSearch = () => {
        dispatch(setSearchQuery(''));
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col gap-3 sm:p-3 md:p-0 sm:mt-2 sticky top-0 z-10"
        >
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3 bg-light-bg dark:bg-dark-bg p-2 sm:p-3 rounded-lg shadow-sm">
                <div className="hidden">
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Invoices</h1>
                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium mt-1 transition-colors duration-200">
                        {invoices.length} total invoices
                    </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-3">
                    {/* Search box - Mobile version (icon only) */}
                    <div className="relative sm:hidden">
                        <button
                            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                            className="p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                            aria-label="Search"
                        >
                            <BiSearch size={20} />
                        </button>
                    </div>

                    {/* Search box - Desktop version (always visible) */}
                    <div className="hidden sm:flex items-center relative">
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full py-2 pl-10 pr-4 w-full md:w-64 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] transition-colors duration-200"
                        />
                        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" size={20} />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors duration-200"
                            >
                                <BiX size={16} />
                            </button>
                        )}
                    </div>

                    {/* Notification Icon */}
                    <NotificationIcon />

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="relative flex items-center gap-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full py-2 px-4 text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                    >
                        <BiFilter size={18} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#7C5DFA] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* Generate Invoice Button */}
                    <GenerateInvoiceButton />

                    <button
                        onClick={() => dispatch(toggleModal({ type: 'addInvoice' }))}
                        className="bg-[#7C5DFA] hover:bg-[#9277FF] text-white py-2 px-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                        <BiPlus size={20} />
                        <span className="hidden sm:inline">New Invoice</span>
                    </button>
                </div>
            </div>

            {/* Expanded search box for mobile */}
            {isSearchExpanded && (
                <div className="sm:hidden w-full mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full py-2 pl-10 pr-4 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] transition-colors duration-200"
                            autoFocus
                        />
                        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" size={20} />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors duration-200"
                            >
                                <BiX size={16} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Improved Filter Panel */}
            {showFilters && <ImprovedFilter closeFilters={() => setShowFilters(false)} />}

            {/* Active Filters Display */}
            {!showFilters && activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {filter !== 'all' && (
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white ${filter === "paid" ? "bg-[#33D69F]" :
                            filter === "pending" ? "bg-[#FF8F00]" :
                                filter === "draft" ? "bg-[#373B53] dark:bg-[#DFE3FA]/40" : "bg-[#7C5DFA]"
                            }`}>
                            Status: {filter}
                            <button
                                onClick={() => dispatch(setFilter('all'))}
                                className="ml-1 hover:opacity-80"
                            >
                                <BiX size={16} />
                            </button>
                        </div>
                    )}

                    {clientFilter !== 'all' && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#7C5DFA] text-white">
                            Client: {clientFilter}
                            <button
                                onClick={() => dispatch(setClientFilter('all'))}
                                className="ml-1 hover:opacity-80"
                            >
                                <BiX size={16} />
                            </button>
                        </div>
                    )}

                    {searchQuery && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#7C5DFA] text-white">
                            Search: {searchQuery}
                            <button
                                onClick={handleClearSearch}
                                className="ml-1 hover:opacity-80"
                            >
                                <BiX size={16} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => dispatch(clearInvoiceFilters())}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default Header;
