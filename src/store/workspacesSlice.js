import { createSlice } from '@reduxjs/toolkit';

// Define roles and permissions
export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer'
};

export const PERMISSIONS = {
    // Workspace management
    MANAGE_WORKSPACE: 'manage_workspace',        // Update or delete workspace settings
    INVITE_MEMBERS: 'invite_members',            // Invite new members to workspace
    MANAGE_MEMBERS: 'manage_members',            // Update or remove members

    // Invoice management
    CREATE_INVOICE: 'create_invoice',            // Create new invoices
    EDIT_INVOICE: 'edit_invoice',                // Edit existing invoices
    DELETE_INVOICE: 'delete_invoice',            // Delete invoices
    VIEW_INVOICE: 'view_invoice',                // View invoices

    // Project management
    CREATE_PROJECT: 'create_project',            // Create new projects
    EDIT_PROJECT: 'edit_project',                // Edit existing projects
    DELETE_PROJECT: 'delete_project',            // Delete projects
    VIEW_PROJECT: 'view_project',                // View projects

    // Settings
    MANAGE_SETTINGS: 'manage_settings',          // Change workspace settings
};

// Define role permissions
export const ROLE_PERMISSIONS = {
    [ROLES.OWNER]: [
        // Owners have all permissions
        ...Object.values(PERMISSIONS)
    ],
    [ROLES.ADMIN]: [
        // Admins can do almost everything except delete the workspace
        PERMISSIONS.INVITE_MEMBERS,
        PERMISSIONS.MANAGE_MEMBERS,
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.EDIT_INVOICE,
        PERMISSIONS.DELETE_INVOICE,
        PERMISSIONS.VIEW_INVOICE,
        PERMISSIONS.CREATE_PROJECT,
        PERMISSIONS.EDIT_PROJECT,
        PERMISSIONS.DELETE_PROJECT,
        PERMISSIONS.VIEW_PROJECT,
        PERMISSIONS.MANAGE_SETTINGS,
    ],
    [ROLES.MEMBER]: [
        // Members can manage content but not users or workspace settings
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.EDIT_INVOICE,
        PERMISSIONS.VIEW_INVOICE,
        PERMISSIONS.CREATE_PROJECT,
        PERMISSIONS.EDIT_PROJECT,
        PERMISSIONS.VIEW_PROJECT,
    ],
    [ROLES.VIEWER]: [
        // Viewers can only view content
        PERMISSIONS.VIEW_INVOICE,
        PERMISSIONS.VIEW_PROJECT,
    ]
};

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

// Get the current user info
const getCurrentUser = () => {
    // In a real application, this would come from authentication
    // For now, we'll use a mock user
    return {
        id: 'current-user',
        name: 'Current User',
        email: 'user@example.com'
    };
};

const savedState = loadWorkspacesFromStorage();
const currentUser = getCurrentUser();

const defaultInitialState = {
    workspaces: [
        {
            id: 'default',
            name: 'Personal',
            color: '#7C5DFA',
            description: 'Personal invoices and projects',
            members: [
                {
                    userId: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    role: ROLES.OWNER,
                    joinedAt: new Date().toISOString()
                }
            ]
        },
    ],
    currentWorkspace: null,
    currentUser: currentUser,
    isLoading: false,
    error: null
};

// Use saved workspaces or default if none exist
const initialState = savedState ? {
    ...savedState,
    // Ensure currentUser always exists
    currentUser: savedState.currentUser || currentUser
} : defaultInitialState;

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
            try {
                // Generate a new workspace ID
                const workspaceId = Date.now().toString();

                // Get current user with fallback
                const currentUser = state.currentUser || {
                    id: 'default-user',
                    name: 'User',
                    email: 'user@example.com'
                };

                // Create a new workspace object with safe defaults for all properties
                const newWorkspace = {
                    id: workspaceId,
                    name: action.payload?.name || 'New Workspace',
                    description: action.payload?.description || '',
                    color: action.payload?.color || '#7C5DFA',
                    clientTypes: action.payload?.clientTypes || [],
                    industryType: action.payload?.industryType || '',
                    defaultHourlyRate: action.payload?.defaultHourlyRate || 50,
                    defaultCurrency: action.payload?.defaultCurrency || 'USD',
                    members: [
                        {
                            userId: currentUser.id,
                            name: currentUser.name,
                            email: currentUser.email,
                            role: ROLES.OWNER,
                            joinedAt: new Date().toISOString()
                        }
                    ]
                };

                // Add the new workspace to the state
                state.workspaces.push(newWorkspace);

                // Set this new workspace as the current one
                state.currentWorkspace = newWorkspace;

                // Save updated state to localStorage
                saveWorkspacesToStorage(state);

                console.log("Workspace created successfully:", newWorkspace);
            } catch (error) {
                console.error("Error in createWorkspace reducer:", error);
            }
        },

        // Update an existing workspace
        updateWorkspace: (state, action) => {
            const { id, ...updates } = action.payload;
            const index = state.workspaces.findIndex(workspace => workspace.id === id);

            if (index !== -1) {
                // Preserve the members array when updating
                const members = state.workspaces[index].members || [];

                state.workspaces[index] = {
                    ...state.workspaces[index],
                    ...updates,
                    members
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
            try {
                // Set the first workspace as current if not already set
                if (!state.currentWorkspace && state.workspaces.length > 0) {
                    state.currentWorkspace = state.workspaces[0];

                    // Get current user with fallback
                    const currentUser = state.currentUser || {
                        id: 'default-user',
                        name: 'User',
                        email: 'user@example.com'
                    };

                    // Ensure all workspaces have a members array with the current user
                    state.workspaces.forEach(workspace => {
                        if (!workspace.members || workspace.members.length === 0) {
                            workspace.members = [
                                {
                                    userId: currentUser.id,
                                    name: currentUser.name,
                                    email: currentUser.email,
                                    role: ROLES.OWNER,
                                    joinedAt: new Date().toISOString()
                                }
                            ];
                        }
                    });

                    saveWorkspacesToStorage(state);
                }
            } catch (error) {
                console.error("Error in initializeWorkspaces reducer:", error);
            }
        },

        // Add a member to a workspace
        addWorkspaceMember: (state, action) => {
            const { workspaceId, member } = action.payload;
            const workspace = state.workspaces.find(w => w.id === workspaceId);

            if (workspace) {
                // Initialize members array if it doesn't exist
                if (!workspace.members) {
                    workspace.members = [];
                }

                // Check if member already exists
                const existingMemberIndex = workspace.members.findIndex(m => m.userId === member.userId);

                if (existingMemberIndex === -1) {
                    // Add new member with timestamp
                    workspace.members.push({
                        ...member,
                        joinedAt: new Date().toISOString()
                    });

                    // Update current workspace if needed
                    if (state.currentWorkspace?.id === workspaceId) {
                        state.currentWorkspace = workspace;
                    }

                    saveWorkspacesToStorage(state);
                }
            }
        },

        // Update a member's role in a workspace
        updateWorkspaceMember: (state, action) => {
            const { workspaceId, userId, updates } = action.payload;
            const workspace = state.workspaces.find(w => w.id === workspaceId);

            if (workspace && workspace.members) {
                const memberIndex = workspace.members.findIndex(m => m.userId === userId);

                if (memberIndex !== -1) {
                    // Don't allow changing the role of the only owner
                    if (updates.role &&
                        workspace.members[memberIndex].role === ROLES.OWNER &&
                        updates.role !== ROLES.OWNER &&
                        workspace.members.filter(m => m.role === ROLES.OWNER).length === 1) {
                        return;
                    }

                    workspace.members[memberIndex] = {
                        ...workspace.members[memberIndex],
                        ...updates
                    };

                    // Update current workspace if needed
                    if (state.currentWorkspace?.id === workspaceId) {
                        state.currentWorkspace = workspace;
                    }

                    saveWorkspacesToStorage(state);
                }
            }
        },

        // Remove a member from a workspace
        removeWorkspaceMember: (state, action) => {
            const { workspaceId, userId } = action.payload;
            const workspace = state.workspaces.find(w => w.id === workspaceId);

            if (workspace && workspace.members) {
                const memberIndex = workspace.members.findIndex(m => m.userId === userId);

                if (memberIndex !== -1) {
                    // Don't allow removing the only owner
                    if (workspace.members[memberIndex].role === ROLES.OWNER &&
                        workspace.members.filter(m => m.role === ROLES.OWNER).length === 1) {
                        return;
                    }

                    workspace.members.splice(memberIndex, 1);

                    // Update current workspace if needed
                    if (state.currentWorkspace?.id === workspaceId) {
                        state.currentWorkspace = workspace;
                    }

                    saveWorkspacesToStorage(state);
                }
            }
        },

        // Check if current user has permission for an action
        hasPermission: (state, action) => {
            const { permission } = action.payload;

            // If no current workspace, no permissions
            if (!state.currentWorkspace) return false;

            // Find current user in workspace members
            const currentMember = state.currentWorkspace.members?.find(m => m.userId === state.currentUser.id);

            // If user is not a member, no permissions
            if (!currentMember) return false;

            // Get permissions for user's role
            const rolePermissions = ROLE_PERMISSIONS[currentMember.role] || [];

            // Check if the requested permission is in the role's permissions
            return rolePermissions.includes(permission);
        }
    }
});

export const {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    initializeWorkspaces,
    addWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember,
    hasPermission
} = workspacesSlice.actions;

export default workspacesSlice.reducer; 