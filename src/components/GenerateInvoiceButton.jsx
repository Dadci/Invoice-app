import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BiReceipt } from 'react-icons/bi';
import { generateMonthEndInvoice } from '../utils/invoiceAutomation';
import toast from 'react-hot-toast';

const GenerateInvoiceButton = () => {
    const dispatch = useDispatch();
    const projects = useSelector(state => state.projects.projects);
    const settings = useSelector(state => state.settings);
    const { enabled: isAutomationEnabled } = useSelector(state => state.settings?.invoiceAutomation || { enabled: false });

    // State for generate invoice popup
    const [showGenerateForm, setShowGenerateForm] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Function to handle invoice generation
    const handleGenerateInvoice = () => {
        setIsGenerating(true);

        try {
            // If no projects exist
            if (!projects || projects.length === 0) {
                toast.error('No projects found to generate invoice');
                setIsGenerating(false);
                return;
            }

            // Use default hourly rate from settings
            const hourlyRate = settings.invoiceAutomation?.defaultHourlyRate || 50;

            // Get payment terms from settings
            const paymentTerms = settings.invoiceAutomation?.defaultPaymentTerms || 30;

            // Use business info as the billing entity
            const businessInfo = settings.businessInfo || {};

            // Call the invoice generation function for all projects
            generateMonthEndInvoice({
                projects,
                clientName: 'Monthly Invoice', // Generic name
                clientEmail: businessInfo.email || '',
                clientAddress: businessInfo.address || {},
                userDetails: businessInfo,
                hourlyRate,
                paymentTerms,
                dispatch,
                includeAllProjects: true // Flag to include all projects regardless of client
            });

            setShowGenerateForm(false);
            toast.success('Monthly invoice generated successfully');
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Failed to generate invoice');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isAutomationEnabled) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setShowGenerateForm(true)}
                className="py-2 px-4 border border-[#EC5757] text-[#EC5757] hover:bg-[#EC5757] hover:text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
            >
                <BiReceipt size={18} />
                <span className="hidden sm:inline">Generate Monthly</span>
            </button>

            {/* Generate Invoice Confirmation */}
            {showGenerateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Generate Monthly Invoice</h3>

                        <div className="mb-6">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                This will generate a single monthly invoice that combines all projects for the current month.
                            </p>

                            <div className="mt-4 p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
                                <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Invoice Details:</h4>
                                <ul className="space-y-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    <li>• Total Projects: {projects.length}</li>
                                    <li>• Default Hourly Rate: {settings.invoiceAutomation?.defaultHourlyRate || 50}</li>
                                    <li>• Payment Terms: {settings.invoiceAutomation?.defaultPaymentTerms || 30} days</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowGenerateForm(false)}
                                className="py-2 px-4 bg-light-bg dark:bg-dark-border text-light-text dark:text-dark-text rounded-md hover:bg-light-border dark:hover:bg-dark-bg"
                                disabled={isGenerating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateInvoice}
                                className={`py-2 px-4 rounded-md flex items-center gap-2 ${isGenerating
                                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    : "bg-[#EC5757] text-white hover:bg-[#FF9797]"
                                    }`}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <BiReceipt size={18} />
                                        <span>Generate Invoice</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenerateInvoiceButton; 