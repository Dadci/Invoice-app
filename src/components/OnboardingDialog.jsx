import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BiX, BiCheck, BiCog, BiReceipt, BiUser, BiBuilding, BiCreditCard, BiChevronRight } from 'react-icons/bi';

const OnboardingDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const settings = useSelector(state => state.settings);
    const businessInfo = settings.businessInfo || {};
    const paymentDetails = settings.paymentDetails || {};
    const { currentWorkspace } = useSelector(state => state.workspaces);
    const invoices = useSelector(state => state.invoices.invoices);
    const projects = useSelector(state => state.projects.projects);

    // Base step definitions
    const [baseSteps] = useState([
        {
            id: 'businessInfo',
            title: 'Complete Business Info',
            description: 'Add your business name, address and contact details',
            icon: <BiBuilding size={20} />,
            route: '/settings',
            routeParams: { tab: 'business' }
        },
        {
            id: 'paymentDetails',
            title: 'Add Payment Details',
            description: 'Set up your bank details for invoices',
            icon: <BiCreditCard size={20} />,
            route: '/settings',
            routeParams: { tab: 'payment' }
        },
        {
            id: 'createProject',
            title: 'Create Your First Project',
            description: 'Set up a project to track your work',
            icon: <BiUser size={20} />,
            route: '/projects'
        },
        {
            id: 'createInvoice',
            title: 'Create Your First Invoice',
            description: 'Generate an invoice for your client',
            icon: <BiReceipt size={20} />,
            route: '/'
        }
    ]);

    // Create steps with real-time completion status
    const steps = baseSteps.map(step => {
        let isCompleted = false;

        switch (step.id) {
            case 'businessInfo':
                isCompleted = Boolean(businessInfo.name && businessInfo.email);
                break;
            case 'paymentDetails':
                isCompleted = Boolean(paymentDetails.bankName && paymentDetails.iban);
                break;
            case 'createProject':
                isCompleted = projects.length > 0;
                break;
            case 'createInvoice':
                isCompleted = invoices.length > 0;
                break;
            default:
                break;
        }

        return {
            ...step,
            isCompleted
        };
    });

    // Debug logging when dialog is open
    useEffect(() => {
        if (isOpen) {
            console.log("Onboarding dialog opened with data:");
            console.log("- Business Info:", businessInfo);
            console.log("- Payment Details:", paymentDetails);
            console.log("- Projects:", projects?.length || 0, "items");
            console.log("- Invoices:", invoices?.length || 0, "items");
        }
    }, [isOpen, businessInfo, paymentDetails, projects, invoices]);

    // Calculate overall progress
    const completedSteps = steps.filter(step => step.isCompleted).length;
    const progress = Math.round((completedSteps / steps.length) * 100);

    // Navigate to the right page when user clicks a step
    const handleStepClick = (step) => {
        if (step.route) {
            navigate(step.route, { state: step.routeParams });
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-6 bottom-6 w-80 sm:w-[360px] bg-white dark:bg-dark-card shadow-xl rounded-lg z-50 overflow-hidden"
                    >
                        <div className="flex flex-col max-h-[480px] overflow-hidden">
                            {/* Header */}
                            <div className="p-3 border-b border-light-border dark:border-dark-border">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
                                        Workspace Setup
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-full hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                                    >
                                        <BiX size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
                                    </button>
                                </div>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Let's get your workspace "{currentWorkspace?.name || 'Default'}" ready
                                </p>

                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary text-xs">
                                            {completedSteps} of {steps.length} tasks completed
                                        </span>
                                        <span className="font-medium text-light-text dark:text-dark-text text-xs">
                                            {progress}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-light-bg dark:bg-dark-bg rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#7C5DFA] transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Steps list */}
                            <div className="p-3 space-y-2">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        onClick={() => handleStepClick(step)}
                                        className={`p-2 border rounded-lg cursor-pointer transition-all 
                          ${step.isCompleted
                                                ? 'border-[#33D69F] bg-[#33D69F]/5'
                                                : 'border-light-border dark:border-dark-border hover:border-[#7C5DFA] hover:bg-[#7C5DFA]/5'
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 
                            ${step.isCompleted
                                                    ? 'bg-[#33D69F]'
                                                    : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary'
                                                }`}
                                            >
                                                {step.isCompleted ? (
                                                    <BiCheck size={16} className="text-white" />
                                                ) : (
                                                    <span className="text-xs font-medium">{index + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h3 className={`font-medium text-sm ${step.isCompleted
                                                        ? 'text-light-text dark:text-dark-text line-through opacity-80'
                                                        : 'text-light-text dark:text-dark-text'}`}
                                                    >
                                                        {step.title}
                                                    </h3>
                                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                        {step.icon}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer with button */}
                            <div className="p-3 border-t border-light-border dark:border-dark-border">
                                {progress < 100 ? (
                                    <button
                                        onClick={() => handleStepClick(steps.find(step => !step.isCompleted))}
                                        className="flex items-center justify-center gap-1 w-full py-2 bg-[#7C5DFA] hover:bg-[#9277FF] text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Continue to next step
                                        <BiChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="flex items-center justify-center gap-1 w-full py-2 bg-[#33D69F] hover:bg-[#33D69F]/90 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        All Set! Close
                                        <BiCheck size={18} />
                                    </button>
                                )}
                                <p className="text-xs text-center text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                    Access this guide anytime from settings
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OnboardingDialog; 