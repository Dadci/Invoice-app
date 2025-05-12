import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BiChevronLeft, BiCalendar, BiPencil, BiTrash, BiX, BiDollar, BiTime, BiPlus, BiFlag } from 'react-icons/bi';
import { updateProjectStatus, deleteProject, editProject, updateProjectPriority } from '../store/projectsSlice';
import { toggleModal } from '../store/modalSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AddProjectModal from '../components/AddProjectModal';
import { ProjectDetailsSkeleton } from '../components/SkeletonLoader';
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '../utils/animations';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { DEFAULT_SERVICE_TYPES, getServiceTypeColor } from '../utils/constants';
import TaskSection from '../components/TaskSection';

const COLORS = ['#33D69F', '#FF8F00', '#EC5757'];

// Shared badge components
const StatusBadge = ({ status }) => {
    const styles = {
        active: { color: '#33D69F' },
        completed: { color: '#6460FF' },
        'on-hold': { color: '#FF8F00' },
        canceled: { color: '#EC5757' },
        draft: { color: '#373B53' },
        paid: { color: '#33D69F' },
        pending: { color: '#FF8F00' }
    };

    const style = styles[status] || styles.draft;

    return (
        <div
            className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
            style={{
                backgroundColor: `${style.color}15`,
                color: style.color
            }}
        >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }}></div>
            {status.replace('-', ' ')}
        </div>
    );
};

const PriorityIndicator = ({ priority }) => {
    const styles = {
        urgent: { color: '#EC5757' },
        high: { color: '#FF8F00' },
        medium: { color: '#7C5DFA' },
        low: { color: '#6460FF' }
    };

    const style = styles[priority] || styles.medium;

    return (
        <div
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: style.color }}
        >
            <BiFlag size={12} />
            {priority}
        </div>
    );
};

// Service type label component
const ServiceTypeLabel = ({ id, name }) => (
    <span
        className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-medium text-white leading-none"
        style={{ backgroundColor: getServiceTypeColor(id) }}
    >
        {name}
    </span>
);

const ProjectActionBar = ({ project, onEdit, onDelete }) => {
    const dispatch = useDispatch();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleStatusChange = (newStatus) => {
        dispatch(updateProjectStatus({
            id: project.id,
            status: newStatus,
            workspaceId: project.workspaceId || 'default'
        }));
        toast.success(`Project status updated to ${newStatus.replace('-', ' ')}`);
    };

    // Define priority options
    const priorityOptions = [
        { value: 'low', label: 'Low', color: '#6460FF' },
        { value: 'medium', label: 'Medium', color: '#7C5DFA' },
        { value: 'high', label: 'High', color: '#FF8F00' },
        { value: 'urgent', label: 'Urgent', color: '#EC5757' }
    ];

    const handlePriorityChange = (newPriority) => {
        dispatch(updateProjectPriority({
            id: project.id,
            priority: newPriority,
            workspaceId: project.workspaceId || 'default'
        }));
        toast.success(`Project priority updated to ${newPriority}`);
    };

    return (
        <div className="w-full bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm mb-6 transition-all duration-200">
            {isDeleteConfirmOpen ? (
                <div className="flex justify-between items-center">
                    <p className="text-light-text dark:text-dark-text font-medium">
                        Are you sure you want to delete this project?
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDeleteConfirmOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                        >
                            <BiX size={20} />
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onDelete();
                                setIsDeleteConfirmOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC5757] hover:bg-[#FF9797] text-white transition-colors duration-200"
                        >
                            <BiTrash size={20} />
                            Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between items-center">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">Status:</span>
                            <div className="relative group inline-block">
                                <div className="cursor-pointer">
                                    <StatusBadge status={project.status} />
                                </div>
                                <div className="absolute left-0 mt-2 w-40 bg-light-card dark:bg-dark-card rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    {['active', 'completed', 'on-hold', 'canceled'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className={`w-full text-left px-4 py-2 text-xs hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200 flex items-center gap-2 ${status === project.status ? 'font-semibold' : ''}`}
                                            style={{
                                                color: status === 'active' ? '#33D69F' :
                                                    status === 'completed' ? '#6460FF' :
                                                        status === 'on-hold' ? '#FF8F00' :
                                                            status === 'canceled' ? '#EC5757' : 'inherit'
                                            }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full" style={{
                                                backgroundColor: status === 'active' ? '#33D69F' :
                                                    status === 'completed' ? '#6460FF' :
                                                        status === 'on-hold' ? '#FF8F00' :
                                                            status === 'canceled' ? '#EC5757' : '#373B53'
                                            }}></div>
                                            {status.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">Priority:</span>
                            <div className="relative group inline-block">
                                <div className="cursor-pointer">
                                    <PriorityIndicator priority={project.priority || 'medium'} />
                                </div>
                                <div className="absolute left-0 mt-2 w-40 bg-light-card dark:bg-dark-card rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    {priorityOptions.map(priority => (
                                        <button
                                            key={priority.value}
                                            onClick={() => handlePriorityChange(priority.value)}
                                            className={`w-full text-left px-4 py-2 text-xs hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200 flex items-center gap-2 ${priority.value === project.priority ? 'font-semibold' : ''}`}
                                            style={{ color: priority.color }}
                                        >
                                            <BiFlag size={12} />
                                            {priority.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                        >
                            <BiPencil size={20} />
                            Edit
                        </button>
                        <button
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC5757] hover:bg-[#FF9797] text-white transition-colors duration-200"
                        >
                            <BiTrash size={20} />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const projects = useSelector(state => state.projects.projects);
    const invoices = useSelector(state => state.invoices.invoices);
    const serviceTypes = useSelector(state => state.settings?.serviceTypes || DEFAULT_SERVICE_TYPES);
    const { symbol = '£' } = useSelector(state => state.settings?.currency || { symbol: '£' });

    const [project, setProject] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogHoursForm, setShowLogHoursForm] = useState(false);
    const [hoursToLog, setHoursToLog] = useState(0);
    const [logDescription, setLogDescription] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tasks', 'invoices'

    // Find current project
    useEffect(() => {
        const foundProject = projects.find(p => p.id === id);
        if (foundProject) {
            setProject(foundProject);
        }

        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [id, projects]);

    // Handle project not found
    useEffect(() => {
        if (!isLoading && !project) {
            toast.error('Project not found');
            navigate('/projects');
        }
    }, [project, isLoading, navigate]);

    const handleLogHours = () => {
        if (hoursToLog <= 0) {
            toast.error('Hours must be greater than 0');
            return;
        }

        const currentDate = new Date().toISOString();
        const currentHoursLogged = project.hoursLogged || 0;
        const hoursLogs = project.hoursLogs || [];

        const updatedProject = {
            ...project,
            hoursLogged: currentHoursLogged + hoursToLog,
            hoursLogs: [
                ...hoursLogs,
                {
                    id: Date.now().toString(),
                    hours: hoursToLog,
                    description: logDescription,
                    date: currentDate
                }
            ]
        };

        dispatch(editProject({
            project: updatedProject,
            workspaceId: project.workspaceId || 'default'
        }));

        toast.success('Hours logged successfully');
        setHoursToLog(0);
        setLogDescription('');
        setShowLogHoursForm(false);
    };

    const getServiceTypeNames = () => {
        if (!project?.serviceTypes || !Array.isArray(project.serviceTypes) || project.serviceTypes.length === 0) {
            return [];
        }

        return project.serviceTypes.map(typeId => {
            const serviceType = serviceTypes.find(type => type.id === typeId);
            return serviceType ? { id: typeId, name: serviceType.name } : null;
        }).filter(Boolean);
    };

    // Handle creating a new invoice for this project
    const handleCreateInvoice = () => {
        // Open the invoice modal with this project pre-selected
        dispatch(toggleModal({
            projectToInvoice: project.id
        }));

        // Navigate to invoices page to see the modal
        navigate('/');
    };

    // Handle updating tasks
    const handleUpdateTasks = (updatedTasks) => {
        const updatedProject = {
            ...project,
            tasks: updatedTasks
        };

        dispatch(editProject({
            project: updatedProject,
            workspaceId: project.workspaceId || 'default'
        }));
        toast.success('Tasks updated successfully');
    };

    // If loading, show skeleton
    if (isLoading) {
        return <ProjectDetailsSkeleton />;
    }

    // If project not found, nothing to render (navigation happens in useEffect)
    if (!project) {
        return null;
    }

    // Get associated invoices
    const projectInvoices = invoices.filter(invoice =>
        project.invoices?.includes(invoice.id)
    );

    // Calculate project metrics
    const totalBilled = projectInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const paidInvoices = projectInvoices.filter(invoice => invoice.status === 'paid');
    const pendingInvoices = projectInvoices.filter(invoice => invoice.status === 'pending');
    const draftInvoices = projectInvoices.filter(invoice => invoice.status === 'draft');
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const draftAmount = draftInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    // Format date to display
    const formattedDate = project.createdAt
        ? format(new Date(project.createdAt), 'dd MMM yyyy')
        : 'No date';

    // Prepare chart data
    const chartData = [
        { name: 'Paid', value: paidAmount },
        { name: 'Pending', value: pendingAmount },
        { name: 'Draft', value: draftAmount }
    ].filter(item => item.value > 0);

    // Calculate hours progress
    const hoursEstimated = project.hoursEstimated || 0;
    const hoursLogged = project.hoursLogged || 0;
    const hoursProgress = hoursEstimated > 0 ? (hoursLogged / hoursEstimated) * 100 : 0;
    const hoursProgressCapped = Math.min(hoursProgress, 100);

    // Calculate task stats
    const tasks = project.tasks || [];
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const totalTasks = tasks.length;
    const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 pb-16">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="mt-8"
            >
                <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-2 text-light-text dark:text-dark-text hover:text-[#7C5DFA] transition-colors duration-200 mb-8"
                >
                    <BiChevronLeft size={20} />
                    Back to Projects
                </button>

                <ProjectActionBar
                    project={project}
                    onEdit={() => setIsEditModalOpen(true)}
                    onDelete={() => {
                        dispatch(deleteProject({
                            id: project.id,
                            workspaceId: project.workspaceId || 'default'
                        }));
                        toast.success('Project deleted');
                        navigate('/projects');
                    }}
                />

                {/* Project Navigation Tabs */}
                <div className="flex border-b border-light-border dark:border-dark-border mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${activeTab === 'overview'
                            ? 'text-[#7C5DFA] border-b-2 border-[#7C5DFA]'
                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-6 py-3 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${activeTab === 'tasks'
                            ? 'text-[#7C5DFA] border-b-2 border-[#7C5DFA]'
                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                            }`}
                    >
                        Tasks
                        {tasks.length > 0 && (
                            <span className="bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary text-xs px-2 py-0.5 rounded-full">
                                {completedTasks}/{totalTasks}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-6 py-3 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${activeTab === 'invoices'
                            ? 'text-[#7C5DFA] border-b-2 border-[#7C5DFA]'
                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                            }`}
                    >
                        Invoices
                        {projectInvoices.length > 0 && (
                            <span className="bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary text-xs px-2 py-0.5 rounded-full">
                                {projectInvoices.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Project Overview Section */}
                        <motion.div
                            variants={slideUp}
                            className="lg:col-span-2 bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6 transition-colors duration-200"
                        >
                            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                                {project.name}
                            </h1>

                            <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary text-sm mb-6">
                                <BiCalendar size={16} />
                                Created on {formattedDate}
                            </div>

                            <p className="text-light-text dark:text-dark-text mb-8">
                                {project.description || 'No description provided'}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Client
                                    </h3>
                                    <p className="text-light-text dark:text-dark-text">
                                        {project.client || 'No client specified'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 flex items-center gap-1">
                                        <BiTime size={16} />
                                        Estimated Hours
                                    </h3>
                                    <p className="text-light-text dark:text-dark-text">
                                        {hoursEstimated} hours
                                    </p>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <h3 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Service Types
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {getServiceTypeNames().length > 0 ? (
                                            getServiceTypeNames().map(serviceType => (
                                                <ServiceTypeLabel
                                                    key={serviceType.id}
                                                    id={serviceType.id}
                                                    name={serviceType.name}
                                                />
                                            ))
                                        ) : (
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                                No service types specified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Project Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4">
                                    <h4 className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Total Billed</h4>
                                    <p className="text-xl font-bold text-light-text dark:text-dark-text">{symbol} {totalBilled.toFixed(2)}</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        {projectInvoices.length} invoice{projectInvoices.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4">
                                    <h4 className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Time Tracked</h4>
                                    <p className="text-xl font-bold text-light-text dark:text-dark-text">{hoursLogged} hrs</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        {Math.round(hoursProgressCapped)}% of estimate
                                    </p>
                                </div>
                                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4">
                                    <h4 className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Tasks</h4>
                                    <p className="text-xl font-bold text-light-text dark:text-dark-text">
                                        {completedTasks} / {totalTasks}
                                    </p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                        {taskCompletionPercent}% completed
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Time Tracking Section */}
                        <motion.div
                            variants={slideUp}
                            className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6 transition-colors duration-200 relative"
                        >
                            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                                <BiTime size={18} />
                                Time Tracking
                            </h3>

                            {/* Time Logging Form */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {hoursLogged} of {hoursEstimated} hours logged ({Math.round(hoursProgressCapped)}% complete)
                                    </span>
                                    <button
                                        onClick={() => setShowLogHoursForm(!showLogHoursForm)}
                                        className="flex items-center gap-1 text-[#7C5DFA] hover:text-[#9277FF] text-sm transition-colors"
                                    >
                                        {showLogHoursForm ? 'Cancel' : (
                                            <>
                                                <BiPlus />
                                                Log Hours
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Hours Progress Bar */}
                                <div className="mb-4">
                                    <div className="h-4 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                                        {hoursEstimated > 0 && (
                                            <div
                                                className={`h-full ${hoursProgressCapped >= 100 ? 'bg-[#6460FF]' : 'bg-[#7C5DFA]'}`}
                                                style={{ width: `${hoursProgressCapped}%` }}
                                            ></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Floating Log Hours Form */}
                            {showLogHoursForm && (
                                <div className="absolute z-10 left-6 right-6 top-[110px] px-4 py-4 bg-light-bg dark:bg-dark-bg rounded-lg shadow-md border border-light-border dark:border-dark-border">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="text-sm font-semibold text-light-text dark:text-dark-text">Log Hours</h5>
                                        <button
                                            onClick={() => setShowLogHoursForm(false)}
                                            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors"
                                        >
                                            <BiX size={20} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex-1 min-w-[140px]">
                                            <label className="text-xs text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                                                Hours
                                            </label>
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                value={hoursToLog}
                                                onChange={(e) => setHoursToLog(parseFloat(e.target.value) || 0)}
                                                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-light-text-secondary dark:text-dark-text-secondary block mb-1">
                                                Description
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={logDescription}
                                                    onChange={(e) => setLogDescription(e.target.value)}
                                                    placeholder="What did you work on?"
                                                    className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                                />
                                                <button
                                                    onClick={handleLogHours}
                                                    className="px-3 py-2 bg-[#7C5DFA] text-white rounded-md text-sm hover:bg-[#9277FF] transition-colors duration-200 whitespace-nowrap"
                                                >
                                                    Log
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Time Logs */}
                            {project.hoursLogs && project.hoursLogs.length > 0 ? (
                                <div>
                                    <h4 className="text-md font-semibold text-light-text dark:text-dark-text mb-3 flex items-center justify-between">
                                        <span>Recent Activity</span>
                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-normal">
                                            {project.hoursLogs.length} entries
                                        </span>
                                    </h4>
                                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-light-border dark:scrollbar-thumb-dark-border scrollbar-track-transparent">
                                        {[...project.hoursLogs].reverse().slice(0, 5).map(log => (
                                            <div key={log.id} className="bg-light-bg dark:bg-dark-bg px-3 py-2 rounded-md flex items-center">
                                                <div className="text-[#7C5DFA] mr-2 flex-shrink-0">
                                                    <BiTime size={16} />
                                                </div>
                                                <div className="font-medium text-sm text-light-text dark:text-dark-text mr-2 w-16 flex-shrink-0">
                                                    {log.hours} {log.hours === 1 ? 'hr' : 'hrs'}
                                                </div>
                                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex-grow truncate mr-2">
                                                    {log.description || 'No description'}
                                                </div>
                                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0 ml-auto">
                                                    {format(new Date(log.date), 'dd MMM')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {project.hoursLogs.length > 5 && (
                                        <div className="mt-2 text-center">
                                            <span className="text-xs text-[#7C5DFA]">
                                                + {project.hoursLogs.length - 5} more entries
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                    No time logs yet. Log your first hours using the button above.
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* Tasks Tab Content */}
                {activeTab === 'tasks' && (
                    <motion.div
                        variants={slideUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <TaskSection
                            project={project}
                            onUpdateTasks={handleUpdateTasks}
                        />
                    </motion.div>
                )}

                {/* Invoices Tab Content */}
                {activeTab === 'invoices' && (
                    <motion.div
                        variants={slideUp}
                        initial="hidden"
                        animate="visible"
                        className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6 transition-colors duration-200"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                                Project Invoices
                            </h3>
                            <button
                                onClick={handleCreateInvoice}
                                className="px-4 py-2 bg-[#7C5DFA] text-white rounded-full text-sm hover:bg-[#9277FF] transition-colors duration-200"
                            >
                                + New Invoice
                            </button>
                        </div>

                        {projectInvoices.length === 0 ? (
                            <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                                No invoices linked to this project yet
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-light-text-secondary dark:text-dark-text-secondary border-b border-light-border dark:border-dark-border">
                                            <th className="pb-4 font-medium">Invoice</th>
                                            <th className="pb-4 font-medium">Date</th>
                                            <th className="pb-4 font-medium">Client</th>
                                            <th className="pb-4 font-medium">Amount</th>
                                            <th className="pb-4 font-medium">Status</th>
                                            <th className="pb-4 font-medium"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projectInvoices.map(invoice => (
                                            <tr key={invoice.id} className="border-b border-light-border dark:border-dark-border">
                                                <td className="py-4 font-medium text-light-text dark:text-dark-text">
                                                    {invoice.id}
                                                </td>
                                                <td className="py-4 text-light-text-secondary dark:text-dark-text-secondary">
                                                    {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd MMM yyyy') : 'No date'}
                                                </td>
                                                <td className="py-4 text-light-text dark:text-dark-text">
                                                    {invoice.clientName || 'No client'}
                                                </td>
                                                <td className="py-4 text-light-text dark:text-dark-text font-medium">
                                                    {symbol} {invoice.total?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="py-4">
                                                    <StatusBadge status={invoice.status} />
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Link
                                                        to={`/invoice/${invoice.id}`}
                                                        className="text-[#7C5DFA] hover:text-[#9277FF] transition-colors duration-200"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {isEditModalOpen && (
                <AddProjectModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    editingProject={project}
                />
            )}
        </div>
    );
};

export default ProjectDetails; 