import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BiUser, BiCalendar, BiDollar, BiTime, BiChevronRight, BiFile, BiFlag } from 'react-icons/bi';
import { format } from 'date-fns';
import { DEFAULT_SERVICE_TYPES } from '../utils/constants';

// Status dot indicator
const StatusDot = ({ status }) => {
    const styles = {
        active: { color: '#33D69F' },
        completed: { color: '#6460FF' },
        'on-hold': { color: '#FF8F00' },
        canceled: { color: '#EC5757' },
        draft: { color: '#373B53' }
    };

    const style = styles[status] || styles.draft;

    return (
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: style.color }}></div>
            <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary capitalize">
                {status.replace('-', ' ')}
            </span>
        </div>
    );
};

// Priority badge component
const PriorityBadge = ({ priority }) => {
    const styles = {
        urgent: { color: '#EC5757' },
        high: { color: '#FF8F00' },
        medium: { color: '#7C5DFA' },
        low: { color: '#6460FF' }
    };

    const style = styles[priority] || styles.medium;

    return (
        <div className="flex items-center gap-1">
            <BiFlag size={12} style={{ color: style.color }} />
            <span className="text-xs capitalize" style={{ color: style.color }}>{priority}</span>
        </div>
    );
};

// Tag component with more subtle design
const ProjectTag = ({ children }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary border border-light-border dark:border-dark-border">
        {children}
    </span>
);

const ProjectCard = ({ project }) => {
    const invoices = useSelector(state => state.invoices.invoices);
    const serviceTypes = useSelector(state => state.settings?.serviceTypes || DEFAULT_SERVICE_TYPES);
    const { symbol = '£' } = useSelector(state => state.settings?.currency || { symbol: '£' });

    // Project calculations
    const projectInvoices = invoices.filter(invoice => project.invoices?.includes(invoice.id));
    const totalBilled = projectInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const formattedDate = project.createdAt ? format(new Date(project.createdAt), 'dd MMM yyyy') : 'No date';

    // Hours calculations
    const hoursEstimated = project.hoursEstimated || 0;
    const hoursLogged = project.hoursLogged || 0;
    const hoursPercent = hoursEstimated > 0 ? Math.min((hoursLogged / hoursEstimated) * 100, 100) : 0;

    // Get service types (max 2)
    const serviceTypeNames = project.serviceTypes?.map(typeId => {
        const serviceType = serviceTypes.find(type => type.id === typeId);
        return serviceType ? serviceType.name : null;
    }).filter(Boolean).slice(0, 2) || [];

    return (
        <Link
            to={`/project/${project.id}`}
            className="group block h-full bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border hover:shadow-md hover:border-light-text-secondary/30 dark:hover:border-dark-text-secondary/30 transition-all duration-200"
        >
            <div className="p-4 flex flex-col h-full">
                {/* Project title */}
                <h3 className="text-base font-semibold text-light-text dark:text-dark-text group-hover:text-primary transition-colors duration-200 mb-1.5 line-clamp-1">
                    {project.name}
                </h3>

                {/* Status and priority row */}
                <div className="flex items-center justify-between mb-3">
                    <StatusDot status={project.status} />
                    {project.priority && <PriorityBadge priority={project.priority} />}
                </div>

                {/* Date */}
                <div className="flex items-center text-xs text-light-text-secondary dark:text-dark-text-secondary mb-3">
                    <BiCalendar size={12} className="mr-1" />
                    {formattedDate}
                </div>

                {/* Short description */}
                {project.description && (
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-3 line-clamp-2">
                        {project.description}
                    </p>
                )}

                {/* Tags row */}
                {serviceTypeNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {serviceTypeNames.map(name => (
                            <ProjectTag key={name}>{name}</ProjectTag>
                        ))}
                        {project.serviceTypes?.length > 2 && (
                            <ProjectTag>+{project.serviceTypes.length - 2} more</ProjectTag>
                        )}
                    </div>
                )}

                {/* Project Meta Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1.5">
                        <BiUser className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                        <span className="text-light-text dark:text-dark-text overflow-hidden text-ellipsis whitespace-nowrap">
                            {project.client || 'No client'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BiDollar className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                        <span className="text-light-text dark:text-dark-text">
                            {symbol}{totalBilled.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BiFile className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                            {projectInvoices.length} invoice{projectInvoices.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BiTime className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                            {hoursLogged}/{hoursEstimated} hrs
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-auto">
                    <div className="flex justify-between items-center text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                        <span>{Math.round(hoursPercent)}% completed</span>
                        <span className="text-light-text dark:text-dark-text font-medium group-hover:text-primary transition-all duration-200 flex items-center">
                            View <BiChevronRight size={16} className="ml-0.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </span>
                    </div>

                    {/* Simplified progress bar */}
                    <div className="h-1 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 bg-light-text-secondary dark:bg-dark-text-secondary"
                            style={{ width: `${hoursPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard; 