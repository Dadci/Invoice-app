import { addNotification } from '../store/notificationsSlice';
import { addInvoice } from '../store/invoicesSlice';
import { addInvoiceToProject } from '../store/projectsSlice';

/**
 * Generates an automated invoice for a client based on projects within the current month
 * @param {Object} params - Parameters for invoice generation
 * @param {Array} params.projects - All projects
 * @param {String} params.clientName - Client name to filter projects by
 * @param {String} params.clientEmail - Client email
 * @param {String} params.clientAddress - Client address
 * @param {Object} params.userDetails - User details for the invoice
 * @param {Number} params.hourlyRate - Hourly rate for billing
 * @param {Number} params.paymentTerms - Payment terms in days
 * @param {Function} params.dispatch - Redux dispatch function
 * @param {Boolean} params.includeAllProjects - Whether to include all projects regardless of client
 * @param {String} params.workspaceId - Current workspace ID
 * @returns {Object} - The generated invoice data
 */
export const generateMonthEndInvoice = ({
    projects,
    clientName,
    clientEmail,
    clientAddress,
    userDetails,
    hourlyRate,
    paymentTerms = 30,
    dispatch,
    includeAllProjects = false,
    workspaceId = 'default'
}) => {
    // Get current month's start and end dates
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter projects based on date, client, and workspace
    const filteredProjects = projects.filter(project => {
        // For date filtering
        const projectDate = new Date(project.createdAt);
        const isInCurrentMonth = projectDate >= firstDayOfMonth && projectDate <= lastDayOfMonth;

        // Only include projects from the current workspace
        const isInCurrentWorkspace = !project.workspaceId || project.workspaceId === workspaceId;

        if (!isInCurrentWorkspace) return false;

        // If we're including all projects, just check date and workspace
        if (includeAllProjects) {
            return isInCurrentMonth;
        }

        // Otherwise filter by client name too (case insensitive)
        return isInCurrentMonth && project.clientName.toLowerCase() === clientName.toLowerCase();
    });

    if (filteredProjects.length === 0) {
        // Notify that no projects were found for the period
        if (dispatch) {
            dispatch(addNotification({
                title: 'No Projects Found',
                message: includeAllProjects
                    ? 'No active projects found for the current month.'
                    : `No active projects found for ${clientName} in the current month.`,
                type: 'info',
                workspaceId
            }));
        }
        return null;
    }

    // Calculate the invoice details
    const invoiceItems = filteredProjects.map(project => {
        // Use estimated hours if available
        const hours = project.hoursEstimated || 0;

        // Use project-specific hourly rate if available, otherwise use default rate
        const rateToUse = project.hourlyRate || hourlyRate;
        const total = hours * rateToUse;

        // If we're including all projects, add client name to line item for clarity
        const itemName = includeAllProjects && project.clientName
            ? `${project.name} (${project.clientName})`
            : project.name;

        return {
            name: itemName,
            quantity: hours,
            price: rateToUse,
            total: total,
            description: `Services for project: ${project.name}`
        };
    });

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // Could be configurable in the future
    const total = subtotal + tax;

    // Create payment terms based on the settings
    const paymentDue = new Date(now);
    paymentDue.setDate(paymentDue.getDate() + paymentTerms);

    // Set appropriate title based on whether this is for all projects or a specific client
    const invoiceTitle = includeAllProjects
        ? `Monthly Invoice - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`
        : `Monthly Invoice for ${clientName} - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`;

    // Create invoice object
    const invoiceData = {
        createdAt: new Date().toISOString(),
        paymentDue: paymentDue.toISOString(),
        description: invoiceTitle,
        paymentTerms,
        clientName,
        clientEmail,
        clientAddress: {
            street: clientAddress.street || '',
            city: clientAddress.city || '',
            postCode: clientAddress.postCode || '',
            country: clientAddress.country || ''
        },
        senderAddress: {
            street: userDetails.street || '',
            city: userDetails.city || '',
            postCode: userDetails.postCode || '',
            country: userDetails.country || ''
        },
        items: invoiceItems,
        total,
        status: 'pending',
        isDraft: false,
        workspaceId // Include the workspace ID
    };

    // Dispatch action to add invoice if dispatch is provided
    if (dispatch) {
        // Pass the workspaceId to the addInvoice action
        const action = dispatch(addInvoice(invoiceData, workspaceId));
        const invoiceId = action.payload.invoice.id;

        console.log("Generated invoice action:", action);
        console.log("New invoice with ID:", invoiceId, "for workspace:", workspaceId);

        // Link the invoice to each project
        if (invoiceId) {
            filteredProjects.forEach(project => {
                dispatch(addInvoiceToProject({
                    projectId: project.id,
                    invoiceId
                }));
            });

            // Create a single combined notification with both information and action
            dispatch(addNotification({
                title: 'Invoice Generated Successfully',
                message: `Invoice #${invoiceId} is ready to be sent to the client.`,
                type: 'invoiceReminder',
                actionable: true,
                invoiceId: invoiceId,
                workspaceId
            }));

            console.log('Added notification for invoice:', invoiceId, 'in workspace:', workspaceId);
        } else {
            console.error('Failed to get invoice ID from addInvoice action');
        }
    }

    return invoiceData;
};

/**
 * Checks if automated invoices should be generated at month-end
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} state - Redux state
 * @param {Object} settings - User settings
 * @param {String} workspaceId - Current workspace ID
 */
export const checkForMonthEndInvoicing = (dispatch, state, settings, workspaceId = 'default') => {
    // Check if we're at month end (last 2 days of month)
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();

    // Only run on the last 2 days of the month
    const isMonthEnd = currentDay >= lastDayOfMonth - 1;

    if (!isMonthEnd) {
        return;
    }

    // Get projects for current workspace
    const { projects } = state.projects;
    const workspaceProjects = projects.filter(project =>
        !project.workspaceId || project.workspaceId === workspaceId
    );

    // Get unique clients from workspace projects
    const clients = [...new Set(workspaceProjects.map(project => project.clientName))];

    // For each client, generate a month-end invoice
    clients.forEach(clientName => {
        // Find a project for this client to get their details
        const clientProject = workspaceProjects.find(p => p.clientName === clientName);

        if (clientProject) {
            generateMonthEndInvoice({
                projects: workspaceProjects,
                clientName,
                clientEmail: clientProject.clientEmail || '',
                clientAddress: clientProject.clientAddress || {},
                userDetails: settings.businessInfo || {},
                hourlyRate: settings.invoiceAutomation?.defaultHourlyRate || 50, // Default hourly rate
                paymentTerms: settings.invoiceAutomation?.defaultPaymentTerms || 30, // Default payment terms
                dispatch,
                workspaceId
            });
        }
    });

    // Optionally create a consolidated invoice for all clients if that setting is enabled
    if (settings.invoiceAutomation?.generateConsolidatedInvoices && clients.length > 1) {
        // For a consolidated invoice, we need to pick a primary client
        // This is just a placeholder - in a real app, you might have a "default client" setting
        const primaryClient = clients[0];
        const primaryProject = workspaceProjects.find(p => p.clientName === primaryClient);

        if (primaryProject) {
            generateMonthEndInvoice({
                projects: workspaceProjects,
                clientName: primaryClient,
                clientEmail: primaryProject.clientEmail || '',
                clientAddress: primaryProject.clientAddress || {},
                userDetails: settings.businessInfo || {},
                hourlyRate: settings.invoiceAutomation?.defaultHourlyRate || 50,
                paymentTerms: settings.invoiceAutomation?.defaultPaymentTerms || 30,
                dispatch,
                includeAllProjects: true, // This is what makes it consolidate all projects
                workspaceId
            });
        }
    }
}; 