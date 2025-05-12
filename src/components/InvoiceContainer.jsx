import React, { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import InvoiceItem from "./InvoiceItem";
import { BiSearchAlt, BiX, BiTrash, BiCheck } from "react-icons/bi";
import { clearInvoiceFilters, bulkDeleteInvoices } from "../store/invoicesSlice";
import { motion } from "framer-motion";
import { fadeIn } from "../utils/animations";
import BulkDeleteModal from "./BulkDeleteModal";

const InvoiceContainer = () => {
  const dispatch = useDispatch();
  const invoices = useSelector(state => state.invoices.invoices);
  const filter = useSelector(state => state.invoices.filter);
  const clientFilter = useSelector(state => state.invoices.clientFilter);
  const searchQuery = useSelector(state => state.invoices.searchQuery || '');

  // Bulk selection state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Reset filters to default on component mount to avoid issues after page reload
  useEffect(() => {
    // Only reset if there are active filters but no results would show
    if ((filter !== 'all' || clientFilter !== 'all' || searchQuery.trim() !== '') && invoices.length > 0) {
      const wouldHaveResults = invoices.some(invoice => {
        const matchesStatus = filter === 'all' || invoice.status === filter;
        const matchesClient = clientFilter === 'all' || invoice.clientName === clientFilter;

        return matchesStatus && matchesClient;
      });

      if (!wouldHaveResults) {
        dispatch(clearInvoiceFilters());
      }
    }
  }, []);

  // Use useMemo to filter and search invoices for better performance
  const filteredInvoices = useMemo(() => {
    // First filter by status
    let result = invoices;

    if (filter !== 'all') {
      result = result.filter(invoice => invoice.status === filter);
    }

    // Then filter by client if selected
    if (clientFilter !== 'all') {
      result = result.filter(invoice => invoice.clientName === clientFilter);
    }

    // Then filter by search query if one exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(invoice =>
        // Search in multiple fields
        invoice.id?.toLowerCase().includes(query) ||
        invoice.clientName?.toLowerCase().includes(query) ||
        invoice.projectDescription?.toLowerCase().includes(query) ||
        invoice.clientEmail?.toLowerCase().includes(query) ||
        invoice.items?.some(item => item.name?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [invoices, filter, clientFilter, searchQuery]);

  // Handle toggling invoice selection
  const toggleInvoiceSelection = (invoiceId) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    } else {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    }
  };

  // Select all visible invoices
  const selectAllInvoices = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      // If all are selected, deselect all
      setSelectedInvoices([]);
    } else {
      // Otherwise select all
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    }
  };

  // Exit bulk mode and clear selections
  const exitBulkMode = () => {
    setIsBulkMode(false);
    setSelectedInvoices([]);
  };

  // Open bulk delete confirmation modal
  const openBulkDeleteModal = () => {
    if (selectedInvoices.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  // If we have no results after filtering and searching
  if (filteredInvoices.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="px-6 md:px-0 w-full flex flex-col items-center justify-center py-12"
      >
        <BiSearchAlt size={64} className="text-light-border dark:text-dark-border mb-6 transition-colors duration-200" />
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 transition-colors duration-200">No results found</h2>
        <p className="text-center text-light-text-secondary dark:text-dark-text-secondary max-w-md transition-colors duration-200 mb-6">
          {searchQuery || filter !== 'all' || clientFilter !== 'all'
            ? `No invoices match your current filters. Try different filter settings.`
            : `No invoices found. Create your first invoice to get started.`}
        </p>

        {(searchQuery || filter !== 'all' || clientFilter !== 'all') && (
          <button
            onClick={() => dispatch(clearInvoiceFilters())}
            className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-dark-card hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text rounded-full transition-colors duration-200"
          >
            <BiX size={18} />
            Clear all filters
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="w-full px-6 md:px-0 space-y-4"
    >
      {/* Bulk actions toolbar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {isBulkMode ? (
            <>
              <button
                onClick={selectAllInvoices}
                className="flex items-center gap-2 py-2 px-4 bg-light-card dark:bg-dark-card hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text rounded-full transition-colors duration-200 mr-2"
              >
                <BiCheck size={18} className="text-[#7C5DFA]" />
                {selectedInvoices.length === filteredInvoices.length
                  ? "Deselect All"
                  : "Select All"}
              </button>

              <button
                onClick={exitBulkMode}
                className="flex items-center gap-2 py-2 px-4 bg-light-card dark:bg-dark-card hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text rounded-full transition-colors duration-200"
              >
                <BiX size={18} />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsBulkMode(true)}
              className="flex items-center gap-2 py-2 px-4 bg-light-card dark:bg-dark-card hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text rounded-full transition-colors duration-200"
            >
              <BiCheck size={18} />
              Select Invoices
            </button>
          )}
        </div>

        {isBulkMode && (
          <div className="flex items-center">
            <span className="text-light-text-secondary dark:text-dark-text-secondary mr-3 transition-colors duration-200">
              {selectedInvoices.length} selected
            </span>
            <button
              onClick={openBulkDeleteModal}
              disabled={selectedInvoices.length === 0}
              className={`flex items-center gap-2 py-2 px-4 rounded-full font-medium transition-colors duration-200 ${selectedInvoices.length === 0
                ? "bg-[#F9FAFE] dark:bg-[#252945] text-light-text-secondary dark:text-dark-text-secondary opacity-50 cursor-not-allowed"
                : "bg-[#EC5757] hover:bg-[#FF9797] text-white"
                }`}
            >
              <BiTrash size={18} />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {filteredInvoices.map(invoice => (
        <InvoiceItem
          key={invoice.id}
          invoice={invoice}
          isBulkMode={isBulkMode}
          isSelected={selectedInvoices.includes(invoice.id)}
          onToggleSelect={() => toggleInvoiceSelection(invoice.id)}
        />
      ))}

      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary text-center py-4">
        Showing {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'}
        {filter !== 'all' && ` with status "${filter}"`}
        {clientFilter !== 'all' && ` for client "${clientFilter}"`}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        selectedInvoices={selectedInvoices}
      />
    </motion.div>
  );
};

export default InvoiceContainer;
