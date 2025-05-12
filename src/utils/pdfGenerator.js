import React from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { generateFallbackPDF } from './fallbackPdfGenerator';
import { testPdfGeneration } from './testPdf.jsx';
import { DEFAULT_SERVICE_TYPES } from './constants';

// Track if React-PDF is available
let reactPdfAvailable = true;

export const generateInvoicePDF = async (invoice, businessInfo, paymentDetails, currency, serviceTypes = DEFAULT_SERVICE_TYPES) => {
    // If React-PDF failed in the past, go straight to fallback
    if (!reactPdfAvailable) {
        console.log('Using fallback PDF generator (React-PDF previously failed)');
        generateFallbackPDF(invoice, businessInfo, paymentDetails, currency);
        return;
    }

    try {
        console.log('Using React-PDF renderer...');

        // Create component props
        const props = {
            invoice: invoice,
            businessInfo: businessInfo,
            paymentDetails: paymentDetails,
            currency: currency,
            serviceTypes: serviceTypes
        };

        // Generate PDF document using the component
        const pdfDoc = InvoicePDF(props);
        const blob = await pdf(pdfDoc).toBlob();

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${invoice.id}.pdf`;

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('PDF generation completed successfully');
    } catch (error) {
        console.error('React PDF generation error:', error);
        console.log('Falling back to jsPDF method');

        // Mark React-PDF as unavailable for future calls
        reactPdfAvailable = false;

        // Use the fallback method
        try {
            generateFallbackPDF(invoice, businessInfo, paymentDetails, currency);
        } catch (fallbackError) {
            console.error('Fallback PDF generation error:', fallbackError);
            throw fallbackError;
        }
    }
};

// Generate a PDF blob without downloading it, for use in email attachments
export const generatePDFBlob = async (invoice, businessInfo, paymentDetails, currency, serviceTypes = DEFAULT_SERVICE_TYPES) => {
    // If React-PDF failed in the past, return null as we can't generate a blob with fallback
    if (!reactPdfAvailable) {
        console.log('Cannot generate PDF blob - React-PDF unavailable');
        return null;
    }

    try {
        console.log('Generating PDF blob...');

        // Create component props
        const props = {
            invoice: invoice,
            businessInfo: businessInfo,
            paymentDetails: paymentDetails,
            currency: currency,
            serviceTypes: serviceTypes
        };

        // Generate PDF document using the component
        const pdfDoc = InvoicePDF(props);
        const blob = await pdf(pdfDoc).toBlob();

        return {
            blob,
            filename: `Invoice-${invoice.id}.pdf`
        };
    } catch (error) {
        console.error('PDF blob generation error:', error);
        return null;
    }
};
