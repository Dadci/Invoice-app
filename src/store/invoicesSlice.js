import { createSlice } from '@reduxjs/toolkit'

// Load invoices from localStorage if available
const loadInvoicesFromStorage = () => {
    try {
        // Load all workspace-specific invoice data
        const savedInvoices = localStorage.getItem('invoiceAppInvoices')
        const parsedInvoices = savedInvoices ? JSON.parse(savedInvoices) : null

        // Reset UI filters to default values
        if (parsedInvoices) {
            parsedInvoices.filter = 'all'
            parsedInvoices.clientFilter = 'all'
            parsedInvoices.searchQuery = ''

            // Initialize workspaceInvoices if it doesn't exist
            if (!parsedInvoices.workspaceInvoices) {
                parsedInvoices.workspaceInvoices = {}

                // Migrate old invoices to default workspace if needed
                if (parsedInvoices.invoices && parsedInvoices.invoices.length > 0) {
                    parsedInvoices.workspaceInvoices['default'] = parsedInvoices.invoices
                }
            }
        }

        return parsedInvoices
    } catch (error) {
        console.error('Error loading invoices from localStorage:', error)
        return null
    }
}

const savedState = loadInvoicesFromStorage()

const defaultInitialState = {
    invoices: [], // Will be deprecated, use workspaceInvoices instead
    workspaceInvoices: {}, // Organized by workspace ID
    status: 'idle',
    error: null,
    filter: 'all',
    clientFilter: 'all',
    searchQuery: ''
}

// Use saved invoices or default if none exist
const initialState = savedState || defaultInitialState

// Helper to save state to localStorage
const saveInvoicesToStorage = (state) => {
    try {
        // Create a copy of the state without UI preferences
        const stateToPersist = {
            ...state,
            searchQuery: '',        // Don't persist search query
            filter: 'all',          // Reset filter to default when persisting
            clientFilter: 'all'     // Reset client filter
        }
        localStorage.setItem('invoiceAppInvoices', JSON.stringify(stateToPersist))
    } catch (error) {
        console.error('Error saving invoices to localStorage:', error)
    }
}

const invoiceSlice = createSlice({
    name: 'invoices',
    initialState,
    reducers: {
        addInvoice: {
            prepare: (invoiceData, workspaceId) => {
                // Generate a unique invoice number
                const invoiceNumber = `RT${Math.floor(Math.random() * 9000) + 1000}`;

                // Create the new invoice object
                const newInvoice = {
                    ...invoiceData,
                    id: invoiceNumber,
                    status: invoiceData.isDraft ? 'draft' : 'pending',
                    projectId: invoiceData.projectId || '',
                    projectName: invoiceData.projectName || '',
                    workspaceId: workspaceId || 'default', // Associate with workspace
                };

                return { payload: { invoice: newInvoice, workspaceId: workspaceId || 'default' } };
            },
            reducer: (state, action) => {
                const { invoice, workspaceId } = action.payload;

                // Initialize workspace if it doesn't exist
                if (!state.workspaceInvoices[workspaceId]) {
                    state.workspaceInvoices[workspaceId] = [];
                }

                // Add to workspace invoices at the beginning of the array (top of the list)
                state.workspaceInvoices[workspaceId].unshift(invoice);

                // For backward compatibility - use the current workspace's invoices
                state.invoices = state.workspaceInvoices[workspaceId];

                // Save to localStorage
                saveInvoicesToStorage(state);
            }
        },
        updateInvoiceStatus: (state, action) => {
            const { id, status, workspaceId = 'default' } = action.payload;

            // Find the invoice in the specific workspace
            if (state.workspaceInvoices[workspaceId]) {
                const invoice = state.workspaceInvoices[workspaceId].find(inv => inv.id === id);
                if (invoice) {
                    invoice.status = status;

                    // For backward compatibility
                    state.invoices = state.workspaceInvoices[workspaceId];

                    saveInvoicesToStorage(state);
                }
            }
        },
        setFilter: (state, action) => {
            state.filter = action.payload
            // No need to save filter to storage as it's a UI preference
        },
        setClientFilter: (state, action) => {
            state.clientFilter = action.payload
            // No need to save filter to storage as it's a UI preference
        },
        clearInvoiceFilters: (state) => {
            state.filter = 'all'
            state.clientFilter = 'all'
            state.searchQuery = ''
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
            // No need to save search query to storage as it's a UI preference
        },
        deleteInvoice: (state, action) => {
            const { id, workspaceId = 'default' } = action.payload;

            // Delete from the specific workspace
            if (state.workspaceInvoices[workspaceId]) {
                state.workspaceInvoices[workspaceId] = state.workspaceInvoices[workspaceId].filter(inv => inv.id !== id);

                // For backward compatibility
                state.invoices = state.workspaceInvoices[workspaceId];

                saveInvoicesToStorage(state);
            }
        },
        bulkDeleteInvoices: (state, action) => {
            // action.payload should be { ids: [...], workspaceId: string }
            const { ids, workspaceId = 'default' } = action.payload;

            // Delete from the specific workspace
            if (state.workspaceInvoices[workspaceId]) {
                state.workspaceInvoices[workspaceId] = state.workspaceInvoices[workspaceId].filter(invoice => !ids.includes(invoice.id));

                // For backward compatibility
                state.invoices = state.workspaceInvoices[workspaceId];

                saveInvoicesToStorage(state);
            }
        },
        editInvoice: (state, action) => {
            try {
                const payload = action.payload || {};
                const invoice = payload.invoice || {};
                const workspaceId = payload.workspaceId || invoice.workspaceId || 'default';

                // Make sure we have a valid ID to work with
                if (!invoice || !invoice.id) {
                    console.error('Invalid invoice data for editing: missing ID');
                    return;
                }

                // Ensure the workspace exists
                if (!state.workspaceInvoices[workspaceId]) {
                    state.workspaceInvoices[workspaceId] = [];
                }

                // Find in the specific workspace
                const index = state.workspaceInvoices[workspaceId].findIndex(inv => inv?.id === invoice.id);

                if (index !== -1) {
                    const existingInvoice = state.workspaceInvoices[workspaceId][index] || {};

                    state.workspaceInvoices[workspaceId][index] = {
                        ...invoice,
                        // Ensure project fields are always present
                        projectId: invoice.projectId || existingInvoice.projectId || '',
                        projectName: invoice.projectName || existingInvoice.projectName || '',
                        workspaceId, // Always keep the workspace ID
                    };

                    // For backward compatibility
                    state.invoices = state.workspaceInvoices[workspaceId];

                    saveInvoicesToStorage(state);
                } else {
                    console.error(`Invoice with ID ${invoice.id} not found in workspace ${workspaceId}`);
                }
            } catch (error) {
                console.error('Error editing invoice:', error);
            }
        },
        // Set active workspace invoices (for when a user switches workspaces)
        setActiveWorkspaceInvoices: (state, action) => {
            const workspaceId = action.payload || 'default';

            // Initialize workspace if it doesn't exist
            if (!state.workspaceInvoices[workspaceId]) {
                state.workspaceInvoices[workspaceId] = [];
            }

            // Set the current invoices to the selected workspace's invoices
            state.invoices = state.workspaceInvoices[workspaceId];
        }
    }
})

export const {
    addInvoice,
    updateInvoiceStatus,
    setFilter,
    setClientFilter,
    clearInvoiceFilters,
    setSearchQuery,
    deleteInvoice,
    bulkDeleteInvoices,
    editInvoice,
    setActiveWorkspaceInvoices
} = invoiceSlice.actions
export default invoiceSlice.reducer