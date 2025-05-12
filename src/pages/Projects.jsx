import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { BiPlus, BiSearch, BiFilter, BiSearchAlt, BiX, BiFlag } from "react-icons/bi";
import { FiGrid, FiList, FiChevronDown } from "react-icons/fi";
import { setProjectFilter, setServiceTypeFilter, setPriorityFilter, clearProjectFilters, setProjectSearchQuery, setActiveWorkspaceProjects } from "../store/projectsSlice";
import { fadeIn, slideUp, staggerContainer, listItem } from "../utils/animations";
import ProjectCard from "../components/ProjectCard";
import ProjectItem from "../components/ProjectItem";
import AddProjectModal from "../components/AddProjectModal";
import { ProjectsSkeleton } from "../components/SkeletonLoader";
import { DEFAULT_SERVICE_TYPES, getServiceTypeColor } from "../utils/constants";

const Projects = () => {
    const dispatch = useDispatch();
    const projects = useSelector(state => state.projects.projects);
    const filter = useSelector(state => state.projects.filter);
    const serviceTypeFilter = useSelector(state => state.projects.serviceTypeFilter);
    const priorityFilter = useSelector(state => state.projects.priorityFilter);
    const searchQuery = useSelector(state => state.projects.searchQuery);
    const currentWorkspace = useSelector(state => state.workspaces.currentWorkspace);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showServiceTypeDropdown, setShowServiceTypeDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

    const serviceTypes = useSelector(state => state.settings?.serviceTypes || DEFAULT_SERVICE_TYPES);

    // Priority options
    const priorityOptions = [
        { value: 'low', label: 'Low', color: '#6460FF' },
        { value: 'medium', label: 'Medium', color: '#7C5DFA' },
        { value: 'high', label: 'High', color: '#FF8F00' },
        { value: 'urgent', label: 'Urgent', color: '#EC5757' }
    ];

    // Ensure we're viewing the correct workspace projects
    useEffect(() => {
        // Force refresh projects for current workspace when component mounts
        if (currentWorkspace && currentWorkspace.id) {
            console.log(`Projects page: Ensuring projects are from workspace ${currentWorkspace.id}`);
            dispatch(setActiveWorkspaceProjects(currentWorkspace.id));
        }
    }, [currentWorkspace?.id, dispatch]);

    // Reset filters to default on component mount to avoid issues after page reload
    React.useEffect(() => {
        // Only reset if there are active filters but no results would show
        if ((filter !== 'all' || serviceTypeFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim() !== '') && projects.length > 0) {
            const wouldHaveResults = projects.some(project => {
                const matchesStatus = filter === 'all' || project.status === filter;
                const matchesServiceType = serviceTypeFilter === 'all' ||
                    (project.serviceTypes &&
                        Array.isArray(project.serviceTypes) &&
                        project.serviceTypes.includes(serviceTypeFilter));
                const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

                return matchesStatus && matchesServiceType && matchesPriority;
            });

            if (!wouldHaveResults) {
                dispatch(clearProjectFilters());
            }
        }
    }, []);

    // Simulate loading
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Filter and search projects
    const filteredProjects = useMemo(() => {
        // Only show projects for the current workspace
        let workspaceFiltered = projects;

        if (currentWorkspace && currentWorkspace.id) {
            console.log(`Filtering projects for workspace: ${currentWorkspace.id}`);
            workspaceFiltered = projects.filter(project =>
                project.workspaceId === currentWorkspace.id
            );
        }

        // First filter by status
        let statusFiltered = workspaceFiltered.filter(project => {
            if (filter === 'all') return true;
            return project.status === filter;
        });

        // Then filter by service type if selected
        if (serviceTypeFilter !== 'all') {
            statusFiltered = statusFiltered.filter(project =>
                project.serviceTypes &&
                Array.isArray(project.serviceTypes) &&
                project.serviceTypes.includes(serviceTypeFilter)
            );
        }

        // Then filter by priority if selected
        if (priorityFilter !== 'all') {
            statusFiltered = statusFiltered.filter(project => project.priority === priorityFilter);
        }

        // Then filter by search query if one exists
        if (!searchQuery.trim()) return statusFiltered;

        const query = searchQuery.toLowerCase();
        return statusFiltered.filter(project =>
            project.name?.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query) ||
            project.client?.toLowerCase().includes(query)
        );
    }, [projects, filter, serviceTypeFilter, priorityFilter, searchQuery, currentWorkspace]);

    const handleFilterChange = (newFilter) => {
        dispatch(setProjectFilter(newFilter));
    };

    const handleServiceTypeFilterChange = (serviceTypeId) => {
        dispatch(setServiceTypeFilter(serviceTypeId));
        setShowServiceTypeDropdown(false);
    };

    const handlePriorityFilterChange = (priority) => {
        dispatch(setPriorityFilter(priority));
        setShowPriorityDropdown(false);
    };

    const handleClearFilters = () => {
        dispatch(clearProjectFilters());
    };

    const handleSearch = (e) => {
        dispatch(setProjectSearchQuery(e.target.value));
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filter !== 'all') count++;
        if (serviceTypeFilter !== 'all') count++;
        if (priorityFilter !== 'all') count++;
        if (searchQuery.trim()) count++;
        return count;
    }, [filter, serviceTypeFilter, priorityFilter, searchQuery]);

    // If loading, show skeleton loader
    if (isLoading) {
        return <ProjectsSkeleton />;
    }

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="text-center w-full max-w-md mx-auto"
            >
                <BiSearchAlt size={64} className="mx-auto text-light-border dark:text-dark-border mb-6 transition-colors duration-200" />
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-3 transition-colors duration-200">
                    {searchQuery ? "No projects match your search" : "No projects found"}
                </h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto mb-8 transition-colors duration-200">
                    {searchQuery || filter !== 'all' || serviceTypeFilter !== 'all' || priorityFilter !== 'all'
                        ? `Try different filter settings or clear filters.`
                        : `Get started by creating your first project.`}
                </p>
                {(searchQuery || filter !== 'all' || serviceTypeFilter !== 'all' || priorityFilter !== 'all') ? (
                    <button
                        onClick={handleClearFilters}
                        className="bg-light-card dark:bg-dark-card hover:bg-light-border dark:hover:bg-dark-border text-light-text dark:text-dark-text py-3 px-6 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-200 mx-auto"
                    >
                        <BiX size={20} />
                        Clear Filters
                    </button>
                ) : (
                    <button
                        onClick={handleOpenModal}
                        className="bg-[#7C5DFA] hover:bg-[#9277FF] text-white py-3 px-6 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-200 mx-auto"
                    >
                        <BiPlus size={20} />
                        New Project
                    </button>
                )}
            </motion.div>
        </div>
    );

    const getSelectedServiceTypeName = () => {
        if (serviceTypeFilter === 'all') return 'All Services';
        const serviceType = serviceTypes.find(type => type.id === serviceTypeFilter);
        return serviceType ? serviceType.name : 'All Services';
    };

    const getSelectedPriorityName = () => {
        if (priorityFilter === 'all') return 'All Priorities';
        const priority = priorityOptions.find(p => p.value === priorityFilter);
        return priority ? priority.label : 'All Priorities';
    };

    const getPriorityColor = (priorityValue) => {
        const option = priorityOptions.find(option => option.value === priorityValue);
        return option ? option.color : '#7C5DFA';
    };

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 pb-16">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Projects</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} total
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full py-2 pl-10 pr-4 w-full md:w-64 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] transition-colors duration-200"
                        />
                        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" size={20} />
                        {searchQuery && (
                            <button
                                onClick={() => dispatch(setProjectSearchQuery(''))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors duration-200"
                            >
                                <BiX size={20} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="relative flex items-center gap-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full py-2 px-4 text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                    >
                        <BiFilter size={18} />
                        <span className="hidden md:inline">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#7C5DFA] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-full ${viewMode === "grid"
                                ? "bg-[#7C5DFA] text-white"
                                : "text-light-text-secondary dark:text-dark-text-secondary"
                                } transition-colors duration-200`}
                            aria-label="Grid view"
                        >
                            <FiGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-full ${viewMode === "list"
                                ? "bg-[#7C5DFA] text-white"
                                : "text-light-text-secondary dark:text-dark-text-secondary"
                                } transition-colors duration-200`}
                            aria-label="List view"
                        >
                            <FiList size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleOpenModal}
                        className="bg-[#7C5DFA] hover:bg-[#9277FF] text-white py-2 px-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                        <BiPlus size={20} />
                        <span className="hidden md:inline">New Project</span>
                    </button>
                </div>
            </motion.div>

            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-5 mb-6 flex flex-wrap gap-4 items-start transition-colors duration-200"
                >
                    <div>
                        <label className="block text-xs font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
                            Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange("all")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "all"
                                    ? "bg-[#7C5DFA] text-white"
                                    : "bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterChange("active")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "active"
                                    ? "bg-[#33D69F] text-white"
                                    : "bg-light-bg dark:bg-dark-bg text-[#33D69F]"
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => handleFilterChange("completed")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "completed"
                                    ? "bg-[#6460FF] text-white"
                                    : "bg-light-bg dark:bg-dark-bg text-[#6460FF]"
                                    }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => handleFilterChange("on-hold")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "on-hold"
                                    ? "bg-[#FF8F00] text-white"
                                    : "bg-light-bg dark:bg-dark-bg text-[#FF8F00]"
                                    }`}
                            >
                                On Hold
                            </button>
                            <button
                                onClick={() => handleFilterChange("canceled")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${filter === "canceled"
                                    ? "bg-[#EC5757] text-white"
                                    : "bg-light-bg dark:bg-dark-bg text-[#EC5757]"
                                    }`}
                            >
                                Canceled
                            </button>
                        </div>
                    </div>

                    <div className="min-w-[180px]">
                        <label className="block text-xs font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
                            Service Type
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setShowServiceTypeDropdown(!showServiceTypeDropdown)}
                                className="w-full flex items-center justify-between bg-light-bg dark:bg-dark-bg rounded-md p-2 text-sm text-light-text dark:text-dark-text"
                            >
                                <div className="flex items-center gap-2">
                                    {serviceTypeFilter !== 'all' && (
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getServiceTypeColor(serviceTypeFilter) }}></span>
                                    )}
                                    <span>{getSelectedServiceTypeName()}</span>
                                </div>
                                <FiChevronDown className={`transition-transform ${showServiceTypeDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showServiceTypeDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-light-bg dark:bg-dark-bg rounded-md shadow-lg py-1 max-h-64 overflow-y-auto">
                                    <button
                                        onClick={() => handleServiceTypeFilterChange('all')}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border ${serviceTypeFilter === 'all' ? 'bg-light-border dark:bg-dark-border font-medium' : ''}`}
                                    >
                                        All Services
                                    </button>
                                    {serviceTypes.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleServiceTypeFilterChange(type.id)}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border flex items-center gap-2 ${serviceTypeFilter === type.id ? 'bg-light-border dark:bg-dark-border font-medium' : ''}`}
                                        >
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getServiceTypeColor(type.id) }}></span>
                                            {type.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="min-w-[180px]">
                        <label className="block text-xs font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
                            Priority
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                                className="w-full flex items-center justify-between bg-light-bg dark:bg-dark-bg rounded-md p-2 text-sm text-light-text dark:text-dark-text"
                            >
                                <div className="flex items-center gap-2">
                                    {priorityFilter !== 'all' && (
                                        <BiFlag className="text-light-text-secondary dark:text-dark-text-secondary" style={{ color: getPriorityColor(priorityFilter) }} />
                                    )}
                                    <span style={{ color: priorityFilter !== 'all' ? getPriorityColor(priorityFilter) : '' }}>
                                        {getSelectedPriorityName()}
                                    </span>
                                </div>
                                <FiChevronDown className={`transition-transform ${showPriorityDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showPriorityDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-light-bg dark:bg-dark-bg rounded-md shadow-lg py-1 max-h-64 overflow-y-auto">
                                    <button
                                        onClick={() => handlePriorityFilterChange('all')}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border ${priorityFilter === 'all' ? 'bg-light-border dark:bg-dark-border font-medium' : ''}`}
                                    >
                                        All Priorities
                                    </button>
                                    {priorityOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => handlePriorityFilterChange(option.value)}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border flex items-center gap-2 ${priorityFilter === option.value ? 'bg-light-border dark:bg-dark-border font-medium' : ''}`}
                                            style={{ color: option.color }}
                                        >
                                            <BiFlag />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={handleClearFilters}
                            className="ml-auto mt-auto flex items-center gap-1 text-sm text-[#7C5DFA] hover:text-[#9277FF] transition-colors duration-200"
                        >
                            <BiX size={18} />
                            Clear filters
                        </button>
                    )}
                </motion.div>
            )}

            {/* Active Filters Display */}
            {!showFilters && activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {filter !== 'all' && (
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white ${filter === "active" ? "bg-[#33D69F]" :
                            filter === "completed" ? "bg-[#6460FF]" :
                                filter === "on-hold" ? "bg-[#FF8F00]" :
                                    filter === "canceled" ? "bg-[#EC5757]" : "bg-[#7C5DFA]"
                            }`}>
                            Status: {filter.replace('-', ' ')}
                            <button
                                onClick={() => handleFilterChange('all')}
                                className="ml-1 hover:opacity-80"
                            >
                                <BiX size={16} />
                            </button>
                        </div>
                    )}

                    {serviceTypeFilter !== 'all' && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getServiceTypeColor(serviceTypeFilter) }}
                        >
                            {getSelectedServiceTypeName()}
                            <button
                                onClick={() => handleServiceTypeFilterChange('all')}
                                className="ml-1 hover:opacity-80"
                            >
                                <BiX size={16} />
                            </button>
                        </div>
                    )}

                    {priorityFilter !== 'all' && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getPriorityColor(priorityFilter) }}
                        >
                            <BiFlag size={12} />
                            {getSelectedPriorityName()}
                            <button
                                onClick={() => handlePriorityFilterChange('all')}
                                className="ml-1 hover:opacity-80"
                            >
                                <BiX size={16} />
                            </button>
                        </div>
                    )}

                    {searchQuery && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#7C5DFA] text-white">
                            Search: {searchQuery}
                            <button
                                onClick={() => dispatch(setProjectSearchQuery(''))}
                                className="ml-1 hover:opacity-80"
                            >
                                <BiX size={16} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleClearFilters}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {filteredProjects.length === 0 ? (
                renderEmptyState()
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className={viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "flex flex-col gap-4"
                    }
                >
                    {filteredProjects.map(project => (
                        <motion.div key={project.id} variants={listItem}>
                            {viewMode === "grid" ? (
                                <ProjectCard project={project} />
                            ) : (
                                <ProjectItem project={project} />
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {isModalOpen && <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Projects; 