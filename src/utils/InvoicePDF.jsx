import React from 'react';
import { format } from 'date-fns';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    PDFDownloadLink,
    Font
} from '@react-pdf/renderer';
import { invoiceTranslations } from './translations';

// Register professional fonts
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', fontWeight: 'bold' },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 'medium' }
    ]
});

// Create styles with improved design
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Inter',
        backgroundColor: '#FFFFFF',
        color: '#333333'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    logo: {
        height: 40,
        marginBottom: 15,
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    invoiceSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4
    },
    businessInfo: {
        textAlign: 'right',
        fontSize: 10,
        color: '#64748B',
    },
    businessName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        width: '100%',
        marginVertical: 15,
    },
    section: {
        marginBottom: 15,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    row: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    col2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    col: {
        flex: 1,
    },
    clientName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 10,
        color: '#334155',
        marginBottom: 2,
    },
    addressValue: {
        fontSize: 10,
        color: '#334155',
        marginBottom: 2,
    },
    invoiceNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    table: {
        width: '100%',
        marginBottom: 15,
        marginTop: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        padding: 10,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#475569',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        padding: 10,
        wrap: false,
    },
    tableRowEven: {
        backgroundColor: '#F8FAFC',
    },
    tableCol1: {
        flex: 5,
        color: '#334155',
    },
    tableCol2: {
        flex: 1.5,
        textAlign: 'center',
        color: '#475569',
    },
    tableCol3: {
        flex: 1.5,
        textAlign: 'right',
        color: '#475569',
    },
    tableCol4: {
        flex: 2,
        textAlign: 'right',
        fontWeight: 'medium',
        color: '#1E293B',
    },
    totalsSection: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        wrap: false,
    },
    total: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 4,
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 'medium',
        textAlign: 'right',
        marginRight: 30,
        color: '#475569',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'medium',
        textAlign: 'right',
        width: 90,
        color: '#475569',
    },
    invoiceTotalWrapper: {
        marginTop: 10,
        wrap: false,
    },
    invoiceTotal: {
        marginTop: 2,
        padding: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    invoiceTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    invoiceTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    paymentInfo: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#64748B',
        wrap: false,
    },
    paymentInfoTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#1E293B',
    },
    paymentRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    paymentLabel: {
        fontSize: 9,
        color: '#64748B',
        width: 70,
    },
    paymentValue: {
        fontSize: 9,
        color: '#334155',
        fontWeight: 'medium',
    },
    thankYou: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 11,
        color: '#64748B',
        fontWeight: 'medium',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#94A3B8',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 20,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'medium',
        alignSelf: 'flex-start',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    paidStatus: {
        backgroundColor: '#DCFCE7',
        color: '#166534',
    },
    pendingStatus: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
    },
    draftStatus: {
        backgroundColor: '#F1F5F9',
        color: '#475569',
    }
});

// Create functions to build address components
const renderBusinessAddress = (businessInfo) => {
    const elements = [];

    if (businessInfo.address) {
        elements.push(
            React.createElement(Text, { key: 'street', style: styles.value }, businessInfo.address.street),
            React.createElement(Text, { key: 'city', style: styles.value }, `${businessInfo.address.city}, ${businessInfo.address.postCode}`),
            React.createElement(Text, { key: 'country', style: styles.value }, businessInfo.address.country)
        );
    }

    if (businessInfo.phone) {
        elements.push(
            React.createElement(Text, { key: 'phone', style: { ...styles.value, marginTop: 5 } }, businessInfo.phone)
        );
    }

    return elements;
};

const renderClientAddress = (clientAddress) => {
    if (!clientAddress) return [];

    return [
        React.createElement(Text, { key: 'street', style: styles.addressValue }, clientAddress.street),
        React.createElement(Text, { key: 'city', style: styles.addressValue }, clientAddress.city),
        React.createElement(Text, { key: 'postCode', style: styles.addressValue }, clientAddress.postCode),
        React.createElement(Text, { key: 'country', style: styles.addressValue }, clientAddress.country)
    ];
};

// Create function to render table rows
const renderTableRows = (items, currency, serviceTypes = []) => {
    return items.map((item, index) => {
        // Get service type name if available
        const serviceType = item.serviceType && item.serviceType !== 'other'
            ? serviceTypes.find(type => type.id === item.serviceType)?.name
            : null;

        // Item description with service type if available
        const description = serviceType
            ? `${item.name} (${serviceType})`
            : item.name;

        return React.createElement(
            View,
            {
                key: index,
                style: {
                    ...styles.tableRow,
                    ...(index % 2 === 1 ? styles.tableRowEven : {})
                }
            },
            React.createElement(Text, { style: styles.tableCol1 }, description),
            React.createElement(Text, { style: styles.tableCol2 }, item.quantity),
            React.createElement(Text, { style: styles.tableCol3 }, `${currency.symbol}${parseFloat(item.price || 0).toFixed(2)}`),
            React.createElement(Text, { style: styles.tableCol4 }, `${currency.symbol}${parseFloat(item.total || 0).toFixed(2)}`)
        );
    });
};

// Create function to render payment information
const renderPaymentInfo = (paymentDetails, invoiceId, t) => {
    if (!paymentDetails?.bankName && !paymentDetails?.iban && !paymentDetails?.swiftBic) {
        return null;
    }

    const elements = [];

    // Add title
    elements.push(
        React.createElement(Text, { key: 'title', style: { ...styles.label, marginTop: 15, marginBottom: 6 } }, t.paymentInformation)
    );

    if (paymentDetails.bankName) {
        elements.push(
            React.createElement(Text, { key: 'bank', style: { ...styles.value, marginBottom: 3 } }, `${t.bankName}: ${paymentDetails.bankName}`)
        );
    }

    if (paymentDetails.iban) {
        elements.push(
            React.createElement(Text, { key: 'iban', style: { ...styles.value, marginBottom: 3 } }, `${t.iban}: ${paymentDetails.iban}`)
        );
    }

    if (paymentDetails.swiftBic) {
        elements.push(
            React.createElement(Text, { key: 'swift', style: { ...styles.value, marginBottom: 3 } }, `${t.swiftBic}: ${paymentDetails.swiftBic}`)
        );
    }

    return elements;
};

// Status badge component
const renderStatusBadge = (status) => {
    let badgeStyle = styles.draftStatus;

    if (status === 'paid') {
        badgeStyle = styles.paidStatus;
    } else if (status === 'pending') {
        badgeStyle = styles.pendingStatus;
    }

    return React.createElement(
        Text,
        { style: { ...styles.statusBadge, ...badgeStyle } },
        status.toUpperCase()
    );
};

// Invoice document component without JSX
const InvoicePDF = (props) => {
    const { invoice, businessInfo, paymentDetails, currency, serviceTypes = [], language = 'en' } = props;

    // Get translations based on selected language
    const t = invoiceTranslations[language] || invoiceTranslations.en;

    return React.createElement(
        Document,
        {},
        React.createElement(
            Page,
            { size: 'A4', style: styles.page, wrap: true },
            // Header
            React.createElement(
                View,
                { style: styles.header, wrap: false },
                React.createElement(
                    View,
                    {},
                    React.createElement(Text, { style: styles.invoiceTitle }, t.invoice),
                    React.createElement(Text, { style: styles.invoiceSubtitle }, `#${invoice.id}`)
                ),
                React.createElement(
                    View,
                    { style: styles.businessInfo },
                    React.createElement(Text, { style: styles.businessName }, businessInfo.name),
                    ...renderBusinessAddress(businessInfo)
                )
            ),

            // Divider
            React.createElement(View, { style: styles.divider, wrap: false }),

            // Client and Invoice Info
            React.createElement(
                View,
                { style: styles.col2, wrap: false },
                React.createElement(
                    View,
                    { style: styles.col },
                    React.createElement(Text, { style: styles.label }, t.billTo),
                    React.createElement(Text, { style: styles.clientName }, invoice.clientName),
                    ...renderClientAddress(invoice.clientAddress),
                    React.createElement(Text, { style: { ...styles.value, marginTop: 5 } }, invoice.clientEmail || '')
                ),
                React.createElement(
                    View,
                    { style: styles.col },
                    React.createElement(
                        View,
                        { style: { alignItems: 'flex-end' } },
                        React.createElement(Text, { style: styles.label }, t.invoiceDetails),

                        React.createElement(
                            View,
                            { style: { ...styles.row, marginTop: 5 } },
                            React.createElement(Text, { style: { ...styles.value, textAlign: 'right', color: '#64748B', width: 100 } }, t.issueDate),
                            React.createElement(Text, { style: { ...styles.value, textAlign: 'right', fontWeight: 'medium', marginLeft: 8 } }, format(new Date(invoice.createdAt), 'dd MMM yyyy'))
                        ),

                        invoice.paymentDue ?
                            React.createElement(
                                View,
                                { style: styles.row },
                                React.createElement(Text, { style: { ...styles.value, textAlign: 'right', color: '#64748B', width: 100 } }, t.dueDate),
                                React.createElement(Text, { style: { ...styles.value, textAlign: 'right', fontWeight: 'medium', marginLeft: 8 } }, format(new Date(invoice.paymentDue), 'dd MMM yyyy'))
                            ) : null,

                        React.createElement(
                            View,
                            { style: styles.row },
                            React.createElement(Text, { style: { ...styles.value, textAlign: 'right', color: '#64748B', width: 100 } }, t.project),
                            React.createElement(Text, { style: { ...styles.value, textAlign: 'right', fontWeight: 'medium', marginLeft: 8 } }, invoice.projectDescription || 'N/A')
                        )
                    )
                )
            ),

            // Items Table Header
            React.createElement(
                View,
                { style: { ...styles.table, wrap: false } },
                React.createElement(
                    View,
                    { style: styles.tableHeader },
                    React.createElement(Text, { style: styles.tableCol1 }, t.itemDescription),
                    React.createElement(Text, { style: styles.tableCol2 }, t.hours),
                    React.createElement(Text, { style: styles.tableCol3 }, t.rate),
                    React.createElement(Text, { style: styles.tableCol4 }, t.amount)
                )
            ),

            // Items Table Rows (these can break across pages)
            React.createElement(
                View,
                { style: { width: '100%' } },
                ...renderTableRows(invoice.items, currency, serviceTypes)
            ),

            // Totals Section (keep together on one page)
            React.createElement(
                View,
                { style: styles.totalsSection, wrap: false },
                React.createElement(
                    View,
                    { style: styles.total },
                    React.createElement(Text, { style: styles.totalLabel }, t.subtotal),
                    React.createElement(Text, { style: styles.totalValue }, `${currency.symbol}${parseFloat(invoice.total || 0).toFixed(2)}`)
                ),

                React.createElement(
                    View,
                    { style: styles.invoiceTotalWrapper },
                    React.createElement(
                        View,
                        { style: styles.invoiceTotal },
                        React.createElement(Text, { style: styles.invoiceTotalLabel }, t.totalDue),
                        React.createElement(Text, { style: styles.invoiceTotalValue }, `${currency.symbol}${parseFloat(invoice.total || 0).toFixed(2)}`)
                    )
                )
            ),

            // Payment Information
            ...renderPaymentInfo(paymentDetails, invoice.id, t),

            // Thank You Note
            React.createElement(Text, { style: styles.thankYou }, t.thankYou),
        )
    );
};

export default InvoicePDF; 