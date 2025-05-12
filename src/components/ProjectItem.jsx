import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BiUser, BiCalendar, BiDollar, BiFile, BiTime, BiChevronRight, BiFlag } from 'react-icons/bi';
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

const ProjectItem = ({ project }) => {
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

    // Get service types (limited to 2)
    const serviceTypeNames = project.serviceTypes?.map(typeId => {
        const serviceType = serviceTypes.find(type => type.id === typeId);
        return serviceType ? serviceType.name : null;
    }).filter(Boolean).slice(0, 2) || [];

    return (
        <Link
            to={`/project/${project.id}`}
            className="group block bg-light-card dark:bg-dark-card rounded-lg transition-all duration-200 hover:shadow-md border border-light-border dark:border-dark-border hover:border-light-text-secondary/30 dark:hover:border-dark-text-secondary/30"
        >
            <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Left column - Project info */}
                    <div className="flex-1">
                        {/* Project title row with status and priority */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="text-base font-semibold text-light-text dark:text-dark-text group-hover:text-primary transition-colors duration-200 line-clamp-1">
                                {project.name}
                            </h3>
                            <div className="flex items-center gap-3">
                                {project.priority && <PriorityBadge priority={project.priority} />}
                                <StatusDot status={project.status} />
                            </div>
                        </div>

                        {/* Description (if available) */}
                        {project.description && (
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-1">
                                {project.description}
                            </p>
                        )}

                        {/* Project metadata row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            <div className="flex items-center gap-1.5">
                                <BiCalendar size={12} />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BiUser size={12} />
                                <span className="truncate">{project.client || 'No client'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BiDollar size={12} />
                                <span>{symbol}{totalBilled.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BiTime size={12} />
                                <span>{hoursLogged}/{hoursEstimated} hrs</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {serviceTypeNames.length > 0 && (
                            <div className="hidden sm:flex flex-wrap gap-1.5 mb-1.5">
                                {serviceTypeNames.map(name => (
                                    <ProjectTag key={name}>{name}</ProjectTag>
                                ))}
                                {project.serviceTypes?.length > 2 && (
                                    <ProjectTag>+{project.serviceTypes.length - 2} more</ProjectTag>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right column - Action and details */}
                    <div className="flex items-start justify-end pt-1">
                        <div className="flex items-center px-3 py-1 rounded-full bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text text-xs font-medium group-hover:text-primary transition-colors duration-200">
                            View details
                            <BiChevronRight className="ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </div>
                    </div>
                </div>

                {/* Progress bar section */}
                <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <BiFile className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                            <span className="text-light-text-secondary dark:text-dark-text-secondary text-xs">
                                {projectInvoices.length} invoice{projectInvoices.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            {Math.round(hoursPercent)}% completed
                        </div>
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

export default ProjectItem; 