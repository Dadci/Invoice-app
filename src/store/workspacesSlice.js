import { createSlice } from '@reduxjs/toolkit';

// Load workspaces from localStorage if available
const loadWorkspacesFromStorage = () => {
    try {
        const savedWorkspaces = localStorage.getItem('invoiceAppWorkspaces');
        const parsedWorkspaces = savedWorkspaces ? JSON.parse(savedWorkspaces) : null;

        return parsedWorkspaces;
    } catch (error) {
        console.error('Error loading workspaces from localStorage:', error);
        return null;
    }
};

const savedState = loadWorkspacesFromStorage();

const defaultInitialState = {
    workspaces: [
        {
            id: 'default',
            name: 'Personal',
            color: '#7C5DFA',
            description: 'Personal invoices and projects'
        },
    ],
    currentWorkspace: null,
    isLoading: false,
    error: null
};

// Use saved workspaces or default if none exist
const initialState = savedState || defaultInitialState;

// Helper to save state to localStorage
const saveWorkspacesToStorage = (state) => {
    try {
        localStorage.setItem('invoiceAppWorkspaces', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving workspaces to localStorage:', error);
    }
};

const workspacesSlice = createSlice({
    name: 'workspaces',
    initialState,
    reducers: {
        // Create a new workspace
        createWorkspace: (state, action) => {
            const newWorkspace = {
                id: Date.now().toString(),
                ...action.payload
            };
            state.workspaces.push(newWorkspace);

            // If this is the first workspace, set it as current
            if (state.workspaces.length === 1) {
                state.currentWorkspace = newWorkspace;
            }

            saveWorkspacesToStorage(state);
        },

        // Update an existing workspace
        updateWorkspace: (state, action) => {
            const { id, ...updates } = action.payload;
            const index = state.workspaces.findIndex(workspace => workspace.id === id);

            if (index !== -1) {
                state.workspaces[index] = {
                    ...state.workspaces[index],
                    ...updates
                };

                // If this is the current workspace, update it too
                if (state.currentWorkspace?.id === id) {
                    state.currentWorkspace = state.workspaces[index];
                }

                saveWorkspacesToStorage(state);
            }
        },

        // Delete a workspace
        deleteWorkspace: (state, action) => {
            const id = action.payload;
            state.workspaces = state.workspaces.filter(workspace => workspace.id !== id);

            // If the deleted workspace was the current one, set a new current workspace
            if (state.currentWorkspace?.id === id) {
                state.currentWorkspace = state.workspaces[0] || null;
            }

            saveWorkspacesToStorage(state);
        },

        // Set current workspace
        setCurrentWorkspace: (state, action) => {
            const workspace = state.workspaces.find(workspace => workspace.id === action.payload);
            state.currentWorkspace = workspace || state.workspaces[0] || null;

            saveWorkspacesToStorage(state);
        },

        // Initialize workspaces
        initializeWorkspaces: (state) => {
            // Set the first workspace as current if not already set
            if (!state.currentWorkspace && state.workspaces.length > 0) {
                state.currentWorkspace = state.workspaces[0];

                saveWorkspacesToStorage(state);
            }
        }
    }
});

export const {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    initializeWorkspaces
} = workspacesSlice.actions;

export default workspacesSlice.reducer; 