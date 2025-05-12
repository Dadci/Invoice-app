import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_SERVICE_TYPES } from '../utils/constants'

// Load settings from localStorage if available
const loadSettingsFromStorage = () => {
    try {
        const savedSettings = localStorage.getItem('invoiceAppSettings')
        const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null

        // Initialize workspaceSettings if it doesn't exist
        if (parsedSettings && !parsedSettings.workspaceSettings) {
            parsedSettings.workspaceSettings = {}

            // Migrate old settings to default workspace if needed
            if (parsedSettings.businessInfo || parsedSettings.paymentDetails) {
                parsedSettings.workspaceSettings['default'] = {
                    businessInfo: parsedSettings.businessInfo || defaultWorkspaceSettings.businessInfo,
                    paymentDetails: parsedSettings.paymentDetails || defaultWorkspaceSettings.paymentDetails,
                    currency: parsedSettings.currency || defaultWorkspaceSettings.currency,
                    serviceTypes: parsedSettings.serviceTypes || defaultWorkspaceSettings.serviceTypes,
                    invoiceAutomation: parsedSettings.invoiceAutomation || defaultWorkspaceSettings.invoiceAutomation
                }
            }
        }

        return parsedSettings
    } catch (error) {
        console.error('Error loading settings from localStorage:', error)
        return null
    }
}

const savedSettings = loadSettingsFromStorage()

// Default settings for a new workspace
const defaultWorkspaceSettings = {
    businessInfo: {
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            postCode: '',
            country: ''
        },
        taxId: ''
    },
    paymentDetails: {
        bankName: '',
        iban: '',
        swiftBic: ''
    },
    currency: {
        code: 'GBP',
        symbol: '£'
    },
    serviceTypes: DEFAULT_SERVICE_TYPES,
    invoiceAutomation: {
        enabled: false,
        generateMonthEndInvoices: false,
        defaultHourlyRate: 50,
        defaultPaymentTerms: 30
    }
}

const defaultInitialState = {
    // Legacy fields for backward compatibility
    businessInfo: {
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            postCode: '',
            country: ''
        },
        taxId: ''
    },
    paymentDetails: {
        bankName: '',
        iban: '',
        swiftBic: ''
    },
    currency: {
        code: 'GBP',
        symbol: '£'
    },
    serviceTypes: DEFAULT_SERVICE_TYPES,
    invoiceAutomation: {
        enabled: false,
        generateMonthEndInvoices: false,
        defaultHourlyRate: 50,
        defaultPaymentTerms: 30
    },
    // New workspace-specific settings
    workspaceSettings: {
        'default': { ...defaultWorkspaceSettings }
    },
    // Available currencies are shared across all workspaces
    availableCurrencies: [
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
    ]
}

// Use saved settings or default if none exist
const initialState = savedSettings || defaultInitialState

// Helper to save state to localStorage
const saveSettingsToStorage = (state) => {
    try {
        localStorage.setItem('invoiceAppSettings', JSON.stringify(state))
    } catch (error) {
        console.error('Error saving settings to localStorage:', error)
    }
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        updateBusinessInfo: (state, action) => {
            const { data, workspaceId = 'default' } = action.payload;

            // Initialize workspace settings if needed
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Update workspace-specific settings
            state.workspaceSettings[workspaceId].businessInfo = {
                ...state.workspaceSettings[workspaceId].businessInfo,
                ...data
            };

            // For backward compatibility
            if (workspaceId === 'default') {
                state.businessInfo = {
                    ...state.businessInfo,
                    ...data
                };
            }

            saveSettingsToStorage(state);
        },
        updateBusinessAddress: (state, action) => {
            const { data, workspaceId = 'default' } = action.payload;

            // Initialize workspace settings if needed
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Update workspace-specific settings
            state.workspaceSettings[workspaceId].businessInfo.address = {
                ...state.workspaceSettings[workspaceId].businessInfo.address,
                ...data
            };

            // For backward compatibility
            if (workspaceId === 'default') {
                state.businessInfo.address = {
                    ...state.businessInfo.address,
                    ...data
                };
            }

            saveSettingsToStorage(state);
        },
        updatePaymentDetails: (state, action) => {
            const { data, workspaceId = 'default' } = action.payload;

            // Initialize workspace settings if needed
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Update workspace-specific settings
            state.workspaceSettings[workspaceId].paymentDetails = {
                ...state.workspaceSettings[workspaceId].paymentDetails,
                ...data
            };

            // For backward compatibility
            if (workspaceId === 'default') {
                state.paymentDetails = {
                    ...state.paymentDetails,
                    ...data
                };
            }

            saveSettingsToStorage(state);
        },
        changeCurrency: (state, action) => {
            const { data, workspaceId = 'default' } = action.payload;

            // Initialize workspace settings if needed
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Update workspace-specific settings
            state.workspaceSettings[workspaceId].currency = data;

            // For backward compatibility
            if (workspaceId === 'default') {
                state.currency = data;
            }

            saveSettingsToStorage(state);
        },
        addServiceType: (state, action) => {
            const { data, workspaceId = 'default' } = action.payload;

            // Initialize workspace settings if needed
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Update workspace-specific settings
            state.workspaceSettings[workspaceId].serviceTypes.push(data);

            // For backward compatibility
            if (workspaceId === 'default') {
                state.serviceTypes.push(data);
            }

            saveSettingsToStorage(state);
        },
        removeServiceType: (state, action) => {
            const { data, workspaceId = 'default' } = action.payload;

            // Initialize workspace settings if needed
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Update workspace-specific settings
            state.workspaceSettings[workspaceId].serviceTypes =
                state.workspaceSettings[workspaceId].serviceTypes.filter(
                    serviceType => serviceType.id !== data
                );

            // For backward compatibility
            if (workspaceId === 'default') {
                state.serviceTypes = state.serviceTypes.filter(
                    serviceType => serviceType.id !== data
                );
            }

            saveSettingsToStorage(state);
        },
        updateInvoiceAutomation: (state, action) => {
            const { data, workspaceId = 'default' } = action.payload;

            // Initialize workspace settings if needed
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Update workspace-specific settings
            state.workspaceSettings[workspaceId].invoiceAutomation = {
                ...state.workspaceSettings[workspaceId].invoiceAutomation,
                ...data
            };

            // For backward compatibility
            if (workspaceId === 'default') {
                state.invoiceAutomation = {
                    ...state.invoiceAutomation,
                    ...data
                };
            }

            saveSettingsToStorage(state);
        },
        // Set active workspace settings
        setActiveWorkspaceSettings: (state, action) => {
            const workspaceId = action.payload || 'default';

            // Initialize workspace settings if it doesn't exist
            if (!state.workspaceSettings[workspaceId]) {
                state.workspaceSettings[workspaceId] = { ...defaultWorkspaceSettings };
            }

            // Set legacy fields to match the active workspace for backward compatibility
            state.businessInfo = state.workspaceSettings[workspaceId].businessInfo;
            state.paymentDetails = state.workspaceSettings[workspaceId].paymentDetails;
            state.currency = state.workspaceSettings[workspaceId].currency;
            state.serviceTypes = state.workspaceSettings[workspaceId].serviceTypes;
            state.invoiceAutomation = state.workspaceSettings[workspaceId].invoiceAutomation;
        }
    }
})

export const {
    updateBusinessInfo,
    updateBusinessAddress,
    updatePaymentDetails,
    changeCurrency,
    addServiceType,
    removeServiceType,
    updateInvoiceAutomation,
    setActiveWorkspaceSettings
} = settingsSlice.actions
export default settingsSlice.reducer 