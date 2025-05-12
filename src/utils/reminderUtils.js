import { addDays, isLastDayOfMonth, endOfMonth, startOfDay, parseISO, isBefore, differenceInDays } from 'date-fns';
import { store } from '../store/store';
import { addNotification } from '../store/notificationsSlice';
import { checkForMonthEndInvoicing } from './invoiceAutomation';

/**
 * Checks for month-end notifications and creates them if needed
 * @param {Date} today - The current date to check against
 */
export function checkForMonthEndReminders(today = new Date()) {
    const state = store.getState();
    const { settings } = state.notifications;
    const { monthEndReminder, reminderDays } = settings;
    const currentWorkspaceId = state.workspaces.currentWorkspace?.id || 'default';

    if (!monthEndReminder) return;

    // Get end of month
    const endOfMonthDate = endOfMonth(today);
    const daysDifference = differenceInDays(endOfMonthDate, today);

    // If we're within the reminder days range of month end
    if (daysDifference <= reminderDays && daysDifference >= 0) {
        // Create a notification for month end invoicing
        store.dispatch(addNotification({
            type: 'monthEnd',
            title: 'Month End Reminder',
            message: `End of month is in ${daysDifference === 0 ? 'today' : daysDifference === 1 ? 'tomorrow' : `${daysDifference} days`}. Don't forget to finalize and send your monthly invoices.`,
            workspaceId: currentWorkspaceId
        }));
    }
}

/**
 * Checks for project deadline reminders and creates notifications if needed
 * @param {Date} today - The current date to check against
 */
export function checkForProjectDeadlineReminders(today = new Date()) {
    const state = store.getState();
    const { projects } = state.projects;
    const { settings } = state.notifications;
    const { projectDeadlineReminder, reminderDays } = settings;
    const currentWorkspaceId = state.workspaces.currentWorkspace?.id || 'default';

    if (!projectDeadlineReminder) return;

    const todayStart = startOfDay(today);

    // Check each project
    projects.forEach(project => {
        if (!project.deadline) return;

        // Skip projects that don't belong to current workspace
        if (project.workspaceId && project.workspaceId !== currentWorkspaceId) return;

        // Parse deadline string to Date object
        const deadlineDate = parseISO(project.deadline);
        const daysDifference = differenceInDays(deadlineDate, today);

        // If deadline is within reminder days and not in the past
        if (daysDifference <= reminderDays && daysDifference >= 0) {
            store.dispatch(addNotification({
                type: 'projectDeadline',
                title: 'Project Deadline Approaching',
                message: `Project "${project.title}" is due ${daysDifference === 0 ? 'today' : daysDifference === 1 ? 'tomorrow' : `in ${daysDifference} days`}.`,
                workspaceId: project.workspaceId || currentWorkspaceId
            }));
        }
    });
}

/**
 * Checks for payment due date reminders and creates notifications if needed
 * @param {Date} today - The current date to check against
 */
export function checkForPaymentDueReminders(today = new Date()) {
    const state = store.getState();
    const { workspaceInvoices } = state.invoices;
    const { settings } = state.notifications;
    const { paymentDueReminder, reminderDays } = settings;
    const currentWorkspaceId = state.workspaces.currentWorkspace?.id || 'default';

    if (!paymentDueReminder) return;

    const todayStart = startOfDay(today);

    // Check invoices in all workspaces
    Object.entries(workspaceInvoices).forEach(([workspaceId, invoices]) => {
        // Check each invoice for the workspace
        invoices.forEach(invoice => {
            if (invoice.status !== 'pending' || !invoice.paymentDue) return;

            // Parse due date string to Date object
            const dueDate = parseISO(invoice.paymentDue);
            const daysDifference = differenceInDays(dueDate, today);

            // If payment is due within reminder days and not in the past
            if (daysDifference <= reminderDays && daysDifference >= 0) {
                store.dispatch(addNotification({
                    type: 'paymentDue',
                    title: 'Payment Due Soon',
                    message: `Payment for invoice #${invoice.id} from ${invoice.clientName} is due ${daysDifference === 0 ? 'today' : daysDifference === 1 ? 'tomorrow' : `in ${daysDifference} days`}.`,
                    invoiceId: invoice.id,
                    workspaceId: workspaceId
                }));
            }
        });
    });
}

/**
 * Checks for automatic invoice generation based on settings
 */
export function checkForAutomaticInvoiceGeneration() {
    const state = store.getState();
    const settingsState = state.settings;
    const currentWorkspaceId = state.workspaces.currentWorkspace?.id || 'default';

    // Check if invoice automation is enabled
    if (settingsState.invoiceAutomation?.enabled &&
        settingsState.invoiceAutomation?.generateMonthEndInvoices) {

        // Run the month-end invoicing check using the store dispatch
        checkForMonthEndInvoicing(
            store.dispatch,
            state,
            settingsState,
            currentWorkspaceId
        );
    }
}

/**
 * Checks all types of reminders at once
 */
export function checkAllReminders() {
    const today = new Date();
    checkForMonthEndReminders(today);
    checkForProjectDeadlineReminders(today);
    checkForPaymentDueReminders(today);
    checkForAutomaticInvoiceGeneration();
} 