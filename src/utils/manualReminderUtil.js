import { store } from '../store/store';
import { addNotification } from '../store/notificationsSlice';

/**
 * Utility function to create a manual reminder notification
 * @param {string} type - The type of notification ('monthEnd', 'projectDeadline', or 'paymentDue')
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 */
export function createManualReminder(type, title, message) {
    store.dispatch(addNotification({
        type: type || 'monthEnd',
        title: title || 'Manual Reminder',
        message: message || 'This is a manually created reminder.'
    }));
}

/**
 * Creates a manual invoice reminder notification
 * @param {Object} params - Parameters for the reminder
 * @param {String} params.invoiceId - ID of the invoice to remind about
 * @param {String} params.clientName - Name of the client
 * @param {Number} params.amount - Invoice amount
 * @param {String} params.workspaceId - ID of the workspace the invoice belongs to
 * @returns {Boolean} - Whether the reminder was created successfully
 */
export const createManualInvoiceReminder = ({ invoiceId, clientName, amount, workspaceId = 'default' }) => {
    if (!invoiceId || !clientName) {
        console.error('Cannot create reminder: Missing required parameters');
        return false;
    }

    // Format the amount as currency
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);

    // Create a notification for the invoice reminder
    store.dispatch(addNotification({
        type: 'invoiceReminder',
        title: 'Invoice Reminder Sent',
        message: `A payment reminder for ${formattedAmount} has been sent to ${clientName}.`,
        invoiceId, // Include the invoice ID for the View Invoice action
        workspaceId // Include the workspace ID
    }));

    return true;
};

// This file is kept for future use if manual reminder creation is needed
// but is not currently used in the application. 