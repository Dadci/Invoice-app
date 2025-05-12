import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from '../utils/InvoicePDF';
import { FiX, FiDownload } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { DEFAULT_SERVICE_TYPES } from '../utils/constants';

const InvoicePreview = ({ invoice, businessInfo, paymentDetails, currency, onClose }) => {
    const [renderError, setRenderError] = useState(false);
    const serviceTypes = useSelector(state => state.settings?.serviceTypes || DEFAULT_SERVICE_TYPES);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-lg overflow-hidden shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
                <div className="bg-light-bg dark:bg-dark-bg p-4 flex justify-between items-center border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center">
                        <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Invoice Preview</h2>
                        <div className="ml-3 px-3 py-1 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-full text-sm text-[#64748B] dark:text-[#94A3B8]">
                            #{invoice.id}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-colors text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] p-4">
                    {renderError ? (
                        <div className="h-full flex items-center justify-center flex-col p-6">
                            <div className="text-red-500 mb-4 text-lg font-bold">Error Rendering PDF Preview</div>
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
                                There was a problem generating the PDF preview. You can still download the PDF using the "Export PDF" button.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md hover:bg-[#9b82fc] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white dark:bg-dark-bg rounded-lg overflow-hidden shadow-md">
                            {(() => {
                                try {
                                    // Function to create PDFViewer with content
                                    const props = {
                                        invoice: invoice,
                                        businessInfo: businessInfo,
                                        paymentDetails: paymentDetails,
                                        currency: currency,
                                        serviceTypes: serviceTypes
                                    };

                                    const pdfDocument = InvoicePDF(props);

                                    return (
                                        <PDFViewer
                                            width="100%"
                                            height="100%"
                                            className="border-0"
                                            onError={() => setRenderError(true)}
                                        >
                                            {pdfDocument}
                                        </PDFViewer>
                                    );
                                } catch (error) {
                                    console.error("Error rendering PDF viewer:", error);
                                    setRenderError(true);
                                    return null;
                                }
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview; 