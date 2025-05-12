import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BiPlus, BiPencil, BiTrash, BiCheck, BiX, BiChevronLeft, BiHelpCircle, BiReset, BiSearch } from 'react-icons/bi';
import {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace
} from '../store/workspacesSlice';
import { setActiveWorkspaceInvoices } from '../store/invoicesSlice';
import { setActiveWorkspaceProjects, reinitializeProjectStore } from '../store/projectsSlice';
import { setActiveWorkspaceSettings } from '../store/settingsSlice';
import { fadeIn } from '../utils/animations';
import OnboardingDialog from '../components/OnboardingDialog';

const WORKSPACE_COLORS = [
    '#7C5DFA', // Purple
    '#33D69F', // Green
    '#FF8F00', // Orange
    '#EC5757', // Red
    '#5757EC', // Blue
    '#9277FF', // Light Purple
    '#00C2FF', // Cyan
    '#FF9A57', // Light Orange
];

const WorkspaceManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { workspaces, currentWorkspace } = useSelector(state => state.workspaces);

    const [editingWorkspace, setEditingWorkspace] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: WORKSPACE_COLORS[0]
    });
    const [showNewForm, setShowNewForm] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Function to check if the workspace is the only one left
    const isOnlyWorkspace = (workspaceId) => {
        return workspaces.length <= 1;
    };

    // Handle input changes for workspace form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle color selection
    const handleColorSelect = (color) => {
        setFormData(prev => ({
            ...prev,
            color
        }));
    };

    // Start editing a workspace
    const handleEditWorkspace = (workspace) => {
        setEditingWorkspace(workspace.id);
        setFormData({
            name: workspace.name,
            description: workspace.description || '',
            color: workspace.color
        });
        setShowNewForm(false);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingWorkspace(null);
        setFormData({
            name: '',
            description: '',
            color: WORKSPACE_COLORS[0]
        });
    };

    // Save workspace changes
    const handleSaveWorkspace = () => {
        if (!formData.name.trim()) {
            // Show error
            return;
        }

        if (editingWorkspace) {
            dispatch(updateWorkspace({
                id: editingWorkspace,
                ...formData
            }));
            setEditingWorkspace(null);
        } else {
            dispatch(createWorkspace(formData));
            setShowNewForm(false);
        }

        setFormData({
            name: '',
            description: '',
            color: WORKSPACE_COLORS[0]
        });
    };

    // Delete a workspace
    const handleDeleteWorkspace = (id) => {
        if (window.confirm('Are you sure you want to delete this workspace? All data in this workspace will be lost.')) {
            dispatch(deleteWorkspace(id));
        }
    };

    // Switch to a workspace
    const handleSwitchWorkspace = (id) => {
        dispatch(setCurrentWorkspace(id));
        dispatch(setActiveWorkspaceInvoices(id));
        dispatch(setActiveWorkspaceProjects(id));
        dispatch(setActiveWorkspaceSettings(id));

        // Navigate directly to dashboard without delay
        console.log(`Switching to workspace ${id} and navigating to dashboard`);
        navigate('/');
    };

    // Function to show onboarding for the current workspace
    const handleShowOnboarding = () => {
        setShowOnboarding(true);
    };

    // Emergency function to fix workspace data issues
    const handleFixWorkspaceData = () => {
        if (window.confirm('This will attempt to fix workspace data issues. Continue?')) {
            console.log("Reinitializing project store...");
            dispatch(reinitializeProjectStore());
            if (currentWorkspace) {
                dispatch(setActiveWorkspaceProjects(currentWorkspace.id));
            }
            alert('Project data has been reinitialized. Please switch workspaces to verify.');
        }
    };

    // Filter workspaces based on search query
    const filteredWorkspaces = useMemo(() => {
        if (!searchQuery.trim()) return workspaces;

        const query = searchQuery.toLowerCase();
        return workspaces.filter(workspace =>
            workspace.name.toLowerCase().includes(query) ||
            (workspace.description && workspace.description.toLowerCase().includes(query))
        );
    }, [workspaces, searchQuery]);

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 px-6 md:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                    <Link to="/" className="mr-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA]">
                        <BiChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Workspaces</h1>
                </div>

                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <input
                            type="text"
                            placeholder="Search workspaces..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                        />
                        <BiSearch
                            size={18}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleShowOnboarding}
                            className="px-4 py-2 border border-[#7C5DFA] text-[#7C5DFA] rounded-md flex items-center gap-2 hover:bg-[#7C5DFA]/10 transition-colors"
                        >
                            <BiHelpCircle size={18} />
                            <span className="hidden sm:inline">Setup Guide</span>
                        </button>

                        <Link
                            to="/workspaces/new"
                            className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md flex items-center gap-2 hover:bg-[#9277FF] transition-colors"
                        >
                            <BiPlus size={18} />
                            <span className="hidden sm:inline">New Workspace</span>
                        </Link>

                        <button
                            onClick={handleFixWorkspaceData}
                            className="hidden sm:flex px-4 py-2 border border-[#EC5757] text-[#EC5757] rounded-md items-center gap-2 hover:bg-[#EC5757]/10 transition-colors"
                            title="Emergency: Fix workspace data issues"
                        >
                            <BiReset size={18} />
                            <span>Fix Data</span>
                        </button>
                    </div>
                </div>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6"
            >
                {/* Workspaces list */}
                <div className="flex flex-col gap-4">
                    {filteredWorkspaces.map(workspace => (
                        <motion.div
                            key={workspace.id}
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            className={`overflow-hidden rounded-lg transition-all duration-200 border shadow-sm ${currentWorkspace?.id === workspace.id
                                ? 'border-[#7C5DFA] border-opacity-50 ring-2 ring-[#7C5DFA] ring-opacity-20'
                                : 'border-light-border dark:border-dark-border hover:shadow-md'
                                }`}
                        >
                            {editingWorkspace === workspace.id ? (
                                // Edit mode
                                <div className="w-full p-5">
                                    <div className="space-y-4 mb-4">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Workspace name"
                                            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                        />
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Description (optional)"
                                            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {WORKSPACE_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleColorSelect(color)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.color === color ? 'ring-2 ring-offset-2 ring-[#7C5DFA]' : ''}`}
                                                style={{ backgroundColor: color }}
                                            >
                                                {formData.color === color && <BiCheck className="text-white" size={14} />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-3 py-1 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md flex items-center gap-1"
                                        >
                                            <BiX size={16} />
                                            <span>Cancel</span>
                                        </button>
                                        <button
                                            onClick={handleSaveWorkspace}
                                            className="px-3 py-1 bg-[#7C5DFA] text-white rounded-md flex items-center gap-1"
                                        >
                                            <BiCheck size={16} />
                                            <span>Save</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View mode - Full width design
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full p-5 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: workspace.color }}
                                        >
                                            {workspace.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
                                                    {workspace.name}
                                                </h3>
                                                {currentWorkspace?.id === workspace.id && (
                                                    <span className="text-xs bg-[#7C5DFA]/10 text-[#7C5DFA] px-2 py-0.5 rounded-full">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            {workspace.description && (
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                                    {workspace.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1 mr-2">
                                            <button
                                                onClick={() => handleEditWorkspace(workspace)}
                                                className="p-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                                                title="Edit workspace"
                                            >
                                                <BiPencil size={16} />
                                            </button>
                                            {!isOnlyWorkspace(workspace.id) && (
                                                <button
                                                    onClick={() => handleDeleteWorkspace(workspace.id)}
                                                    className="p-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                                                    title="Delete workspace"
                                                >
                                                    <BiTrash size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {currentWorkspace?.id !== workspace.id ? (
                                            <button
                                                onClick={() => handleSwitchWorkspace(workspace.id)}
                                                className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md text-sm hover:bg-[#9277FF] transition-colors"
                                            >
                                                Switch to Workspace
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate('/')}
                                                className="px-4 py-2 bg-[#7C5DFA]/10 text-[#7C5DFA] border border-[#7C5DFA] rounded-md text-sm hover:bg-[#7C5DFA]/20 transition-colors"
                                            >
                                                Go to Dashboard
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {filteredWorkspaces.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">No workspaces found matching your search.</p>
                        <Link
                            to="/workspaces/new"
                            className="inline-flex items-center px-4 py-2 bg-[#7C5DFA] text-white rounded-md hover:bg-[#9277FF] transition-colors"
                        >
                            <BiPlus size={18} className="mr-2" />
                            Create New Workspace
                        </Link>
                    </div>
                )}
            </motion.div>

            {showOnboarding && (
                <OnboardingDialog isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
            )}
        </div>
    );
};

export default WorkspaceManagement;