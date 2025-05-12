import { createSlice } from '@reduxjs/toolkit'

// Load projects from localStorage if available
const loadProjectsFromStorage = () => {
    try {
        const savedProjects = localStorage.getItem('invoiceAppProjects')
        const parsedProjects = savedProjects ? JSON.parse(savedProjects) : null

        // Ensure all projects have the required properties set
        if (parsedProjects && parsedProjects.projects) {
            parsedProjects.projects = parsedProjects.projects.map(project => ({
                ...project,
                serviceTypes: Array.isArray(project.serviceTypes) ? project.serviceTypes : [],
                hoursEstimated: project.hoursEstimated || 0,
                hoursLogged: project.hoursLogged || 0,
                invoices: Array.isArray(project.invoices) ? project.invoices : [],
                priority: project.priority || 'medium', // Default priority if not present
                tasks: Array.isArray(project.tasks) ? project.tasks : [] // Initialize tasks array
            }))

            // Reset UI filters to default values
            parsedProjects.filter = 'all'
            parsedProjects.serviceTypeFilter = 'all'
            parsedProjects.priorityFilter = 'all'
            parsedProjects.searchQuery = ''

            // Initialize workspaceProjects if it doesn't exist
            if (!parsedProjects.workspaceProjects) {
                parsedProjects.workspaceProjects = {}

                // Migrate old projects to default workspace if needed
                if (parsedProjects.projects && parsedProjects.projects.length > 0) {
                    parsedProjects.workspaceProjects['default'] = parsedProjects.projects
                }
            }
        }

        return parsedProjects
    } catch (error) {
        console.error('Error loading projects from localStorage:', error)
        return null
    }
}

const savedState = loadProjectsFromStorage()

const defaultInitialState = {
    projects: [], // Will be deprecated, use workspaceProjects instead
    workspaceProjects: {}, // Organized by workspace ID
    status: 'idle',
    error: null,
    filter: 'all',
    serviceTypeFilter: 'all',
    priorityFilter: 'all',
    searchQuery: ''
}

// Use saved projects or default if none exist
const initialState = savedState || defaultInitialState

// Helper to save state to localStorage
const saveProjectsToStorage = (state) => {
    try {
        // Create a copy of the state without UI preferences
        const stateToPersist = {
            ...state,
            searchQuery: '',        // Don't persist search query
            filter: 'all',          // Reset filter to default when persisting
            serviceTypeFilter: 'all',  // Reset service type filter
            priorityFilter: 'all'   // Reset priority filter
        }
        localStorage.setItem('invoiceAppProjects', JSON.stringify(stateToPersist))
    } catch (error) {
        console.error('Error saving projects to localStorage:', error)
    }
}

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        addProject: (state, action) => {
            const projectNumber = `PRJ${Math.floor(Math.random() * 9000) + 1000}`
            const { project, workspaceId = 'default' } = action.payload;

            // Ensure serviceTypes is an array
            const serviceTypes = Array.isArray(project.serviceTypes)
                ? project.serviceTypes
                : [];

            // Initialize workspace if it doesn't exist
            if (!state.workspaceProjects[workspaceId]) {
                state.workspaceProjects[workspaceId] = [];
            }

            // Create the new project object
            const newProject = {
                ...project,
                id: projectNumber,
                status: project.isDraft ? 'draft' : 'active',
                createdAt: new Date().toISOString(),
                serviceTypes: serviceTypes,
                hoursEstimated: project.hoursEstimated || 0,
                hoursLogged: project.hoursLogged || 0,
                invoices: Array.isArray(project.invoices) ? project.invoices : [],
                priority: project.priority || 'medium', // Default priority is medium
                tasks: [], // Initialize tasks as empty array
                workspaceId, // Associate with workspace
            };

            // Add to workspace projects
            state.workspaceProjects[workspaceId].push(newProject);

            // For backward compatibility
            state.projects = state.workspaceProjects[workspaceId];

            console.log('Adding project with serviceTypes:', serviceTypes)
            saveProjectsToStorage(state)
        },
        updateProjectStatus: (state, action) => {
            const { id, status, workspaceId = 'default' } = action.payload;

            // Find the project in the specific workspace
            if (state.workspaceProjects[workspaceId]) {
                const project = state.workspaceProjects[workspaceId].find(project => project.id === id);
                if (project) {
                    project.status = status;

                    // For backward compatibility
                    state.projects = state.workspaceProjects[workspaceId];

                    saveProjectsToStorage(state);
                }
            }
        },
        updateProjectPriority: (state, action) => {
            const { id, priority, workspaceId = 'default' } = action.payload;

            // Find the project in the specific workspace
            if (state.workspaceProjects[workspaceId]) {
                const project = state.workspaceProjects[workspaceId].find(project => project.id === id);
                if (project) {
                    project.priority = priority;

                    // For backward compatibility
                    state.projects = state.workspaceProjects[workspaceId];

                    saveProjectsToStorage(state);
                }
            }
        },
        setProjectFilter: (state, action) => {
            state.filter = action.payload
            // No need to save filter to storage as it's a UI preference
        },
        setServiceTypeFilter: (state, action) => {
            state.serviceTypeFilter = action.payload
            // No need to save filter to storage as it's a UI preference
        },
        setPriorityFilter: (state, action) => {
            state.priorityFilter = action.payload
            // No need to save filter to storage as it's a UI preference
        },
        clearProjectFilters: (state) => {
            state.filter = 'all'
            state.serviceTypeFilter = 'all'
            state.priorityFilter = 'all'
            state.searchQuery = ''
        },
        setProjectSearchQuery: (state, action) => {
            state.searchQuery = action.payload
            // No need to save search query to storage as it's a UI preference
        },
        deleteProject: (state, action) => {
            const { id, workspaceId = 'default' } = action.payload;

            // Delete from the specific workspace
            if (state.workspaceProjects[workspaceId]) {
                state.workspaceProjects[workspaceId] = state.workspaceProjects[workspaceId].filter(project => project.id !== id);

                // For backward compatibility
                state.projects = state.workspaceProjects[workspaceId];

                saveProjectsToStorage(state);
            }
        },
        editProject: (state, action) => {
            const { project, workspaceId = 'default' } = action.payload;

            // Find in the specific workspace
            if (state.workspaceProjects[workspaceId]) {
                const index = state.workspaceProjects[workspaceId].findIndex(p => p.id === project.id);
                if (index !== -1) {
                    // Ensure serviceTypes is an array
                    const serviceTypes = Array.isArray(project.serviceTypes)
                        ? project.serviceTypes
                        : state.workspaceProjects[workspaceId][index].serviceTypes || [];

                    // Ensure tasks is an array
                    const tasks = Array.isArray(project.tasks)
                        ? project.tasks
                        : state.workspaceProjects[workspaceId][index].tasks || [];

                    console.log('Editing project serviceTypes:', serviceTypes)

                    state.workspaceProjects[workspaceId][index] = {
                        ...state.workspaceProjects[workspaceId][index],
                        ...project,
                        serviceTypes: serviceTypes,
                        tasks: tasks,
                        updatedAt: new Date().toISOString(),
                        workspaceId, // Always keep the workspace ID
                    };

                    // For backward compatibility
                    state.projects = state.workspaceProjects[workspaceId];

                    saveProjectsToStorage(state);
                }
            }
        },
        addInvoiceToProject: (state, action) => {
            const { projectId, invoiceId, workspaceId = 'default' } = action.payload;

            // Find in the specific workspace
            if (state.workspaceProjects[workspaceId]) {
                const project = state.workspaceProjects[workspaceId].find(project => project.id === projectId);
                if (project) {
                    // Initialize invoices array if it doesn't exist
                    if (!project.invoices) {
                        project.invoices = [];
                    }
                    // Add invoice if not already added
                    if (!project.invoices.includes(invoiceId)) {
                        project.invoices.push(invoiceId);

                        // For backward compatibility
                        state.projects = state.workspaceProjects[workspaceId];

                        saveProjectsToStorage(state);
                    }
                }
            }
        },
        removeInvoiceFromProject: (state, action) => {
            const { projectId, invoiceId, workspaceId = 'default' } = action.payload;

            // Find in the specific workspace
            if (state.workspaceProjects[workspaceId]) {
                const project = state.workspaceProjects[workspaceId].find(project => project.id === projectId);
                if (project && project.invoices) {
                    project.invoices = project.invoices.filter(id => id !== invoiceId);

                    // For backward compatibility
                    state.projects = state.workspaceProjects[workspaceId];

                    saveProjectsToStorage(state);
                }
            }
        },
        // Set active workspace projects (for when a user switches workspaces)
        setActiveWorkspaceProjects: (state, action) => {
            const workspaceId = action.payload || 'default';

            // Initialize workspace if it doesn't exist
            if (!state.workspaceProjects[workspaceId]) {
                state.workspaceProjects[workspaceId] = [];
            }

            // Set the current projects to the selected workspace's projects
            state.projects = state.workspaceProjects[workspaceId];
        }
    }
})

export const {
    addProject,
    updateProjectStatus,
    updateProjectPriority,
    setProjectFilter,
    setServiceTypeFilter,
    setPriorityFilter,
    clearProjectFilters,
    setProjectSearchQuery,
    deleteProject,
    editProject,
    addInvoiceToProject,
    removeInvoiceFromProject,
    setActiveWorkspaceProjects
} = projectsSlice.actions

export default projectsSlice.reducer 