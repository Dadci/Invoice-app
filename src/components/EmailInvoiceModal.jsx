import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiMail, FiDownload, FiSend, FiLink, FiAlertCircle, FiCheck, FiLoader, FiInfo, FiFileText, FiList, FiEdit } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { generatePDFBlob } from '../utils/pdfGenerator';

// API URL for the email server (default to localhost during development)
const API_URL = 'http://localhost:3001';

// Email templates
const EMAIL_TEMPLATES = {
    professional: {
        name: 'Professional',
        getSubject: (invoice, businessInfo) => `Invoice #${invoice.id} from ${businessInfo.name || 'Your Company'}`,
        getMessage: (invoice, businessInfo, currency, formattedDate, formattedDueDate) =>
            `Dear ${invoice.clientName || 'Client'},

Please find attached the invoice #${invoice.id} for ${invoice.projectDescription || 'services rendered'}.

Invoice Details:
- Invoice #: ${invoice.id}
- Date: ${formattedDate}
- Due: ${formattedDueDate}
- Amount: ${currency.symbol || '£'}${invoice.total?.toFixed(2) || '0.00'}

Thank you for your business.

Regards,
${businessInfo.name || 'Your Name'}
${businessInfo.email || ''}
${businessInfo.phone || ''}`,
    },
    friendly: {
        name: 'Friendly',
        getSubject: (invoice, businessInfo) => `Your invoice from ${businessInfo.name || 'us'} 😊`,
        getMessage: (invoice, businessInfo, currency, formattedDate, formattedDueDate) =>
            `Hi ${invoice.clientName || 'there'},

I hope you're doing well! I've attached the invoice for our recent work together.

Here's a quick summary:
📝 Invoice #${invoice.id}
📅 Issued: ${formattedDate}
⏱️ Due: ${formattedDueDate}
💰 Total: ${currency.symbol || '£'}${invoice.total?.toFixed(2) || '0.00'}

Please let me know if you have any questions!

Thanks,
${businessInfo.name || 'Your Name'}
${businessInfo.email || ''}`,
    },
    formal: {
        name: 'Formal',
        getSubject: (invoice, businessInfo) => `INVOICE: #${invoice.id} | ${businessInfo.name || 'Company Name'}`,
        getMessage: (invoice, businessInfo, currency, formattedDate, formattedDueDate) =>
            `Dear ${invoice.clientName || 'Sir/Madam'},

Please find attached Invoice #${invoice.id} dated ${formattedDate} for ${invoice.projectDescription || 'services rendered'}.

INVOICE SUMMARY
Invoice Number: ${invoice.id}
Issue Date: ${formattedDate}
Due Date: ${formattedDueDate}
Amount Due: ${currency.symbol || '£'}${invoice.total?.toFixed(2) || '0.00'}

Payment is due by ${formattedDueDate}. Please remit payment according to the terms outlined in the invoice.

Should you have any inquiries regarding this invoice, please do not hesitate to contact us.

Sincerely,
${businessInfo.name || 'Your Name'}
${businessInfo.position || 'Position'}
${businessInfo.email || ''}
${businessInfo.phone || ''}`,
    },
    reminder: {
        name: 'Payment Reminder',
        getSubject: (invoice, businessInfo) => `Payment Reminder: Invoice #${invoice.id}`,
        getMessage: (invoice, businessInfo, currency, formattedDate, formattedDueDate) =>
            `Dear ${invoice.clientName || 'Client'},

This is a friendly reminder about invoice #${invoice.id} issued on ${formattedDate}, which is due for payment on ${formattedDueDate}.

Invoice Details:
- Invoice #: ${invoice.id}
- Issue Date: ${formattedDate}
- Due Date: ${formattedDueDate}
- Amount: ${currency.symbol || '£'}${invoice.total?.toFixed(2) || '0.00'}

I've attached a copy of the invoice for your reference. Please let me know if you've already sent the payment or if you have any questions.

Thank you for your prompt attention to this matter.

Best regards,
${businessInfo.name || 'Your Name'}
${businessInfo.email || ''}`,
    },
};

const EmailInvoiceModal = ({ isOpen, onClose, invoice, onExportPDF }) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [pdfURL, setPdfURL] = useState(null);
    const [pdfAttachment, setPdfAttachment] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('professional');
    const [showTemplates, setShowTemplates] = useState(false);
    const [serverStatus, setServerStatus] = useState('unknown'); // 'unknown', 'running', 'stopped'

    const formRef = useRef();
    const templateButtonRef = useRef(null);

    const { businessInfo = {} } = useSelector(state => state.settings || {});
    const { currency = {} } = useSelector(state => state.settings || {});
    const paymentDetails = useSelector(state => state.settings?.paymentDetails || {});

    // Check server status when modal opens
    useEffect(() => {
        if (isOpen) {
            checkServerStatus();
        }
    }, [isOpen]);

    // Check if server is running
    const checkServerStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/test`);
            if (response.ok) {
                setServerStatus('running');
            } else {
                setServerStatus('stopped');
            }
        } catch (error) {
            console.error('Server check error:', error);
            setServerStatus('stopped');
        }
    };

    // Apply template and set initial values
    const applyTemplate = (templateKey) => {
        if (!invoice) return;

        const template = EMAIL_TEMPLATES[templateKey];
        if (!template) return;

        // Format dates
        const formattedDate = invoice.createdAt ? format(new Date(invoice.createdAt), 'MMM dd, yyyy') : 'N/A';
        const formattedDueDate = invoice.paymentDue ? format(new Date(invoice.paymentDue), 'MMM dd, yyyy') : 'N/A';

        // Set subject and message from template
        setSubject(template.getSubject(invoice, businessInfo));
        setMessage(template.getMessage(invoice, businessInfo, currency, formattedDate, formattedDueDate));

        // Close template dropdown
        setShowTemplates(false);
    };

    // Initialize form values when the modal opens or invoice changes
    useEffect(() => {
        if (isOpen && invoice) {
            // Set recipient email from invoice
            setRecipientEmail(invoice.clientEmail || '');

            // Apply default template
            applyTemplate(selectedTemplate);
        }

        // Clean up PDF URL object on unmount or when modal closes
        return () => {
            if (pdfURL) {
                URL.revokeObjectURL(pdfURL);
                setPdfURL(null);
                setPdfAttachment(null);
            }
        };
    }, [isOpen, invoice, businessInfo, currency, selectedTemplate]);

    // Close template dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (templateButtonRef.current && !templateButtonRef.current.contains(event.target)) {
                setShowTemplates(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleGeneratePdfAttachment = async () => {
        setIsGeneratingPDF(true);

        try {
            // Generate PDF blob
            const result = await generatePDFBlob(invoice, businessInfo, paymentDetails, currency);

            if (result && result.blob) {
                // Create a URL for the blob that can be shared
                const url = URL.createObjectURL(result.blob);
                setPdfURL(url);
                setPdfAttachment({
                    blob: result.blob,
                    filename: result.filename
                });

                toast.success('PDF generated and ready to send');
            } else {
                toast.error('Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();

        // Validate email
        if (!recipientEmail) {
            toast.error('Please enter a recipient email address');
            return;
        }

        // Check if PDF is generated
        if (!pdfAttachment) {
            toast.error('Please generate the PDF first');
            return;
        }

        // Validate sender email
        if (!businessInfo.email) {
            toast.error('Please set your email address in business settings');
            return;
        }

        setIsSendingEmail(true);

        try {
            // First check if the server is running
            try {
                const testResponse = await fetch(`${API_URL}/api/test`);
                if (!testResponse.ok) {
                    throw new Error('Email server is not running. Please start the server with "npm run server"');
                }
            } catch (serverError) {
                console.error('Server connection error:', serverError);
                toast.error('Email server is not running. Please start the server with "npm run server"');
                setIsSendingEmail(false);
                return;
            }

            // Create form data for the API request
            const formData = new FormData();
            formData.append('to', recipientEmail);
            formData.append('from', businessInfo.email);
            formData.append('subject', subject);
            formData.append('message', message);

            // Add the PDF as an attachment
            formData.append('attachment', new File(
                [pdfAttachment.blob],
                pdfAttachment.filename,
                { type: pdfAttachment.blob.type }
            ));

            // Send to our Express server
            const response = await fetch(`${API_URL}/api/send-email`, {
                method: 'POST',
                body: formData,
                // No need to set Content-Type, as it's auto-set with boundary for FormData
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Email sent successfully:', result);
                toast.success('Email sent successfully');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                console.error('Error response from server:', result);

                // Handle specific error cases
                if (result.error === 'Authentication failed') {
                    // Create a more detailed error message for authentication issues
                    toast.error(
                        <div>
                            <p className="font-bold">Gmail App Password Required</p>
                            <p className="mt-1">You need to set up an App Password in your Gmail account.</p>
                            <a
                                href="https://support.google.com/mail/?p=InvalidSecondFactor"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline mt-1 block"
                            >
                                Click here for instructions
                            </a>
                            <p className="mt-1 text-xs">Then add it to the .env file as EMAIL_PASSWORD</p>
                        </div>,
                        { duration: 8000 } // Show for longer
                    );
                } else if (result.error === 'Email configuration error') {
                    toast.error(`${result.error}: ${result.details}`);
                } else {
                    toast.error(`Failed to send email: ${result.details || result.error || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error(`Failed to send email: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleFallbackEmailOpen = () => {
        if (!pdfURL) {
            toast.error('Please generate the PDF first');
            return;
        }

        try {
            // Create mailto URL with subject and body
            const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

            // Open in new window
            window.open(mailtoUrl, '_blank');

            // Also open the PDF in a new tab for manual download/attachment
            window.open(pdfURL, '_blank');

            toast.success('Email client and PDF opened. Please attach the PDF to your email.');

            // Close the modal after a short delay
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error opening email client:', error);
            toast.error('Failed to open email client. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-light-bg-secondary dark:bg-dark-bg-secondary">
                                <h2 className="text-base font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                                    <FiMail className="text-[#33D69F]" size={18} />
                                    Email Invoice
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors p-1 rounded-full"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            {/* Server status indicator */}
                            {serverStatus === 'stopped' && (
                                <div className="p-3 bg-[#FFEBEB] dark:bg-[#4f2a2a] text-[#EC5757] text-xs flex items-start gap-2">
                                    <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Email server not running</p>
                                        <p className="mt-1">
                                            Start the server with <code className="bg-[#ec57574d] px-1 py-0.5 rounded">npm run start</code> or use the email client option below.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-4">
                                {/* PDF Generation section */}
                                <div className="mb-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                                            <FiFileText size={14} />
                                            PDF Attachment
                                        </h3>
                                    </div>

                                    <div className="flex justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={handleGeneratePdfAttachment}
                                            disabled={isGeneratingPDF || pdfAttachment}
                                            className={`flex items-center justify-center gap-1 bg-[#7C5DFA] hover:bg-[#9277FF] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${(isGeneratingPDF || pdfAttachment) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {isGeneratingPDF ?
                                                <FiLoader className="animate-spin" size={12} /> :
                                                pdfAttachment ? <FiCheck size={12} /> : <FiDownload size={12} />
                                            }
                                            {isGeneratingPDF ? 'Generating...' : pdfAttachment ? 'Generated' : 'Generate PDF'}
                                        </button>

                                        {pdfURL && (
                                            <a
                                                href={pdfURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1 bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text dark:text-dark-text px-4 py-2 rounded-md text-xs font-bold transition-colors hover:bg-opacity-80"
                                            >
                                                <FiLink size={14} />
                                                Preview
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Email template selector */}
                                <div className="mb-5">
                                    <div className="relative" ref={templateButtonRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowTemplates(!showTemplates)}
                                            className="w-full flex justify-between items-center gap-2 text-left p-2 border border-light-border dark:border-dark-border rounded-md text-sm text-light-text dark:text-dark-text bg-light-input dark:bg-dark-input hover:border-[#7C5DFA] transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FiList size={14} />
                                                <span>Template: {EMAIL_TEMPLATES[selectedTemplate].name}</span>
                                            </div>
                                            <div>▼</div>
                                        </button>

                                        {showTemplates && (
                                            <div className="absolute z-10 mt-1 w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md shadow-lg overflow-hidden">
                                                {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTemplate(key);
                                                            applyTemplate(key);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm ${selectedTemplate === key ?
                                                            'bg-[#7C5DFA] text-white' :
                                                            'text-light-text dark:text-dark-text hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary'
                                                            }`}
                                                    >
                                                        {template.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <form className="space-y-4" ref={formRef} onSubmit={handleSendEmail}>
                                    <div>
                                        <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-1">
                                            Recipient Email
                                        </label>
                                        <input
                                            type="email"
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            placeholder="client@example.com"
                                            className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200 text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-1">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200 text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows="6"
                                            className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200 text-sm"
                                            required
                                        />
                                    </div>
                                </form>

                                {/* Info box */}
                                <div className="mt-4 p-3 border border-[#7C5DFA33] bg-[#7C5DFA11] rounded-md text-xs text-light-text dark:text-dark-text flex gap-2 items-start">
                                    <FiInfo className="text-[#7C5DFA] mt-0.5 flex-shrink-0" size={14} />
                                    <div>
                                        Emails are sent from <span className="font-semibold">{businessInfo.email || 'your email'}</span>. You can change this in Settings.
                                    </div>
                                </div>
                            </div>

                            {/* Footer with buttons */}
                            <div className="p-4 border-t border-light-border dark:border-dark-border flex items-center justify-between bg-light-bg-secondary dark:bg-dark-bg-secondary">
                                <button
                                    type="button"
                                    onClick={handleFallbackEmailOpen}
                                    className="text-xs text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] transition-colors flex items-center gap-1"
                                >
                                    <FiMail size={12} />
                                    Use email client
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSendEmail}
                                    disabled={isSendingEmail || !pdfAttachment || serverStatus === 'stopped'}
                                    className={`flex items-center gap-1 bg-[#33D69F] hover:bg-[#4be0af] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${(isSendingEmail || !pdfAttachment || serverStatus === 'stopped') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSendingEmail ? <FiLoader className="animate-spin" size={12} /> : <FiSend size={12} />}
                                    {isSendingEmail ? 'Sending...' : 'Send Email'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EmailInvoiceModal; 