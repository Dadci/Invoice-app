import { useSelector, useDispatch } from 'react-redux'
import { toggleModal } from '../store/modalSlice'
import { useState, useEffect, useRef } from 'react'
import { addInvoice, editInvoice } from '../store/invoicesSlice'
import { BiTrash, BiPlus, BiX, BiCalendar, BiEnvelope, BiUser, BiHomeAlt, BiTime, BiFolder, BiChevronDown } from 'react-icons/bi'
import toast from 'react-hot-toast'
import { addServiceType } from '../store/settingsSlice'
import { DEFAULT_SERVICE_TYPES } from '../utils/constants'
import { addInvoiceToProject } from '../store/projectsSlice'
import CurrencyDisplay from './CurrencyDisplay'
import useCurrencyConverter from '../utils/useCurrencyConverter'

const AddInvoiceModal = () => {
    const { isOpen, editingInvoice, projectToInvoice } = useSelector(state => state.modal)
    const { symbol = '$', code = 'CAD' } = useSelector(state => state.settings?.currency || { symbol: '$', code: 'CAD' });
    const { businessInfo = {}, paymentDetails = {} } = useSelector(state => state.settings || {});
    const { currentWorkspace } = useSelector(state => state.workspaces);
    // Add default empty array fallback for serviceTypes
    const serviceTypes = useSelector(state => state.settings?.serviceTypes || DEFAULT_SERVICE_TYPES);
    // Get projects for selection
    const projects = useSelector(state => state.projects.projects || []);

    const dispatch = useDispatch()
    const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);
    const [newServiceType, setNewServiceType] = useState({ id: '', name: '' });
    const [selectedProject, setSelectedProject] = useState(null);
    const [initialSetupComplete, setInitialSetupComplete] = useState(false);

    // Add a ref for the service type dropdown
    const serviceDropdownRefs = useRef([]);

    // Initial empty form state
    const emptyFormState = {
        clientName: '',
        clientEmail: '',
        clientAddress: { street: '', city: '', postCode: '', country: '' },
        invoiceDate: new Date().toISOString().split('T')[0], // Set today's date as default
        paymentTerms: 'Net 30 Days',
        projectDescription: '',
        projectId: '',
        items: [{ serviceType: 'other', name: '', quantity: 1, price: 0, total: 0 }]
    };

    // We'll use the business info directly from settings now
    const [formData, setFormData] = useState(emptyFormState);

    // Setup form data based on editing state or project selection
    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal is closed
            setFormData(emptyFormState);
            setSelectedProject(null);
            setInitialSetupComplete(false);
            return;
        }

        // Skip if we've already done initial setup for this modal session
        if (initialSetupComplete) return;

        // When modal opens, populate form data
        if (editingInvoice) {
            // Ensure all required fields are present with defaults
            const processedInvoice = {
                ...emptyFormState,
                ...editingInvoice,
                invoiceDate: editingInvoice.invoiceDate || new Date().toISOString().split('T')[0],
                paymentTerms: editingInvoice.paymentTerms || 'Net 30 Days',
                clientAddress: {
                    ...emptyFormState.clientAddress,
                    ...(editingInvoice.clientAddress || {})
                },
                items: editingInvoice.items?.length ?
                    editingInvoice.items.map(item => ({
                        serviceType: item.serviceType || 'other',
                        name: item.name || '',
                        quantity: Number(item.quantity) || 1,
                        price: Number(item.price) || 0,
                        total: Number(item.total) || 0
                    })) :
                    emptyFormState.items
            };

            setFormData(processedInvoice);

            // If editing an invoice with a projectId, select that project
            if (editingInvoice.projectId) {
                const project = projects.find(p => p.id === editingInvoice.projectId);
                setSelectedProject(project || null);
            }
        } else if (projectToInvoice) {
            // Creating invoice from project
            const project = projects.find(p => p.id === projectToInvoice);
            if (project) {
                setSelectedProject(project);

                // Auto-fill project and client information
                const newFormData = {
                    ...emptyFormState,
                    projectId: project.id,
                    projectDescription: project.description || '',
                    clientName: project.client || '',
                    invoiceDate: new Date().toISOString().split('T')[0]
                };

                // If the project has hours logged, automatically add them as an item
                if (project.hoursLogged > 0) {
                    const hourlyRate = 13; // Default hourly rate in CAD
                    newFormData.items = [
                        {
                            serviceType: 'other',
                            name: `${project.name} - Consulting Hours`,
                            quantity: project.hoursLogged,
                            price: hourlyRate,
                            total: project.hoursLogged * hourlyRate
                        }
                    ];
                }

                setFormData(newFormData);
            }
        } else {
            // Brand new invoice
            setFormData({
                ...emptyFormState,
                invoiceDate: new Date().toISOString().split('T')[0]
            });
        }

        // Mark initialization as complete to prevent further updates
        setInitialSetupComplete(true);

        // Only depend on isOpen, editingInvoice.id, projectToInvoice, and initialSetupComplete
        // This prevents the infinite loop since formData won't be in the dependency array
    }, [isOpen, editingInvoice?.id, projectToInvoice, initialSetupComplete, projects]);

    const handleSubmit = (isDraft = false) => {
        try {
            // Form validation
            if (!formData.clientName && !isDraft) {
                toast.error('Client name is required');
                return;
            }

            if (!formData.invoiceDate) {
                // Set today's date if no date is provided
                formData.invoiceDate = new Date().toISOString().split('T')[0];
            }

            // Ensure payment terms is a valid string
            const paymentTerms = typeof formData.paymentTerms === 'string' ?
                formData.paymentTerms : 'Net 30 Days';

            // Calculate total
            const total = formData.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);

            // Extract payment terms from string safely (e.g., "Net 30 Days" -> 30)
            const termsMatch = paymentTerms.match(/\d+/);

            // Default to 30 days if no match
            const daysToAdd = termsMatch ? parseInt(termsMatch[0]) : 30;
            const currentDate = new Date();
            const paymentDue = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000)).toISOString();

            const invoiceData = {
                ...formData,
                paymentTerms: paymentTerms, // Use the sanitized payment terms
                // Add sender info from business settings
                senderName: businessInfo.name || '',
                senderEmail: businessInfo.email || '',
                senderAddress: businessInfo.address || {},
                // Add payment details if they exist
                paymentDetails: {
                    bankName: paymentDetails.bankName || '',
                    iban: paymentDetails.iban || '',
                    swiftBic: paymentDetails.swiftBic || ''
                },
                total,
                isDraft,
                createdAt: new Date().toISOString(),
                paymentDue,
                // Ensure workspaceId is correctly set
                workspaceId: editingInvoice?.workspaceId || currentWorkspace?.id || 'default'
            };

            // Handle project association
            if (selectedProject) {
                invoiceData.projectId = selectedProject.id;
                invoiceData.projectName = selectedProject.name;
                invoiceData.projectDescription = selectedProject.description || '';
            }

            if (editingInvoice) {
                const workspaceId = editingInvoice.workspaceId || currentWorkspace?.id || 'default';

                dispatch(editInvoice({
                    invoice: {
                        ...invoiceData,
                        id: editingInvoice.id,
                        status: isDraft ? 'draft' : 'pending',
                        workspaceId
                    },
                    workspaceId
                }));

                toast.success('Invoice updated successfully');

                // Link the invoice to the project if a project is selected
                if (selectedProject) {
                    dispatch(addInvoiceToProject({
                        projectId: selectedProject.id,
                        invoiceId: editingInvoice.id
                    }));
                }
            } else {
                // Generate invoice ID for new invoice (same logic as in the reducer)
                const invoiceId = `RT${Math.floor(Math.random() * 9000) + 1000}`;

                // Add new invoice
                dispatch(addInvoice(invoiceData));

                // Link the invoice to the project if a project is selected
                if (selectedProject) {
                    dispatch(addInvoiceToProject({
                        projectId: selectedProject.id,
                        invoiceId: invoiceId
                    }));
                }

                toast.success(isDraft ? 'Draft saved' : 'Invoice created successfully');
            }

            // Reset form and close modal
            dispatch(toggleModal());
        } catch (error) {
            console.error("Error creating/updating invoice:", error);
            toast.error('Something went wrong. Please try again.');
        }
    }

    const addNewItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { serviceType: 'other', name: '', quantity: 1, price: 0, total: 0 }]
        })
    }

    const removeItem = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        })
    }

    const handleInputChange = (e, type, subType = null) => {
        if (subType) {
            // For nested objects like clientAddress
            setFormData({
                ...formData,
                [type]: {
                    ...formData[type] || {}, // Add fallback for undefined objects
                    [subType]: e.target.value || '' // Ensure value is never undefined
                }
            })
        } else {
            setFormData({
                ...formData,
                [type]: e.target.value || '' // Ensure value is never undefined
            })
        }
    }

    const handleItemChange = (index, field, value, e) => {
        if (e && field === 'serviceType') {
            e.stopPropagation();
        }

        // Ensure value is never undefined
        const safeValue = value === undefined || value === null ?
            (field === 'quantity' || field === 'price' ? 0 : '') : value;

        const newItems = formData.items.map((item, i) => {
            if (i === index) {
                const newItem = { ...item, [field]: safeValue }

                // If service type changes and it's not 'other', update the name with the service type name
                if (field === 'serviceType') {
                    if (safeValue === 'add-custom') {
                        // Show custom service type modal and prevent event from propagating further
                        setShowCustomServiceModal(true);
                        // Keep current service type until new one is added
                        newItem.serviceType = item.serviceType || 'other';
                    } else if (safeValue !== 'other') {
                        const selectedService = serviceTypes.find(service => service.id === safeValue);
                        if (selectedService) {
                            newItem.name = selectedService.name;
                        }
                    }
                }

                if (field === 'quantity' || field === 'price') {
                    const quantity = Number(newItem.quantity) || 0;
                    const price = Number(newItem.price) || 0;
                    newItem.total = quantity * price;
                }
                return newItem
            }
            return item
        })

        setFormData({
            ...formData,
            items: newItems
        })
    }

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

        // Close modal and reset form
        setShowCustomServiceModal(false);
        setNewServiceType({ id: '', name: '' });

        toast.success('New service type added');
    }

    // Calculate total for display
    const calculateTotal = () => {
        return formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0).toFixed(2);
    }

    // Handle project selection
    const handleProjectSelect = (e) => {
        const projectId = e.target.value;
        if (projectId === "") {
            setSelectedProject(null);
            // Reset project-related fields
            setFormData({
                ...formData,
                projectId: '',
                projectDescription: ''
            });
            return;
        }

        const project = projects.find(p => p.id === projectId);
        if (project) {
            setSelectedProject(project);

            // Auto-fill client information if available
            setFormData({
                ...formData,
                projectId: project.id,
                projectDescription: project.description || '',
                // Update client info if project has a client and we don't already have client info
                clientName: formData.clientName || project.client || '',
            });
        }
    };

    // Handle adding project hours to invoice
    const handleAddProjectHours = () => {
        if (!selectedProject) return;

        // Check if we already have hours in the items
        const existingHoursIndex = formData.items.findIndex(item =>
            item.name.toLowerCase().includes('hour') ||
            item.name.toLowerCase().includes('consulting')
        );

        // Calculate hourly rate based on the total if hours are logged
        const hourlyRate = selectedProject.hoursLogged ?
            // Use the hourly rate from invoice automation settings or default to 13 CAD
            settings?.invoiceAutomation?.defaultHourlyRate || 13 :
            null;

        if (existingHoursIndex >= 0) {
            // Update existing item
            const newItems = [...formData.items];
            newItems[existingHoursIndex] = {
                ...newItems[existingHoursIndex],
                name: `${selectedProject.name} - Consulting Hours`,
                quantity: selectedProject.hoursLogged || selectedProject.hoursEstimated || 1,
                price: hourlyRate || newItems[existingHoursIndex].price,
                total: (selectedProject.hoursLogged || selectedProject.hoursEstimated || 1) * (hourlyRate || newItems[existingHoursIndex].price)
            };

            setFormData({
                ...formData,
                items: newItems
            });
        } else {
            // Add new item for hours
            setFormData({
                ...formData,
                items: [
                    ...formData.items,
                    {
                        serviceType: 'other',
                        name: `${selectedProject.name} - Consulting Hours`,
                        quantity: selectedProject.hoursLogged || selectedProject.hoursEstimated || 1,
                        price: hourlyRate || 13, // Default hourly rate in CAD
                        total: (selectedProject.hoursLogged || selectedProject.hoursEstimated || 1) * (hourlyRate || 13)
                    }
                ]
            });
        }

        toast.success('Project hours added to invoice');
    };

    // Add a useEffect hook to handle Escape key to close modals
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                if (showCustomServiceModal) {
                    setShowCustomServiceModal(false);
                } else if (isOpen) {
                    dispatch(toggleModal());
                }
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showCustomServiceModal, isOpen, dispatch]);

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ease-in-out
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => dispatch(toggleModal())}
            />
            <div className={`fixed top-0 left-0 bottom-0 w-full md:w-[620px] lg:w-[780px] bg-light-bg dark:bg-dark-bg z-50
                transform transition-all duration-300 ease-out md:rounded-r-[20px] flex flex-col
                ${isOpen ? 'translate-x-0 opacity-100 shadow-2xl' : '-translate-x-full opacity-0'}`}
            >
                <div className="sticky top-0 p-6 bg-light-card dark:bg-dark-card z-10 border-b border-light-border dark:border-dark-border flex justify-between items-center transition-colors duration-200">
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
                        {editingInvoice ? `Edit #${editingInvoice.id}` : 'New Invoice'}
                    </h1>
                    <button
                        onClick={() => dispatch(toggleModal())}
                        className="p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                    >
                        <BiX size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 md:px-12 md:py-8">
                        <form className="space-y-8">
                            {/* Project Selection */}
                            <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm transition-colors duration-200">
                                <h4 className="text-[#7C5DFA] font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#7C5DFA] flex items-center justify-center text-white text-xs">1</span>
                                    Project Selection
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                            <BiFolder className="text-[#7C5DFA]" />
                                            Select Project (Optional)
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedProject?.id || ""}
                                                onChange={handleProjectSelect}
                                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200 cursor-pointer appearance-none"
                                            >
                                                <option value="">None (Create standalone invoice)</option>
                                                {projects.map(project => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.name} - {project.client || 'No client'} - {project.status}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <BiChevronDown className="text-light-text-secondary dark:text-dark-text-secondary" />
                                            </div>
                                        </div>
                                    </div>

                                    {selectedProject && (
                                        <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-light-text dark:text-dark-text">{selectedProject.name}</h5>
                                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                        Client: {selectedProject.client || 'Not specified'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                        <span className="font-medium">{selectedProject.hoursLogged || 0}</span> of {selectedProject.hoursEstimated || 0} hours logged
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddProjectHours}
                                                        className="text-xs text-[#7C5DFA] hover:text-[#9277FF] transition-colors mt-1"
                                                    >
                                                        Add hours to invoice
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex gap-1 items-center">
                                                    <BiCalendar className="text-[#7C5DFA]" />
                                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                        Status: <span className="font-semibold">{selectedProject.status}</span>
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 items-center">
                                                    <BiTime className="text-[#7C5DFA]" />
                                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                        Estimate: <span className="font-semibold">{selectedProject.hoursEstimated || 0} hours</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Project Information */}
                            <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm transition-colors duration-200">
                                <h4 className="text-[#7C5DFA] font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#7C5DFA] flex items-center justify-center text-white text-xs">2</span>
                                    Invoice Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                            <BiCalendar className="text-[#7C5DFA]" />
                                            Invoice Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.invoiceDate}
                                            onChange={(e) => handleInputChange(e, 'invoiceDate')}
                                            className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                            <BiTime className="text-[#7C5DFA]" />
                                            Payment Terms
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.paymentTerms}
                                                onChange={(e) => handleInputChange(e, 'paymentTerms')}
                                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200 cursor-pointer appearance-none"
                                            >
                                                <option>Net 30 Days</option>
                                                <option>Net 14 Days</option>
                                                <option>Net 7 Days</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <BiChevronDown className="text-light-text-secondary dark:text-dark-text-secondary" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                            Project Description
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.projectDescription}
                                            onChange={(e) => handleInputChange(e, 'projectDescription')}
                                            placeholder="What was this work for? (e.g. Website redesign, App development)"
                                            className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Client Information */}
                            <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm transition-colors duration-200">
                                <h4 className="text-[#7C5DFA] font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#7C5DFA] flex items-center justify-center text-white text-xs">3</span>
                                    Bill To
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                            <BiUser className="text-[#7C5DFA]" />
                                            Client&apos;s Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.clientName}
                                            onChange={(e) => handleInputChange(e, 'clientName')}
                                            placeholder="Client name"
                                            className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                            <BiEnvelope className="text-[#7C5DFA]" />
                                            Client&apos;s Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.clientEmail}
                                            onChange={(e) => handleInputChange(e, 'clientEmail')}
                                            placeholder="client@example.com"
                                            className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2 mb-2">
                                            <BiHomeAlt className="text-[#7C5DFA]" />
                                            Client&apos;s Address
                                        </label>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={formData.clientAddress.street}
                                                onChange={(e) => handleInputChange(e, 'clientAddress', 'street')}
                                                placeholder="Street Address"
                                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                            />
                                            <div className="grid grid-cols-3 gap-3">
                                                <input
                                                    type="text"
                                                    value={formData.clientAddress.city}
                                                    onChange={(e) => handleInputChange(e, 'clientAddress', 'city')}
                                                    placeholder="City"
                                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.clientAddress.postCode}
                                                    onChange={(e) => handleInputChange(e, 'clientAddress', 'postCode')}
                                                    placeholder="Post Code"
                                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.clientAddress.country}
                                                    onChange={(e) => handleInputChange(e, 'clientAddress', 'country')}
                                                    placeholder="Country"
                                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item List */}
                            <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm transition-colors duration-200">
                                <h4 className="text-[#7C5DFA] font-bold mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#7C5DFA] flex items-center justify-center text-white text-xs">4</span>
                                    Services & Items
                                </h4>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="text-left text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                <th className="pb-4 font-medium w-[30%]">Service Type</th>
                                                <th className="pb-4 font-medium w-[30%]">Description</th>
                                                <th className="pb-4 font-medium w-[15%]">Rate ({symbol})</th>
                                                <th className="pb-4 font-medium w-[15%]">Hours</th>
                                                <th className="pb-4 font-medium w-[15%]">Total</th>
                                                <th className="pb-4 w-[5%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="border-b border-light-border dark:border-dark-border hover:bg-light-bg/50 dark:hover:bg-dark-border/30 transition-colors duration-200">
                                                    <td className="py-3 pr-2">
                                                        <div className="relative" ref={el => serviceDropdownRefs.current[index] = el}>
                                                            <select
                                                                value={item.serviceType || 'other'}
                                                                onChange={(e) => handleItemChange(index, 'serviceType', e.target.value, e)}
                                                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200 cursor-pointer appearance-none"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option value="other">Select a service type</option>
                                                                {serviceTypes.map(serviceType => (
                                                                    <option key={serviceType.id} value={serviceType.id}>
                                                                        {serviceType.name}
                                                                    </option>
                                                                ))}
                                                                <option value="add-custom">+ Add Custom Service</option>
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                                <BiChevronDown className="text-light-text-secondary dark:text-dark-text-secondary" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-2">
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                            placeholder="Service description"
                                                            className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                                        />
                                                    </td>
                                                    <td className="py-3 pr-2">
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary">{symbol}</span>
                                                            <input
                                                                type="number"
                                                                value={item.price}
                                                                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                                                placeholder="0.00"
                                                                className="w-full h-10 px-4 pl-8 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-2">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                                placeholder="0"
                                                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary text-sm">h</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-2">
                                                        <div className="relative bg-light-bg dark:bg-dark-border rounded-lg h-10 px-4 pl-8 flex items-center transition-colors duration-200">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary">{symbol}</span>
                                                            <p className="font-medium text-light-text dark:text-dark-text">{(item.total || 0).toFixed(2)}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors p-2 rounded-full hover:bg-[#EC575710] dark:hover:bg-[#EC575720]"
                                                            aria-label="Remove item"
                                                        >
                                                            <BiTrash size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={addNewItem}
                                        className="w-full h-10 bg-light-bg dark:bg-dark-border text-[#7C5DFA] rounded-lg font-medium hover:bg-light-border dark:hover:bg-[#353B56] transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        <BiPlus size={18} />
                                        <span>Add New Item</span>
                                    </button>
                                </div>

                                <div className="mt-6 flex bg-[#373B53] dark:bg-[#0C0E16] rounded-lg p-4 transition-colors duration-200">
                                    <div className="flex items-center justify-between text-white gap-4 w-full">
                                        <span className="text-sm">Total:</span>
                                        <span className="font-bold text-xl">{symbol} {calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="sticky bottom-0 w-full bg-light-card dark:bg-dark-card p-6 px-12 rounded-t-lg mt-auto shadow-md border-t border-light-border dark:border-dark-border transition-colors duration-200">
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => dispatch(toggleModal())}
                            className="h-10 px-6 bg-light-bg dark:bg-dark-border text-[#7C5DFA] rounded-full hover:bg-light-border dark:hover:bg-[#353B56] hover:shadow-sm transition-all duration-200 inline-flex items-center justify-center font-medium"
                        >
                            Discard
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => handleSubmit(true)}
                                className="h-10 px-6 bg-[#373B53] dark:bg-[#252945] text-white rounded-full hover:bg-[#1E2139] dark:hover:bg-[#0C0E16] hover:shadow-md transition-all duration-200 inline-flex items-center justify-center font-medium"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit(false)}
                                className="h-10 px-6 bg-[#7C5DFA] text-white rounded-full hover:bg-[#9277FF] hover:shadow-md transition-all duration-200 inline-flex items-center justify-center font-medium"
                            >
                                Save & Send
                            </button>
                        </div>
                    </div>
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
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[#7C5DFA] focus:border-[#7C5DFA] transition-colors duration-200"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCustomServiceModal(false)}
                                className="h-10 px-4 bg-light-bg dark:bg-dark-border text-[#7C5DFA] rounded-full hover:bg-light-border dark:hover:bg-[#353B56] hover:shadow-sm transition-all duration-200 inline-flex items-center justify-center font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addCustomServiceType}
                                className="h-10 px-4 bg-[#7C5DFA] text-white rounded-full hover:bg-[#9277FF] hover:shadow-md transition-all duration-200 inline-flex items-center justify-center gap-1.5 font-medium"
                            >
                                <BiPlus size={16} />
                                <span>Add Service</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default AddInvoiceModal