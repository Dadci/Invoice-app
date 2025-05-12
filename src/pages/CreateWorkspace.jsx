import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BiChevronLeft, BiCheck } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createWorkspace, setCurrentWorkspace } from '../store/workspacesSlice';
import { setActiveWorkspaceInvoices } from '../store/invoicesSlice';
import { setActiveWorkspaceProjects } from '../store/projectsSlice';
import { setActiveWorkspaceSettings } from '../store/settingsSlice';
import Header from '../components/Header';
import { fadeIn } from '../utils/animations';
import { toast } from 'react-hot-toast';

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

const CreateWorkspace = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: WORKSPACE_COLORS[0]
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({
            ...prev,
            color
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Workspace name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const newWorkspace = {
            ...formData,
            name: formData.name.trim(),
            description: formData.description.trim()
        };

        // Create the workspace first
        dispatch(createWorkspace(newWorkspace));

        // Get the new workspace ID - we need to use the current timestamp
        const newWorkspaceId = Date.now().toString();

        // Switch to the new workspace
        dispatch(setCurrentWorkspace(newWorkspaceId));

        // Initialize the workspace data structures (empty for a new workspace)
        dispatch(setActiveWorkspaceInvoices(newWorkspaceId));
        dispatch(setActiveWorkspaceProjects(newWorkspaceId));
        dispatch(setActiveWorkspaceSettings(newWorkspaceId));

        toast.success('Workspace created successfully');

        // Navigate directly to dashboard
        console.log(`New workspace created with ID ${newWorkspaceId}, navigating to dashboard`);
        navigate('/');
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 px-6 md:px-8 pb-16">
            <Header />

            <div className="flex items-center">
                <Link to="/workspaces" className="mr-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA]">
                    <BiChevronLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text">Create New Workspace</h1>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6"
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                Workspace Name*
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Freelance Projects"
                                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-light-border dark:border-dark-border'} rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
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

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            Workspace Color
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {WORKSPACE_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleColorSelect(color)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.color === color ? 'ring-2 ring-offset-2 ring-[#7C5DFA]' : ''}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {formData.color === color && <BiCheck className="text-white" size={20} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-light-border dark:border-dark-border pt-6">
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            * Required fields
                        </p>

                        <div className="flex gap-3">
                            <Link
                                to="/workspaces"
                                className="px-4 py-2 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#7C5DFA] text-white rounded-md hover:bg-[#9277FF] transition-colors"
                            >
                                Create Workspace
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateWorkspace; 