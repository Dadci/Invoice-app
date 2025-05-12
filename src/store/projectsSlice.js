import { createSlice } from '@reduxjs/toolkit'

// Load projects from localStorage if available
const loadProjectsFromStorage = () => {
    try {
        const savedProjects = localStorage.getItem('invoiceAppProjects')
        console.log("Loading projects from storage:", savedProjects ? "Found data" : "No data");
        const parsedProjects = savedProjects ? JSON.parse(savedProjects) : null

        // Ensure all projects have the required properties set
        if (parsedProjects) {
            // Ensure workspaceProjects exists
            if (!parsedProjects.workspaceProjects) {
                console.log("No workspaceProjects found, initializing empty object");
                parsedProjects.workspaceProjects = {};
            } else {
                console.log("Found workspaces in storage:", Object.keys(parsedProjects.workspaceProjects));
            }

            // Process all workspaces
            Object.keys(parsedProjects.workspaceProjects).forEach(workspaceId => {
                if (Array.isArray(parsedProjects.workspaceProjects[workspaceId])) {
                    console.log(`Processing workspace ${workspaceId} with ${parsedProjects.workspaceProjects[workspaceId].length} projects`);
                    parsedProjects.workspaceProjects[workspaceId] = parsedProjects.workspaceProjects[workspaceId].map(project => ({
                        ...project,
                        serviceTypes: Array.isArray(project.serviceTypes) ? project.serviceTypes : [],
                        hoursEstimated: project.hoursEstimated || 0,
                        hoursLogged: project.hoursLogged || 0,
                        invoices: Array.isArray(project.invoices) ? project.invoices : [],
                        priority: project.priority || 'medium',
                        tasks: Array.isArray(project.tasks) ? project.tasks : [],
                        workspaceId: project.workspaceId || workspaceId // Ensure workspaceId is set
                    }));
                } else {
                    console.log(`Initializing empty array for workspace ${workspaceId}`);
                    parsedProjects.workspaceProjects[workspaceId] = [];
                }
            });

            // For backward compatibility, ensure projects array is set
            if (parsedProjects.projects) {
                console.log(`Found ${parsedProjects.projects.length} projects in legacy projects array`);
                parsedProjects.projects = parsedProjects.projects.map(project => ({
                    ...project,
                    serviceTypes: Array.isArray(project.serviceTypes) ? project.serviceTypes : [],
                    hoursEstimated: project.hoursEstimated || 0,
                    hoursLogged: project.hoursLogged || 0,
                    invoices: Array.isArray(project.invoices) ? project.invoices : [],
                    priority: project.priority || 'medium',
                    tasks: Array.isArray(project.tasks) ? project.tasks : [],
                    workspaceId: project.workspaceId || 'default'
                }));
            } else {
                console.log("No legacy projects array found, initializing empty array");
                parsedProjects.projects = [];
            }

            // Reset UI filters to default values
            parsedProjects.filter = 'all'
            parsedProjects.serviceTypeFilter = 'all'
            parsedProjects.priorityFilter = 'all'
            parsedProjects.searchQuery = ''

            // Migrate old projects to default workspace if needed
            if (!parsedProjects.workspaceProjects['default'] && parsedProjects.projects.length > 0) {
                console.log("Migrating legacy projects to default workspace");
                parsedProjects.workspaceProjects['default'] = parsedProjects.projects;
            }
        } else {
            console.log("No saved projects data found");
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

        // Ensure projects in each workspace have their workspaceId set correctly
        if (stateToPersist.workspaceProjects) {
            console.log("Saving workspaces to storage:", Object.keys(stateToPersist.workspaceProjects));

            Object.keys(stateToPersist.workspaceProjects).forEach(workspaceId => {
                if (Array.isArray(stateToPersist.workspaceProjects[workspaceId])) {
                    console.log(`Saving workspace ${workspaceId} with ${stateToPersist.workspaceProjects[workspaceId].length} projects`);
                    stateToPersist.workspaceProjects[workspaceId] = stateToPersist.workspaceProjects[workspaceId].map(project => ({
                        ...project,
                        workspaceId: project.workspaceId || workspaceId
                    }));
                }
            });
        }

        localStorage.setItem('invoiceAppProjects', JSON.stringify(stateToPersist))
        console.log("Projects saved to localStorage successfully");
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

            console.log(`Adding new project to workspace: ${workspaceId}`);

            // Ensure serviceTypes is an array
            const serviceTypes = Array.isArray(project.serviceTypes)
                ? project.serviceTypes
                : [];

            // Initialize workspace if it doesn't exist
            if (!state.workspaceProjects[workspaceId]) {
                console.log(`Creating new workspace entry for: ${workspaceId}`);
                state.workspaceProjects[workspaceId] = [];
            }

            // Create the new project object with explicit workspaceId
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
                workspaceId, // Associate with workspace - this is crucial
            };

            // Add to workspace projects
            state.workspaceProjects[workspaceId].push(newProject);

            console.log(`Project ${projectNumber} added to workspace ${workspaceId}. Total projects: ${state.workspaceProjects[workspaceId].length}`);

            // Check current state.projects for workspace contamination
            const activeWorkspaceId =
                state.projects.length > 0 &&
                    state.projects[0].workspaceId ?
                    state.projects[0].workspaceId : workspaceId;

            console.log(`Current active workspace in projects array: ${activeWorkspaceId}`);

            // ONLY update the current projects list if this is the active workspace
            if (workspaceId === activeWorkspaceId) {
                console.log(`Updating active projects list for workspace: ${workspaceId}`);
                state.projects = [...state.workspaceProjects[workspaceId]];
            } else {
                console.log(`Not updating active projects - different workspace (${activeWorkspaceId}) is active`);
            }

            saveProjectsToStorage(state);
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
            console.log(`Switching to workspace projects: ${workspaceId}`);

            // Initialize workspace if it doesn't exist
            if (!state.workspaceProjects[workspaceId]) {
                console.log(`Creating new workspace entry during switch: ${workspaceId}`);
                state.workspaceProjects[workspaceId] = [];
            }

            // Double check all projects in this workspace have the correct workspaceId
            if (Array.isArray(state.workspaceProjects[workspaceId])) {
                state.workspaceProjects[workspaceId] = state.workspaceProjects[workspaceId].map(project => ({
                    ...project,
                    workspaceId  // Ensure every project has the correct workspaceId
                }));
            }

            // Get the projects for this workspace with a deep copy to prevent reference issues
            const workspaceProjects = JSON.parse(JSON.stringify(state.workspaceProjects[workspaceId] || []));
            console.log(`Found ${workspaceProjects.length} projects for workspace: ${workspaceId}`);

            // Set the current projects to ONLY the selected workspace's projects
            state.projects = workspaceProjects;

            // Log every project in this workspace for debugging
            if (workspaceProjects.length > 0) {
                console.log("Projects in this workspace:");
                workspaceProjects.forEach(project => {
                    console.log(`- ${project.id}: ${project.name} (workspace: ${project.workspaceId})`);
                });
            }

            console.log(`Active projects set to ${state.projects.length} projects from workspace: ${workspaceId}`);

            // Save state to ensure persistence
            saveProjectsToStorage(state);
        },
        // Add action to reinitialize the project store (for recovery or emergency)
        reinitializeProjectStore: (state) => {
            console.log("Reinitializing project store...");

            // Ensure all projects in all workspaces have correct workspace IDs
            Object.keys(state.workspaceProjects).forEach(workspaceId => {
                if (Array.isArray(state.workspaceProjects[workspaceId])) {
                    state.workspaceProjects[workspaceId] = state.workspaceProjects[workspaceId].map(project => ({
                        ...project,
                        workspaceId: workspaceId  // Force correct workspaceId
                    }));
                    console.log(`Fixed workspaceId for ${state.workspaceProjects[workspaceId].length} projects in workspace: ${workspaceId}`);
                }
            });

            // Ensure current projects array matches the current workspace
            const currentWorkspace = localStorage.getItem('invoiceAppWorkspaces');
            let workspaceId = 'default';

            try {
                if (currentWorkspace) {
                    const parsedWorkspace = JSON.parse(currentWorkspace);
                    if (parsedWorkspace.currentWorkspace && parsedWorkspace.currentWorkspace.id) {
                        workspaceId = parsedWorkspace.currentWorkspace.id;
                    }
                }
            } catch (e) {
                console.error("Error parsing current workspace:", e);
            }

            console.log(`Setting active projects to current workspace: ${workspaceId}`);
            if (state.workspaceProjects[workspaceId]) {
                state.projects = [...state.workspaceProjects[workspaceId]];
            } else {
                state.workspaceProjects[workspaceId] = [];
                state.projects = [];
            }

            saveProjectsToStorage(state);
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
    setActiveWorkspaceProjects,
    reinitializeProjectStore
} = projectsSlice.actions

export default projectsSlice.reducer 