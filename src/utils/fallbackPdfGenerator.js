import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateFallbackPDF = (invoice, businessInfo, paymentDetails, currency) => {
    // Initialize the PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Set font
    doc.setFont('helvetica');

    // Document margins
    const margin = 20;
    const width = 210 - (margin * 2); // A4 width minus margins

    // Add "INVOICE" header
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', margin, 30);

    // Right margin for right-aligned content
    const rightMargin = 210 - margin;

    // Sender details (right-aligned)
    doc.setFontSize(11);
    doc.text(businessInfo.name || '', rightMargin, 30, { align: 'right' });

    doc.setFontSize(9);
    if (businessInfo.address) {
        doc.text(businessInfo.address?.street || '', rightMargin, 35, { align: 'right' });
        doc.text(`${businessInfo.address?.city || ''}, ${businessInfo.address?.postCode || ''}`, rightMargin, 40, { align: 'right' });
        doc.text(businessInfo.address?.country || '', rightMargin, 45, { align: 'right' });
    }

    if (businessInfo.phone) {
        doc.text(businessInfo.phone, rightMargin, 50, { align: 'right' });
    }

    // Horizontal separator line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    doc.line(margin, 60, 210 - margin, 60);

    // Billed To and Invoice Details in a two-column layout
    const colWidth = width / 2;

    // Left column: Billed To
    doc.setFontSize(10);
    doc.text('Billed to', margin, 70);

    doc.setFontSize(12);
    doc.text(invoice.clientName || 'Client Name', margin, 77);

    doc.setFontSize(9);
    if (invoice.clientAddress) {
        doc.text(invoice.clientAddress?.street || '', margin, 84);
        doc.text(invoice.clientAddress?.city || '', margin, 89);
        doc.text(invoice.clientAddress?.postCode || '', margin, 94);
        doc.text(invoice.clientAddress?.country || '', margin, 99);
    }

    // Right column: Invoice details
    doc.setFontSize(10);
    doc.text('Invoice No.', margin + colWidth, 70);
    doc.setFontSize(11);
    doc.text(`#${invoice.id}`, margin + colWidth, 77);

    doc.setFontSize(10);
    doc.text('Date', margin + colWidth, 84);
    doc.setFontSize(11);
    doc.text(format(new Date(invoice.createdAt), 'dd/MM/yyyy'), margin + colWidth, 91);

    // If there's a payment due date
    if (invoice.paymentDue) {
        doc.setFontSize(10);
        doc.text('Payment Due', margin + colWidth, 98);
        doc.setFontSize(11);
        doc.text(format(new Date(invoice.paymentDue), 'dd/MM/yyyy'), margin + colWidth, 105);
    }

    // Items table with improved styling - no borders and better spacing
    autoTable(doc, {
        startY: 115,
        margin: { left: margin, right: margin },
        head: [['Description', 'Rate', 'Hours', 'Amount']],
        body: invoice.items.map(item => [
            item.name,
            `${currency.symbol} ${item.price.toFixed(2)}`,
            item.quantity,
            `${currency.symbol} ${item.total.toFixed(2)}`
        ]),
        theme: 'plain',
        headStyles: {
            fillColor: false,
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            cellPadding: { top: 5, right: 5, bottom: 8, left: 5 }
        },
        bodyStyles: {
            fillColor: function (row) {
                return (row % 2 === 0) ? [248, 248, 248] : false; // Light gray for even rows
            }
        },
        columnStyles: {
            0: { cellWidth: 90, overflow: 'linebreak' },
            1: { cellWidth: 35, halign: 'right' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' }
        },
        styles: {
            fontSize: 9,
            textColor: [0, 0, 0],
            cellPadding: 5,
            overflow: 'linebreak'
        },
        foot: [
            [
                { content: 'SubTotal', colSpan: 3, styles: { halign: 'right', fontStyle: 'normal' } },
                { content: `${currency.symbol} ${invoice.total.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } }
            ],
            [
                { content: 'Invoice Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11 } },
                {
                    content: `${currency.symbol} ${invoice.total.toFixed(2)}`,
                    styles: {
                        halign: 'right',
                        fontStyle: 'bold',
                        fontSize: 12,
                        textColor: [0, 0, 0]
                    }
                }
            ]
        ],
        footStyles: {
            fillColor: false,
            cellPadding: { top: 8, right: 5, bottom: 5, left: 5 }
        },
        tableLineWidth: 0 // Removes all table borders
    });

    // Payment details section with better spacing
    if (paymentDetails?.bankName || paymentDetails?.iban || paymentDetails?.swiftBic) {
        const finalY = doc.lastAutoTable.finalY + 15;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Payment Information', margin, finalY);

        // Horizontal line under the heading
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.line(margin, finalY + 3, margin + 50, finalY + 3);

        doc.setFontSize(9);

        let paymentY = finalY + 10;
        const labelX = margin;
        const valueX = margin + 30;

        // Bank Name row
        if (paymentDetails.bankName) {
            doc.text('Bank Name:', labelX, paymentY);
            doc.text(paymentDetails.bankName, valueX, paymentY);
            paymentY += 6;
        }

        // IBAN row
        if (paymentDetails.iban) {
            doc.text('IBAN:', labelX, paymentY);
            doc.text(paymentDetails.iban, valueX, paymentY);
            paymentY += 6;
        }

        // SWIFT/BIC row
        if (paymentDetails.swiftBic) {
            doc.text('SWIFT/BIC:', labelX, paymentY);
            doc.text(paymentDetails.swiftBic, valueX, paymentY);
            paymentY += 6;
        }

        // Reference note
        doc.text(`Please include the invoice number #${invoice.id} with your payment.`, margin, paymentY + 6);
    }

    // Add a thank you note
    const thankYouY = doc.internal.pageSize.height - 20;
    doc.setFontSize(9);
    doc.text('Thanks for your business.', rightMargin, thankYouY, { align: 'right' });

    // Save the PDF with the invoice number as the filename
    doc.save(`Invoice-${invoice.id}.pdf`);
}; 