import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BiChevronLeft, BiCheck, BiRightArrowAlt, BiLeftArrowAlt, BiBuildings, BiFolder, BiPalette, BiUser } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createWorkspace } from '../store/workspacesSlice';
import { fadeIn } from '../utils/animations';
import { toast } from 'react-hot-toast';

// Workspace color palette
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

// Workspace templates
const WORKSPACE_TEMPLATES = [
    {
        id: 'freelance',
        name: 'Freelance',
        description: 'For independent freelancers managing multiple clients',
        longDescription: 'Perfect for solo freelancers who work with multiple clients. Optimized for tracking billable hours, managing client-specific invoices, and monitoring project status.',
        color: '#7C5DFA',
        icon: <BiFolder size={24} />,
        clientTypes: ['Individual', 'Small Business'],
        industryType: 'Creative Services'
    },
    {
        id: 'agency',
        name: 'Agency',
        description: 'For design or development agencies with team collaboration',
        longDescription: 'Designed for small to medium agencies that need team collaboration features. Includes robust project tracking, client management, and reporting capabilities.',
        color: '#33D69F',
        icon: <BiBuildings size={24} />,
        clientTypes: ['Small Business', 'Corporate'],
        industryType: 'Creative Agency'
    },
    {
        id: 'consulting',
        name: 'Consulting',
        description: 'For consultants tracking billable hours and projects',
        longDescription: 'Ideal for consultants who bill by the hour and need to track detailed time entries. Includes features for generating detailed reports and managing retainer agreements.',
        color: '#FF8F00',
        icon: <BiPalette size={24} />,
        clientTypes: ['Corporate', 'Enterprise'],
        industryType: 'Business Services'
    },
    {
        id: 'custom',
        name: 'Custom Workspace',
        description: 'Create a fully customized workspace from scratch',
        longDescription: 'Start with a blank slate and customize every aspect of your workspace. Perfect if you have specific requirements that don\'t fit into the predefined templates.',
        color: '#5757EC',
        icon: <BiUser size={24} />,
        clientTypes: [],
        industryType: ''
    }
];

// Wizard steps
const WIZARD_STEPS = [
    { id: 'template', title: 'Choose Template' },
    { id: 'details', title: 'Basic Information' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'review', title: 'Review & Create' }
];

const CreateWorkspace = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);

    // Selected template
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: WORKSPACE_COLORS[0],
        clientTypes: [],
        industryType: '',
        defaultHourlyRate: 13, // Default hourly rate in CAD
        defaultCurrency: 'CAD'
    });

    // Form validation
    const [errors, setErrors] = useState({});

    // Handle template selection
    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);

        // Pre-fill form data based on template
        if (template.id !== 'custom') {
            setFormData({
                ...formData,
                name: template.name,
                description: template.description,
                color: template.color,
                clientTypes: template.clientTypes,
                industryType: template.industryType
            });
        }

        // Move to next step
        setCurrentStep(1);
    };

    // Handle input changes
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

    // Handle color selection
    const handleColorSelect = (color) => {
        setFormData(prev => ({
            ...prev,
            color
        }));
    };

    // Handle client type selection
    const handleClientTypeSelect = (type) => {
        setFormData(prev => {
            // If already selected, remove it
            if (prev.clientTypes.includes(type)) {
                return {
                    ...prev,
                    clientTypes: prev.clientTypes.filter(t => t !== type)
                };
            }
            // Otherwise add it
            return {
                ...prev,
                clientTypes: [...prev.clientTypes, type]
            };
        });
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Workspace name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle navigation between steps
    const handleNextStep = () => {
        if (currentStep === 1 && !validateForm()) {
            return;
        }

        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Create workspace
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Create workspace with required data
            dispatch(createWorkspace({
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                clientTypes: formData.clientTypes,
                industryType: formData.industryType,
                defaultHourlyRate: formData.defaultHourlyRate,
                defaultCurrency: formData.defaultCurrency
            }));

            // Show success message
            toast.success('Workspace created successfully!');

            // Navigate to dashboard - the App component will handle setting up the workspace
            navigate('/');
        } catch (error) {
            console.error('Error creating workspace:', error);
            toast.error('Failed to create workspace. Please try again.');
        }
    };

    // Render template selection step
    const renderTemplateStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Choose a Workspace Template</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Select a template to start with or create a custom workspace from scratch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WORKSPACE_TEMPLATES.map(template => (
                    <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectTemplate(template)}
                        className="bg-white dark:bg-dark-card p-6 rounded-lg border-2 border-transparent hover:border-[#7C5DFA] cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: template.color }}>
                                {template.icon}
                            </div>
                            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">{template.name}</h3>
                        </div>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                            {template.description}
                        </p>
                        {template.id !== 'custom' && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {template.clientTypes.map(type => (
                                    <span key={type} className="inline-block px-2 py-1 bg-[#7C5DFA]/10 text-[#7C5DFA] text-xs rounded-full">
                                        {type}
                                    </span>
                                ))}
                                <span className="inline-block px-2 py-1 bg-[#33D69F]/10 text-[#33D69F] text-xs rounded-full">
                                    {template.industryType}
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );

    // Render details step
    const renderDetailsStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
                {selectedTemplate ? `Customize Your ${selectedTemplate.name} Workspace` : 'Create Your Workspace'}
            </h2>

            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                {selectedTemplate && selectedTemplate.id !== 'custom'
                    ? selectedTemplate.longDescription
                    : 'Provide basic information about your workspace to get started.'}
            </p>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            Workspace Name*
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Freelance Projects"
                            className={`w-full px-4 py-3 border ${errors.name ? 'border-[#EC5757]' : 'border-light-border dark:border-dark-border'} rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA]`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-[#EC5757] text-sm">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            Description (Optional)
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="e.g. For all my freelance clients"
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA]"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Workspace Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {WORKSPACE_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => handleColorSelect(color)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.color === color ? 'ring-2 ring-offset-2 ring-[#7C5DFA]' : 'hover:scale-110 transition-transform'}`}
                                style={{ backgroundColor: color }}
                            >
                                {formData.color === color && <BiCheck className="text-white" size={22} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Client Types (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['Individual', 'Small Business', 'Corporate', 'Enterprise', 'Non-Profit'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleClientTypeSelect(type)}
                                className={`px-3 py-1.5 rounded-md text-sm ${formData.clientTypes.includes(type)
                                    ? 'bg-[#7C5DFA] text-white'
                                    : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'
                                    } transition-colors duration-200`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Render preferences step
    const renderPreferencesStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Workspace Preferences</h2>

            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Set default values for this workspace. You can always change these later.
            </p>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            Industry Type
                        </label>
                        <select
                            name="industryType"
                            value={formData.industryType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA]"
                        >
                            <option value="">Select an industry (optional)</option>
                            <option value="Creative Services">Creative Services</option>
                            <option value="Software Development">Software Development</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Consulting">Consulting</option>
                            <option value="E-commerce">E-commerce</option>
                            <option value="Education">Education</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Legal">Legal</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            Default Currency
                        </label>
                        <select
                            name="defaultCurrency"
                            value={formData.defaultCurrency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA]"
                        >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Default Hourly Rate
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="defaultHourlyRate"
                            value={formData.defaultHourlyRate}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 pl-10 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA]"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary">
                            {formData.defaultCurrency === 'USD' ? '$' :
                                formData.defaultCurrency === 'EUR' ? '€' :
                                    formData.defaultCurrency === 'GBP' ? '£' :
                                        formData.defaultCurrency === 'CAD' ? 'C$' :
                                            formData.defaultCurrency === 'AUD' ? 'A$' :
                                                formData.defaultCurrency === 'JPY' ? '¥' : '$'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render review step
    const renderReviewStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Review & Create Workspace</h2>

            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Review your workspace details before creating it.
            </p>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: formData.color }}>
                        {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-light-text dark:text-dark-text">{formData.name}</h3>
                        {formData.description && (
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{formData.description}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 pb-4 border-b border-light-border dark:border-dark-border">
                        <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary w-32">Template</span>
                        <span className="text-light-text dark:text-dark-text">{selectedTemplate?.name || 'Custom Workspace'}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 pb-4 border-b border-light-border dark:border-dark-border">
                        <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary w-32">Currency</span>
                        <span className="text-light-text dark:text-dark-text">{formData.defaultCurrency}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 pb-4 border-b border-light-border dark:border-dark-border">
                        <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary w-32">Hourly Rate</span>
                        <span className="text-light-text dark:text-dark-text">
                            {formData.defaultCurrency === 'USD' ? '$' :
                                formData.defaultCurrency === 'EUR' ? '€' :
                                    formData.defaultCurrency === 'GBP' ? '£' :
                                        formData.defaultCurrency === 'CAD' ? 'C$' :
                                            formData.defaultCurrency === 'AUD' ? 'A$' :
                                                formData.defaultCurrency === 'JPY' ? '¥' : '$'}
                            {formData.defaultHourlyRate}
                        </span>
                    </div>

                    {formData.industryType && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 pb-4 border-b border-light-border dark:border-dark-border">
                            <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary w-32">Industry</span>
                            <span className="text-light-text dark:text-dark-text">{formData.industryType}</span>
                        </div>
                    )}

                    {formData.clientTypes.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
                            <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary w-32 pt-1">Client Types</span>
                            <div className="flex flex-wrap gap-2">
                                {formData.clientTypes.map(type => (
                                    <span key={type} className="inline-block px-2 py-1 bg-[#7C5DFA]/10 text-[#7C5DFA] text-xs rounded-full">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Render the current step
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return renderTemplateStep();
            case 1:
                return renderDetailsStep();
            case 2:
                return renderPreferencesStep();
            case 3:
                return renderReviewStep();
            default:
                return renderTemplateStep();
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 mb-12">
            <div className="flex items-center mb-8">
                <Link to="/workspaces" className="mr-4 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA]">
                    <BiChevronLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Create New Workspace</h1>
            </div>

            {/* Progress stepper */}
            <div className="hidden sm:flex items-center justify-center gap-2 mb-8">
                {WIZARD_STEPS.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="relative flex flex-col items-center">
                            <button
                                onClick={() => index < currentStep && setCurrentStep(index)}
                                disabled={index > currentStep}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${index < currentStep
                                    ? 'bg-[#33D69F] text-white cursor-pointer'
                                    : index === currentStep
                                        ? 'bg-[#7C5DFA] text-white'
                                        : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary cursor-not-allowed'
                                    }`}
                            >
                                {index < currentStep ? (
                                    <BiCheck size={24} />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </button>
                            <span className={`mt-2 text-xs font-medium ${index <= currentStep
                                ? 'text-light-text dark:text-dark-text'
                                : 'text-light-text-secondary dark:text-dark-text-secondary'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                        {index < WIZARD_STEPS.length - 1 && (
                            <div className={`w-16 h-0.5 sm:w-24 md:w-32 mx-1 ${index < currentStep
                                ? 'bg-[#33D69F]'
                                : 'bg-light-border dark:bg-dark-border'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile step indicator */}
            <div className="sm:hidden flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Step {currentStep + 1} of {WIZARD_STEPS.length}
                </span>
                <span className="text-sm font-medium text-light-text dark:text-dark-text">
                    {WIZARD_STEPS[currentStep].title}
                </span>
            </div>

            {/* Main content */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6"
            >
                {renderCurrentStep()}
            </motion.div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={handlePrevStep}
                    className={`px-6 py-3 rounded-md flex items-center gap-2 ${currentStep === 0
                        ? 'invisible'
                        : 'bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                        } transition-colors duration-200`}
                >
                    <BiLeftArrowAlt size={20} />
                    <span>Previous</span>
                </button>

                {currentStep < WIZARD_STEPS.length - 1 ? (
                    <button
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-[#7C5DFA] text-white rounded-md flex items-center gap-2 hover:bg-[#9277FF] transition-colors duration-200"
                    >
                        <span>Next</span>
                        <BiRightArrowAlt size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-[#7C5DFA] text-white rounded-md flex items-center gap-2 hover:bg-[#9277FF] transition-colors duration-200"
                    >
                        <span>Create Workspace</span>
                        <BiCheck size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CreateWorkspace; 