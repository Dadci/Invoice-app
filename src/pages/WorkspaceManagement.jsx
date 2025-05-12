import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BiPlus, BiPencil, BiTrash, BiCheck, BiX, BiChevronLeft, BiHelpCircle } from 'react-icons/bi';
import {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace
} from '../store/workspacesSlice';
import { setActiveWorkspaceInvoices } from '../store/invoicesSlice';
import { setActiveWorkspaceProjects } from '../store/projectsSlice';
import { setActiveWorkspaceSettings } from '../store/settingsSlice';
import Header from '../components/Header';
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

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 px-6 md:px-8 pb-16">
            <Header />

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/" className="mr-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA]">
                        <BiChevronLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold text-light-text dark:text-dark-text">Workspaces</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleShowOnboarding}
                        className="px-4 py-2 border border-[#7C5DFA] text-[#7C5DFA] rounded-md flex items-center gap-2 hover:bg-[#7C5DFA]/10 transition-colors"
                    >
                        <BiHelpCircle size={18} />
                        <span>Setup Guide</span>
                    </button>
                    {!showNewForm && (
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md flex items-center gap-2 hover:bg-[#9277FF] transition-colors"
                        >
                            <BiPlus size={18} />
                            <span>New Workspace</span>
                        </button>
                    )}
                </div>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6"
            >
                {/* Create new workspace form */}
                {showNewForm && (
                    <div className="mb-8 p-4 border border-light-border dark:border-dark-border rounded-lg">
                        <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Create New Workspace</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Workspace Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Freelance Projects"
                                    className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Description (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="e.g. For all my freelance clients"
                                    className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {WORKSPACE_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleColorSelect(color)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.color === color ? 'ring-2 ring-offset-2 ring-light-border dark:ring-dark-border' : ''}`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {formData.color === color && <BiCheck className="text-white" size={18} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setShowNewForm(false)}
                                className="px-4 py-2 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveWorkspace}
                                className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md"
                                disabled={!formData.name.trim()}
                            >
                                Create Workspace
                            </button>
                        </div>
                    </div>
                )}

                {/* Workspaces list */}
                <div className="grid grid-cols-1 gap-4">
                    {workspaces.map(workspace => (
                        <div
                            key={workspace.id}
                            className={`p-4 border ${currentWorkspace?.id === workspace.id ? 'border-[#7C5DFA]' : 'border-light-border dark:border-dark-border'} rounded-lg bg-light-bg dark:bg-dark-bg flex justify-between items-center`}
                        >
                            {editingWorkspace === workspace.id ? (
                                // Edit mode
                                <div className="w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                        />
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Description (optional)"
                                            className="px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {WORKSPACE_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleColorSelect(color)}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.color === color ? 'ring-1 ring-offset-1 ring-light-border dark:ring-dark-border' : ''}`}
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
                                // View mode
                                <>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-6 h-6 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: workspace.color }}
                                        ></div>
                                        <div>
                                            <h3 className="text-light-text dark:text-dark-text font-medium">
                                                {workspace.name}
                                                {currentWorkspace?.id === workspace.id && (
                                                    <span className="ml-2 text-xs bg-[#7C5DFA]/10 text-[#7C5DFA] px-2 py-0.5 rounded-full">
                                                        Current
                                                    </span>
                                                )}
                                            </h3>
                                            {workspace.description && (
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                                    {workspace.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {currentWorkspace?.id !== workspace.id && (
                                            <button
                                                onClick={() => handleSwitchWorkspace(workspace.id)}
                                                className="px-3 py-1 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md text-sm hover:bg-[#7C5DFA]/10"
                                            >
                                                Switch
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEditWorkspace(workspace)}
                                            className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA]"
                                        >
                                            <BiPencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWorkspace(workspace.id)}
                                            className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757]"
                                            disabled={workspaces.length <= 1 || currentWorkspace?.id === workspace.id}
                                        >
                                            <BiTrash size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {workspaces.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            No workspaces found. Create your first workspace to get started.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Onboarding Dialog */}
            <OnboardingDialog isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </div>
    );
};

export default WorkspaceManagement; 