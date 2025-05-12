import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BiUser, BiCalendar, BiDollar, BiFile, BiTime, BiRightArrowAlt, BiFlag } from 'react-icons/bi';
import { format } from 'date-fns';
import { DEFAULT_SERVICE_TYPES, getServiceTypeColor } from '../utils/constants';

// Shared badge components
const StatusBadge = ({ status }) => {
    const styles = {
        active: { color: '#33D69F' },
        completed: { color: '#6460FF' },
        'on-hold': { color: '#FF8F00' },
        canceled: { color: '#EC5757' },
        draft: { color: '#373B53' }
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

    // Progress bar color
    const getProgressColor = () => {
        if (hoursPercent >= 100) return '#6460FF';
        if (hoursPercent > 75) return '#33D69F';
        if (hoursPercent > 50) return '#7C5DFA';
        if (hoursPercent > 25) return '#FF8F00';
        return '#EC5757';
    };

    // Get service types (limited to 2)
    const serviceTypeNames = project.serviceTypes?.map(typeId => {
        const serviceType = serviceTypes.find(type => type.id === typeId);
        return serviceType ? { id: typeId, name: serviceType.name } : null;
    }).filter(Boolean).slice(0, 2) || [];

    return (
        <Link
            to={`/project/${project.id}`}
            className="block bg-light-card dark:bg-dark-card rounded-lg transition-all duration-200 hover:shadow-md group overflow-hidden border border-transparent hover:border-[#7C5DFA]/20"
        >
            <div className="p-5">
                {/* Main content area */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left column - Project info */}
                    <div className="flex-1">
                        {/* Project title and date */}
                        <div className="flex items-start justify-between sm:justify-start gap-3 mb-2">
                            <h3 className="text-base font-bold text-light-text dark:text-dark-text group-hover:text-[#7C5DFA] transition-colors duration-200">
                                {project.name}
                            </h3>
                            <div className="flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary text-xs">
                                <BiCalendar size={12} />
                                {formattedDate}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mb-2 line-clamp-1">
                            {project.description || 'No description provided'}
                        </p>

                        {/* Service Types */}
                        {serviceTypeNames.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {serviceTypeNames.map(serviceType => (
                                    <ServiceTypeLabel
                                        key={serviceType.id}
                                        id={serviceType.id}
                                        name={serviceType.name}
                                    />
                                ))}
                                {project.serviceTypes?.length > 2 && (
                                    <span className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] leading-none bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary">
                                        +{project.serviceTypes.length - 2}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Project Meta Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-xs">
                            <div className="flex items-center gap-1.5">
                                <BiUser className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                                <span className="text-light-text dark:text-dark-text">
                                    {project.client || 'No client'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BiTime className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                                <span className="text-light-text dark:text-dark-text">
                                    {hoursLogged}/{hoursEstimated} hrs
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BiDollar className="text-light-text-secondary dark:text-dark-text-secondary" size={14} />
                                <span className="text-light-text dark:text-dark-text font-medium">
                                    {symbol}{totalBilled.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Status badges */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                        <StatusBadge status={project.status} />
                        {project.priority && <PriorityIndicator priority={project.priority} />}
                        <div className="hidden sm:flex sm:items-center sm:mt-auto">
                            <span className="text-[#7C5DFA] text-xs font-medium flex items-center gap-1 group-hover:translate-x-1 transition-all duration-200">
                                View Details
                                <BiRightArrowAlt size={16} className="transition-transform group-hover:translate-x-1 duration-200" />
                            </span>
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
                        <span className="sm:hidden text-[#7C5DFA] text-xs font-medium flex items-center gap-1">
                            View
                            <BiRightArrowAlt size={16} />
                        </span>
                    </div>

                    {/* Hours Progress Bar */}
                    <div className="h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300"
                            style={{ width: `${hoursPercent}%`, backgroundColor: getProgressColor() }}
                        ></div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectItem; 