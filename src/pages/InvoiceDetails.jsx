import { BiChevronLeft } from "react-icons/bi";

import InvoiceActionBar from "../components/InvoiceActionBar";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { format, isPast, isToday } from "date-fns";
import AddInvoiceModal from "../components/AddInvoiceModal";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import toast from 'react-hot-toast';

import StatusDropdown from "../components/StatusDropdown";
import InvoicePreview from '../components/InvoicePreview';
import { useState } from "react";
import { testPdfGeneration } from "../utils/testPdf.jsx";
import { DEFAULT_SERVICE_TYPES } from '../utils/constants';
import CurrencyDisplay from "../components/CurrencyDisplay";
import useCurrencyConverter from "../utils/useCurrencyConverter";

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const invoice = useSelector(state =>
    state.invoices.invoices.find(invoice => invoice.id === id)
  );
  const settings = useSelector(state => state.settings || {});
  const { symbol = '$', code = 'CAD' } = settings.currency || {};
  const businessInfo = settings.businessInfo || {};
  const paymentDetails = settings.paymentDetails || {};
  const serviceTypes = useSelector(state => state.settings?.serviceTypes || DEFAULT_SERVICE_TYPES);
  const language = useSelector(state => state.settings?.language || 'en');
  const [showPreview, setShowPreview] = useState(false);
  const { convertAndFormat, formatCurrency } = useCurrencyConverter();

  if (!invoice) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-screen p-6 text-light-text dark:text-dark-text">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-40 bg-light-border dark:bg-dark-border rounded-md mb-4"></div>
          <div className="h-4 w-60 bg-light-border dark:bg-dark-border rounded-md"></div>
          <button
            onClick={() => navigate('/')}
            className="mt-8 text-[#7C5DFA] hover:text-[#9b82fc] font-bold"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF...');
      await generateInvoicePDF(invoice, businessInfo, paymentDetails, { symbol, code }, serviceTypes, language);
      toast.dismiss();
      toast.success('Invoice exported to PDF successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Error exporting invoice to PDF. Please try again.');
    }
  };

  // Check if payment is overdue
  const isOverdue = invoice.status === 'pending' && isPast(new Date(invoice.paymentDue)) && !isToday(new Date(invoice.paymentDue));

  // Format due date with additional context
  const formatDueDate = () => {
    if (isToday(new Date(invoice.paymentDue))) {
      return "Due Today";
    } else if (isOverdue) {
      return `Overdue (${format(new Date(invoice.paymentDue), 'dd MMM yyyy')})`;
    } else {
      return format(new Date(invoice.paymentDue), 'dd MMM yyyy');
    }
  };

  const handlePreviewPDF = () => {
    setShowPreview(true);
  };

  const testPdf = async () => {
    try {
      toast.loading('Testing PDF generation...');
      const result = await testPdfGeneration();
      toast.dismiss();
      if (result) {
        toast.success('PDF test successful');
      } else {
        toast.error('PDF test failed');
      }
    } catch (error) {
      console.error('PDF test error:', error);
      toast.dismiss();
      toast.error('PDF test error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6 mt-4 mb-24 md:mb-8 md:mt-8">
      {/* Header with back button */}
      <div className="flex items-center gap-2 cursor-pointer hover:text-[#7C5DFA] transition-colors" onClick={() => navigate('/')}>
        <BiChevronLeft size={20} className="text-[#7C5DFA]" />
        <p className="text-light-text dark:text-dark-text text-base font-bold leading-none">Go back</p>
      </div>

      {/* Action bar with buttons */}
      <InvoiceActionBar
        invoice={invoice}
        onExportPDF={handleExportPDF}
        onPreviewPDF={handlePreviewPDF}
        onTestPDF={testPdf}
      />

      {/* Two-column layout wrapper */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column (70%) - Invoice details */}
        <div className="w-full lg:w-[70%] bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-sm flex flex-col transition-colors duration-200">
          <div className="flex justify-between items-start gap-6 md:gap-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-lg font-bold text-light-text dark:text-dark-text">
                  #{invoice.id}
                </h1>
              </div>
              <p className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">
                {invoice.projectDescription}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {invoice.senderName && (
                <p className="text-[13px] font-bold text-light-text dark:text-dark-text">{invoice.senderName}</p>
              )}
              {invoice.senderEmail && (
                <p className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">{invoice.senderEmail}</p>
              )}
              <p className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">{invoice.senderAddress?.street}</p>
              <p className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">{invoice.senderAddress?.city}</p>
              <p className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">{invoice.senderAddress?.postCode}</p>
              <p className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">{invoice.senderAddress?.country}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">Invoice Date</h2>
              <p className="text-[15px] font-bold text-light-text dark:text-dark-text">
                {format(new Date(invoice.createdAt), 'dd MMM yyyy')}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">Bill To</h2>
              <p className="text-[15px] font-bold text-light-text dark:text-dark-text">{invoice.clientName}</p>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">Send To</h2>
              <p className="text-[15px] font-bold text-light-text dark:text-dark-text">{invoice.clientEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">Payment Due</h2>
              <p className={`text-[15px] font-bold ${isOverdue ? 'text-[#EC5757]' : 'text-light-text dark:text-dark-text'}`}>
                {formatDueDate()}
              </p>
            </div>

            <div className="flex flex-col gap-1 col-span-2">
              <h2 className="text-[13px] font-medium text-light-text-secondary dark:text-dark-text-secondary">Client Address</h2>
              <p className="text-[13px] font-medium text-light-text dark:text-dark-text">{invoice.clientAddress?.street}</p>
              <p className="text-[13px] font-medium text-light-text dark:text-dark-text">{invoice.clientAddress?.city}</p>
              <p className="text-[13px] font-medium text-light-text dark:text-dark-text">{invoice.clientAddress?.postCode}</p>
              <p className="text-[13px] font-medium text-light-text dark:text-dark-text">{invoice.clientAddress?.country}</p>
            </div>
          </div>

          <div className="mt-8 bg-[#F9FAFE] dark:bg-[#252945] rounded-lg overflow-hidden transition-colors duration-200">
            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4">
              <table className="w-full">
                <thead>
                  <tr className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary">
                    <th className="text-left font-medium pb-4">Service Description</th>
                    <th className="text-center font-medium pb-4">Hours</th>
                    <th className="text-right font-medium pb-4">Rate</th>
                    <th className="text-right font-medium pb-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => {
                    // Safely parse price and total to ensure they're numbers
                    const safePrice = typeof item.price === 'number' ? item.price : (parseFloat(item.price) || 0);
                    const safeTotal = typeof item.total === 'number' ? item.total : (parseFloat(item.total) || 0);

                    // Get service type name if available
                    const serviceType = item.serviceType && item.serviceType !== 'other'
                      ? serviceTypes.find(type => type.id === item.serviceType)?.name
                      : null;

                    return (
                      <tr key={index} className="text-[15px] text-light-text dark:text-dark-text font-medium">
                        <td className="py-3">
                          {item.name}
                          {serviceType && (
                            <span className="block text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                              {serviceType}
                            </span>
                          )}
                        </td>
                        <td className="text-center text-light-text-secondary dark:text-dark-text-secondary py-3">{item.quantity}</td>
                        <td className="text-right text-light-text-secondary dark:text-dark-text-secondary py-3">
                          <CurrencyDisplay
                            amount={safePrice}
                            baseCurrency={invoice.currency?.code || "CAD"}
                            size="sm"
                          />
                        </td>
                        <td className="text-right font-bold py-3">
                          <CurrencyDisplay
                            amount={safeTotal}
                            baseCurrency={invoice.currency?.code || "CAD"}
                            size="sm"
                            className="font-bold"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-row justify-between items-center w-full px-6 md:px-8 py-6 bg-[#373B53] dark:bg-[#0C0E16] rounded-b-lg transition-colors duration-200">
              <p className="text-[15px] text-white font-normal">Amount Due</p>
              <p className="text-sm text-white/70 mt-1">
                Total Hours: {invoice.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
              </p>
              <p className="text-[20px] text-white font-bold">
                <CurrencyDisplay
                  amount={typeof invoice.total === 'number' ? invoice.total : (parseFloat(invoice.total) || 0)}
                  baseCurrency={invoice.currency?.code || "CAD"}
                  size="lg"
                  className="text-white"
                  showOriginal={true}
                />
              </p>
            </div>
          </div>
        </div>

        {/* Right column (30%) - Payment Information and other details */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6">
          {/* Payment Status Card */}
          <div className={`bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm border-l-4 transition-colors duration-200
            ${invoice.status === 'paid' ? 'border-[#33D69F]' :
              invoice.status === 'sent' ? 'border-[#7C5DFA]' :
                invoice.status === 'pending' ? 'border-[#FF8F00]' :
                  'border-[#373B53]'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-light-text dark:text-dark-text">Payment Status</h2>
              <StatusDropdown invoice={invoice} />
            </div>

            {invoice.status === 'paid' && (
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#33D69F]"></div>
                  <span className="font-bold text-sm text-[#33D69F] capitalize">Paid</span>
                </div>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">This invoice has been paid.</p>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Thank you for your business!</p>
              </div>
            )}

            {invoice.status === 'sent' && (
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7C5DFA]"></div>
                  <span className="font-bold text-sm text-[#7C5DFA] capitalize">Sent</span>
                </div>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">This invoice has been sent to the client.</p>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  Payment is due by {format(new Date(invoice.paymentDue), 'dd MMM yyyy')}.
                </p>
              </div>
            )}

            {invoice.status === 'pending' && (
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF8F00]"></div>
                  <span className="font-bold text-sm text-[#FF8F00] capitalize">Pending</span>
                </div>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">This invoice is awaiting payment.</p>
                <p className={`mt-1 ${isOverdue ? 'text-[#EC5757] font-medium' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                  {isOverdue ? 'Payment is overdue.' : `Payment is due by ${format(new Date(invoice.paymentDue), 'dd MMM yyyy')}.`}
                </p>
              </div>
            )}

            {invoice.status === 'draft' && (
              <div className="mt-2 text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#373B53]"></div>
                  <span className="font-bold text-sm text-[#373B53] dark:text-[#DFE3FA] capitalize">Draft</span>
                </div>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">This invoice is a draft and has not been sent.</p>
              </div>
            )}
          </div>

          {/* Payment Information Card */}
          {(paymentDetails?.bankName || paymentDetails?.iban || paymentDetails?.swiftBic) && (
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm transition-colors duration-200">
              <h2 className="text-[15px] font-bold text-light-text dark:text-dark-text mb-4">Payment Information</h2>

              {paymentDetails.bankName && (
                <div className="flex mb-3">
                  <span className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary w-28">Bank Name:</span>
                  <span className="text-[13px] font-medium text-light-text dark:text-dark-text">{paymentDetails.bankName}</span>
                </div>
              )}

              {paymentDetails.iban && (
                <div className="flex mb-3">
                  <span className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary w-28">IBAN:</span>
                  <span className="text-[13px] font-medium text-light-text dark:text-dark-text break-all">{paymentDetails.iban}</span>
                </div>
              )}

              {paymentDetails.swiftBic && (
                <div className="flex mb-3">
                  <span className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary w-28">SWIFT/BIC:</span>
                  <span className="text-[13px] font-medium text-light-text dark:text-dark-text">{paymentDetails.swiftBic}</span>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                <p className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary">Please include the invoice number <span className="font-bold text-light-text dark:text-dark-text">#{invoice.id}</span> with your payment.</p>
              </div>
            </div>
          )}

          {/* Client Information Summary Card (Mobile Only) */}
          <div className="lg:hidden bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm transition-colors duration-200">
            <h2 className="text-[15px] font-bold text-light-text dark:text-dark-text mb-4">Client Summary</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#7C5DFA10] dark:bg-[#7C5DFA20] flex items-center justify-center text-[#7C5DFA]">
                {invoice.clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[15px] font-bold text-light-text dark:text-dark-text">{invoice.clientName}</p>
                <p className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary">{invoice.clientEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddInvoiceModal />

      {showPreview && (
        <InvoicePreview
          invoice={invoice}
          businessInfo={businessInfo}
          paymentDetails={paymentDetails}
          currency={{ symbol, code }}
          onClose={() => setShowPreview(false)}
          serviceTypes={serviceTypes}
          language={language}
        />
      )}
    </div>
  );
};

export default InvoiceDetails;
