import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BiX, BiTime, BiPlus, BiChevronDown, BiFlag } from 'react-icons/bi';
import { addProject, editProject } from '../store/projectsSlice';
import toast from 'react-hot-toast';
import { addServiceType } from '../store/settingsSlice';
import { DEFAULT_SERVICE_TYPES } from '../utils/constants';

const AddProjectModal = ({ isOpen, onClose, editingProject = null }) => {
    const dispatch = useDispatch();
    const invoices = useSelector(state => state.invoices.invoices);
    const serviceTypes = useSelector(state => state.settings?.serviceTypes || DEFAULT_SERVICE_TYPES);
    const currentWorkspace = useSelector(state => state.workspaces.currentWorkspace);

    const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);
    const [newServiceType, setNewServiceType] = useState({ id: '', name: '' });
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
    const serviceDropdownRef = useRef(null);
    const modalRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client: '',
        status: 'active',
        priority: 'medium', // Default priority
        hoursEstimated: 0,
        hoursLogged: 0,
        invoices: [],
        serviceTypes: []
    });

    // Priority options with colors
    const priorityOptions = [
        { value: 'low', label: 'Low', color: '#6460FF' },
        { value: 'medium', label: 'Medium', color: '#7C5DFA' },
        { value: 'high', label: 'High', color: '#FF8F00' },
        { value: 'urgent', label: 'Urgent', color: '#EC5757' }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
                setIsServiceDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle escape key press
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                if (showCustomServiceModal) {
                    setShowCustomServiceModal(false);
                } else if (isServiceDropdownOpen) {
                    setIsServiceDropdownOpen(false);
                } else if (isOpen) {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showCustomServiceModal, isServiceDropdownOpen, isOpen, onClose]);

    // Set form data if editing an existing project
    useEffect(() => {
        if (editingProject) {
            // Ensure serviceTypes is always an array
            const serviceTypes = Array.isArray(editingProject.serviceTypes)
                ? editingProject.serviceTypes
                : [];

            setFormData({
                ...editingProject,
                hoursEstimated: editingProject.hoursEstimated || 0,
                hoursLogged: editingProject.hoursLogged || 0,
                serviceTypes: serviceTypes,
                priority: editingProject.priority || 'medium', // Use medium as default if not set
                invoices: Array.isArray(editingProject.invoices) ? editingProject.invoices : []
            });
        }
    }, [editingProject]);

    const handleInputChange = (e, field) => {
        setFormData({
            ...formData,
            [field]: e.target.value
        });
    };

    const handleNumberInputChange = (e, field) => {
        const value = parseInt(e.target.value) || 0;
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleStatusChange = (e) => {
        setFormData({
            ...formData,
            status: e.target.value
        });
    };

    const handleInvoiceToggle = (invoiceId) => {
        const updatedInvoices = formData.invoices?.includes(invoiceId)
            ? formData.invoices.filter(id => id !== invoiceId)
            : [...(formData.invoices || []), invoiceId];

        setFormData({
            ...formData,
            invoices: updatedInvoices
        });
    };

    const handleServiceTypeToggle = (serviceTypeId, e) => {
        if (e) e.stopPropagation();

        // If it's "add-custom", show the custom service modal
        if (serviceTypeId === 'add-custom') {
            setShowCustomServiceModal(true);
            setIsServiceDropdownOpen(false);
            return;
        }

        // Ensure serviceTypes is an array
        const currentServiceTypes = Array.isArray(formData.serviceTypes) ? formData.serviceTypes : [];

        // Otherwise toggle the service type selection
        const updatedServiceTypes = currentServiceTypes.includes(serviceTypeId)
            ? currentServiceTypes.filter(id => id !== serviceTypeId)
            : [...currentServiceTypes, serviceTypeId];

        setFormData(prevData => ({
            ...prevData,
            serviceTypes: updatedServiceTypes
        }));
    };

    const addCustomServiceType = () => {
        // Validate inputs
        if (!newServiceType.name.trim()) {
            toast.error('Service name cannot be empty');
            return;
        }

        // Create a valid ID from the name (lowercase, dash-separated)
        const id = newServiceType.name.toLowerCase().replace(/\s+/g, '-');

        // Add to redux store
        const serviceTypeToAdd = { id, name: newServiceType.name };
        dispatch(addServiceType(serviceTypeToAdd));

        // Add the new service type to the selected service types
        setFormData({
            ...formData,
            serviceTypes: [...formData.serviceTypes, id]
        });

        // Close modal and reset form
        setShowCustomServiceModal(false);
        setNewServiceType({ id: '', name: '' });

        toast.success('New service type added');
    };

    const getSelectedServiceNames = () => {
        // Ensure serviceTypes is an array
        const currentServiceTypes = Array.isArray(formData.serviceTypes) ? formData.serviceTypes : [];

        return currentServiceTypes.map(id => {
            const serviceType = serviceTypes.find(type => type.id === id);
            return serviceType ? serviceType.name : '';
        }).filter(Boolean);
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            toast.error('Project name is required');
            return;
        }

        try {
            // Get the current workspace ID
            const workspaceId = currentWorkspace?.id || 'default';

            console.log(`Adding/editing project in workspace: ${workspaceId}`);

            if (editingProject) {
                dispatch(editProject({
                    project: {
                        ...formData,
                        id: editingProject.id,
                        workspaceId: workspaceId // Explicitly set workspace ID
                    },
                    workspaceId: workspaceId
                }));
                toast.success('Project updated successfully');
            } else {
                dispatch(addProject({
                    project: {
                        ...formData,
                        workspaceId: workspaceId // Explicitly set workspace ID
                    },
                    workspaceId: workspaceId
                }));
                toast.success('Project created successfully');
            }
            onClose();
        } catch (error) {
            toast.error('Something went wrong');
            console.error('Error saving project:', error);
        }
    };

    const toggleServiceDropdown = (e) => {
        e.stopPropagation();
        setIsServiceDropdownOpen(!isServiceDropdownOpen);
    };

    // Get priority option color based on selected priority
    const getPriorityColor = (priorityValue) => {
        const option = priorityOptions.find(option => option.value === priorityValue);
        return option ? option.color : '#7C5DFA';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
                        {editingProject ? 'Edit Project' : 'New Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors p-1 rounded-full"
                    >
                        <BiX size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Project Name */}
                        <div>
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-2">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange(e, 'name')}
                                placeholder="e.g. Website Redesign"
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange(e, 'description')}
                                placeholder="Project description..."
                                rows={3}
                                className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Client */}
                            <div>
                                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-2">
                                    Client
                                </label>
                                <input
                                    type="text"
                                    value={formData.client}
                                    onChange={(e) => handleInputChange(e, 'client')}
                                    placeholder="Client name"
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            {/* Hours Estimated */}
                            <div>
                                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2 mb-2">
                                    <BiTime className="text-light-text-secondary dark:text-dark-text-secondary" />
                                    Hours Estimated
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.hoursEstimated}
                                    onChange={(e) => handleNumberInputChange(e, 'hoursEstimated')}
                                    placeholder="0"
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status */}
                            <div>
                                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={handleStatusChange}
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200 appearance-none cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="canceled">Canceled</option>
                                </select>
                            </div>

                            {/* Hours Logged */}
                            <div>
                                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2 mb-2">
                                    <BiTime className="text-light-text-secondary dark:text-dark-text-secondary" />
                                    Hours Logged
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.hoursLogged}
                                    onChange={(e) => handleNumberInputChange(e, 'hoursLogged')}
                                    placeholder="0"
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                />
                            </div>
                        </div>

                        {/* Priority Selection */}
                        <div>
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2 mb-2">
                                <BiFlag className="text-light-text-secondary dark:text-dark-text-secondary" />
                                Priority
                            </label>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                {priorityOptions.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: option.value })}
                                        className={`h-9 px-4 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${formData.priority === option.value
                                            ? 'text-white'
                                            : 'bg-opacity-10 hover:bg-opacity-20'
                                            }`}
                                        style={{
                                            backgroundColor: formData.priority === option.value
                                                ? option.color
                                                : `${option.color}15`,
                                            color: formData.priority === option.value
                                                ? 'white'
                                                : option.color
                                        }}
                                    >
                                        <BiFlag size={14} />
                                        <span>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Service Types */}
                        <div>
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-2">
                                Service Types
                            </label>
                            <div className="relative" ref={serviceDropdownRef}>
                                <button
                                    type="button"
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] flex items-center justify-between cursor-pointer transition-colors duration-200"
                                    onClick={toggleServiceDropdown}
                                >
                                    <div className="flex flex-wrap gap-2 min-h-[1.5rem] items-center overflow-hidden">
                                        {Array.isArray(formData.serviceTypes) && formData.serviceTypes.length > 0 ? (
                                            getSelectedServiceNames().map(name => (
                                                <span key={name} className="bg-[#7C5DFA]/10 text-[#7C5DFA] px-2 py-1 rounded-full text-xs">
                                                    {name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary">Select service types</span>
                                        )}
                                    </div>
                                    <BiChevronDown className={`text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0 ml-2 transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isServiceDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 border border-light-border dark:border-dark-border rounded-lg bg-light-card dark:bg-dark-card shadow-lg max-h-60 overflow-y-auto">
                                        {serviceTypes.map(serviceType => (
                                            <div
                                                key={serviceType.id}
                                                className="flex items-center p-3 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer"
                                                onClick={(e) => handleServiceTypeToggle(serviceType.id, e)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(formData.serviceTypes) && formData.serviceTypes.includes(serviceType.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleServiceTypeToggle(serviceType.id, e);
                                                    }}
                                                    className="w-4 h-4 text-[#7C5DFA] border-light-border dark:border-dark-border rounded focus:ring-[#7C5DFA] transition-colors duration-200"
                                                />
                                                <span className="ml-3 text-light-text dark:text-dark-text">
                                                    {serviceType.name}
                                                </span>
                                            </div>
                                        ))}
                                        <div
                                            className="flex items-center p-3 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer border-t border-light-border dark:border-dark-border text-[#7C5DFA]"
                                            onClick={(e) => handleServiceTypeToggle('add-custom', e)}
                                        >
                                            <BiPlus size={16} className="ml-1" />
                                            <span className="ml-3 font-medium">
                                                Add Custom Service Type
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Link Invoices */}
                        {invoices.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-2">
                                    Link Invoices
                                </label>
                                <div className="border border-light-border dark:border-dark-border rounded-lg max-h-60 overflow-y-auto p-3">
                                    {invoices.map(invoice => (
                                        <div
                                            key={invoice.id}
                                            className="flex items-center p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-md transition-colors mb-1"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`invoice-${invoice.id}`}
                                                checked={formData.invoices?.includes(invoice.id) || false}
                                                onChange={() => handleInvoiceToggle(invoice.id)}
                                                className="w-4 h-4 text-[#7C5DFA] border-light-border dark:border-dark-border rounded focus:ring-[#7C5DFA] transition-colors duration-200"
                                            />
                                            <label
                                                htmlFor={`invoice-${invoice.id}`}
                                                className="ml-3 text-sm text-light-text dark:text-dark-text cursor-pointer flex-1"
                                            >
                                                <span className="font-medium">{invoice.id}</span>
                                                <span className="text-light-text-secondary dark:text-dark-text-secondary ml-2">
                                                    ({invoice.clientName || 'No client'} - {invoice.projectDescription || 'No description'})
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-light-border dark:border-dark-border flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="h-10 px-6 rounded-full font-medium text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border hover:bg-light-border/20 dark:hover:bg-dark-border/20 transition-colors duration-200 inline-flex items-center justify-center"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="h-10 px-6 rounded-full font-medium text-white bg-[#7C5DFA] hover:bg-[#9277FF] transition-colors duration-200 inline-flex items-center justify-center"
                    >
                        {editingProject ? 'Save Changes' : 'Create Project'}
                    </button>
                </div>
            </div>

            {/* Custom Service Type Modal */}
            {showCustomServiceModal && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setShowCustomServiceModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-light-card dark:bg-dark-card p-6 rounded-lg z-[70] shadow-xl transition-all duration-200">
                        <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Add Custom Service Type</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Service Name</label>
                            <input
                                type="text"
                                value={newServiceType.name}
                                onChange={(e) => setNewServiceType({ ...newServiceType, name: e.target.value })}
                                placeholder="e.g. Product Photography"
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCustomServiceModal(false)}
                                className="h-10 px-4 bg-light-bg dark:bg-dark-border text-[#7C5DFA] rounded-full hover:bg-light-border dark:hover:bg-[#353B56] hover:shadow-sm transition-all duration-200 inline-flex items-center justify-center"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addCustomServiceType}
                                className="h-10 px-4 bg-[#7C5DFA] text-white rounded-full hover:bg-[#9277FF] hover:shadow-md transition-all duration-200 inline-flex items-center justify-center gap-1.5"
                            >
                                <BiPlus size={16} />
                                <span>Add Service</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AddProjectModal; 