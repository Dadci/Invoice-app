import React from 'react';

export const InvoiceItemSkeleton = () => {
    return (
        <div className="w-full bg-light-card dark:bg-dark-card rounded-lg p-6 shadow-sm animate-pulse mb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                    <div className="w-28 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-32 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                    <div className="w-full md:w-24 h-8 bg-light-border dark:bg-dark-border rounded-full"></div>
                    <div className="w-full md:w-8 h-8 bg-light-border dark:bg-dark-border rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export const ProjectCardSkeleton = () => {
    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg overflow-hidden border border-light-border/10 dark:border-dark-border/10 h-full animate-pulse">
            <div className="p-5 flex flex-col h-full">
                {/* Header: Title + Status Badge */}
                <div className="flex justify-between gap-3 mb-2">
                    <div className="w-36 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                    <div className="w-20 h-6 bg-light-border dark:bg-dark-border rounded-full"></div>
                </div>

                {/* Date and Priority */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-12 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                </div>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-1 mb-3 min-h-[20px]">
                    <div className="w-16 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                    <div className="w-20 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                </div>

                {/* Project Meta Grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-24 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-16 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-16 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-auto pt-3">
                    <div className="flex justify-between mb-1">
                        <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                    <div className="h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden mb-3">
                        <div className="h-full w-3/4 bg-light-border dark:bg-dark-border rounded-full"></div>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-24 h-3.5 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProjectItemSkeleton = () => {
    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg overflow-hidden border border-light-border/10 dark:border-dark-border/10 animate-pulse">
            <div className="p-5">
                {/* Main content area */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left column - Project info */}
                    <div className="flex-1">
                        {/* Project title and date */}
                        <div className="flex items-start justify-between sm:justify-start gap-3 mb-2">
                            <div className="w-32 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-light-border dark:bg-dark-border rounded-full"></div>
                                <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded mb-2"></div>

                        {/* Service Types */}
                        <div className="flex flex-wrap gap-1 mb-3">
                            <div className="w-16 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                            <div className="w-20 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                        </div>

                        {/* Project Meta Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                                <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                                <div className="w-16 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                                <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Status badges */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                        <div className="w-20 h-6 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-16 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                        <div className="hidden sm:block sm:mt-auto w-24 h-3.5 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                </div>

                {/* Progress bar section */}
                <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 bg-light-border dark:bg-dark-border rounded-full"></div>
                            <div className="w-16 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                        </div>
                        <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                        <div className="sm:hidden w-10 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>

                    {/* Hours Progress Bar */}
                    <div className="h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-light-border dark:bg-dark-border rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const InvoiceDetailsSkeleton = () => {
    return (
        <div className="w-full animate-pulse">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 bg-light-border dark:bg-dark-border rounded-full"></div>
                <div className="w-24 h-4 bg-light-border dark:bg-dark-border rounded"></div>
            </div>

            {/* Action bar */}
            <div className="w-full bg-light-card dark:bg-dark-card p-4 px-6 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                        <div className="w-24 h-8 bg-light-border dark:bg-dark-border rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-28 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-28 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-20 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-28 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-[70%] bg-light-card dark:bg-dark-card p-8 rounded-lg shadow-sm">
                    <div className="flex justify-between">
                        <div className="w-40 h-6 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                        <div className="w-32 h-20 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-8">
                        <div className="flex flex-col gap-2">
                            <div className="w-24 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            <div className="w-32 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="w-24 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            <div className="w-32 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="w-24 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            <div className="w-32 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-lg overflow-hidden">
                        <div className="bg-[#F9FAFE] dark:bg-[#252945] p-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>

                            {[1, 2, 3].map((i) => (
                                <div key={i} className="grid grid-cols-4 gap-4 mt-6">
                                    <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                                    <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                                    <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                                    <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded"></div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#373B53] dark:bg-[#0C0E16] p-6 flex justify-between items-center">
                            <div className="w-28 h-4 bg-[#494e77] rounded"></div>
                            <div className="w-28 h-6 bg-[#494e77] rounded"></div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[30%]">
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm mb-6">
                        <div className="w-32 h-5 bg-light-border dark:bg-dark-border rounded mb-4"></div>
                        <div className="w-full h-32 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>

                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm">
                        <div className="w-40 h-5 bg-light-border dark:bg-dark-border rounded mb-4"></div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="w-24 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="w-40 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-24 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="w-40 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-24 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="w-40 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProjectsSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 mb-8 animate-pulse">
                <div>
                    <div className="w-48 h-8 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                    <div className="w-32 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                </div>
                <div className="flex gap-3">
                    <div className="w-64 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                    <div className="w-10 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                    <div className="flex h-10 rounded-full bg-light-border dark:bg-dark-border overflow-hidden">
                        <div className="w-10 h-full"></div>
                        <div className="w-10 h-full bg-light-border/80 dark:bg-dark-border/80"></div>
                    </div>
                    <div className="w-40 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                </div>
            </div>

            {/* Filters section */}
            <div className="bg-light-card dark:bg-dark-card rounded-lg p-5 mb-6 animate-pulse">
                <div className="flex flex-wrap gap-4">
                    <div className="w-full md:w-auto">
                        <div className="h-4 w-20 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-7 w-16 bg-light-border dark:bg-dark-border rounded-full"></div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="h-4 w-24 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                        <div className="h-10 w-40 bg-light-border dark:bg-dark-border rounded-md"></div>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="h-4 w-16 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                        <div className="h-10 w-40 bg-light-border dark:bg-dark-border rounded-md"></div>
                    </div>
                </div>
            </div>

            {/* Filter tags */}
            <div className="flex flex-wrap gap-2 mb-6 animate-pulse">
                <div className="w-24 h-6 bg-light-border dark:bg-dark-border rounded-full"></div>
                <div className="w-32 h-6 bg-light-border dark:bg-dark-border rounded-full"></div>
                <div className="w-28 h-6 bg-light-border dark:bg-dark-border rounded-full"></div>
            </div>

            {/* Grid view */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ProjectCardSkeleton key={i} />
                ))}
            </div>

            {/* Alternative: List view (hidden by default) */}
            <div className="hidden flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <ProjectItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export const ProjectDetailsSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 pb-16 animate-pulse">
            {/* Back button */}
            <div className="flex items-center gap-2 mb-8 mt-8">
                <div className="w-5 h-5 bg-light-border dark:bg-dark-border rounded-full"></div>
                <div className="w-32 h-4 bg-light-border dark:bg-dark-border rounded"></div>
            </div>

            {/* Action bar */}
            <div className="w-full bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm mb-6">
                <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                        <div className="w-24 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-24 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-24 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-light-border dark:border-dark-border mb-6">
                <div className="w-24 h-10 bg-light-border dark:bg-dark-border"></div>
                <div className="w-24 h-10 bg-light-border dark:bg-dark-border ml-4"></div>
                <div className="w-24 h-10 bg-light-border dark:bg-dark-border ml-4"></div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6">
                    <div className="w-48 h-8 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-4 h-4 bg-light-border dark:bg-dark-border rounded-full"></div>
                        <div className="w-40 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>

                    <div className="w-full h-24 bg-light-border dark:bg-dark-border rounded mb-8"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="w-24 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="w-32 h-6 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* Project Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-light-bg dark:bg-dark-bg rounded-lg p-4">
                                <div className="w-24 h-3 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                                <div className="w-16 h-6 bg-light-border dark:bg-dark-border rounded mb-1"></div>
                                <div className="w-20 h-3 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6">
                    <div className="w-40 h-6 bg-light-border dark:bg-dark-border rounded mb-6"></div>

                    <div className="w-full h-64 bg-light-border dark:bg-dark-border rounded-lg mb-6"></div>

                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg">
                                <div className="w-16 h-3 bg-light-border dark:bg-dark-border rounded mb-1"></div>
                                <div className="w-20 h-5 bg-light-border dark:bg-dark-border rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task Section Skeleton (would be displayed in Tasks tab) */}
            <div className="hidden mt-6 bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="w-32 h-6 bg-light-border dark:bg-dark-border rounded"></div>
                    <div className="w-32 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-24 h-8 bg-light-border dark:bg-dark-border rounded-full"></div>
                    ))}
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-light-bg dark:bg-dark-bg rounded-lg p-4 border-l-4 border-light-border">
                            <div className="flex justify-between items-start gap-4 mb-3">
                                <div className="w-full">
                                    <div className="w-64 h-5 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                                    <div className="w-full h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-16 h-6 bg-light-border dark:bg-dark-border rounded-full"></div>
                                    <div className="w-16 h-6 bg-light-border dark:bg-dark-border rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-light-border dark:border-dark-border">
                                <div className="w-24 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="w-8 h-8 bg-light-border dark:bg-dark-border rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invoices table - would be displayed in Invoices tab */}
            <div className="hidden mt-6 bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="w-40 h-6 bg-light-border dark:bg-dark-border rounded"></div>
                    <div className="w-32 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-light-border dark:border-dark-border">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <th key={i} className="pb-4">
                                        <div className="w-full h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="border-b border-light-border dark:border-dark-border">
                                    {[1, 2, 3, 4, 5, 6].map(j => (
                                        <td key={j} className="py-4">
                                            <div className="w-full h-4 bg-light-border dark:bg-dark-border rounded"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 pb-16 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 mb-8">
                <div>
                    <div className="w-48 h-8 bg-light-border dark:bg-dark-border rounded mb-2"></div>
                    <div className="w-32 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="w-40 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                    <div className="w-40 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                </div>
            </div>

            {/* Dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-light-card dark:bg-dark-card rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-32 h-4 bg-light-border dark:bg-dark-border rounded"></div>
                            <div className="w-10 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
                        </div>
                        <div className="w-28 h-8 bg-light-border dark:bg-dark-border rounded"></div>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex gap-4">
                    <div className="w-28 h-8 bg-light-border dark:bg-dark-border rounded"></div>
                    <div className="w-32 h-8 bg-light-border dark:bg-dark-border rounded"></div>
                </div>
                <div className="w-40 h-10 bg-light-border dark:bg-dark-border rounded-full"></div>
            </div>

            {/* Invoice list */}
            {[1, 2, 3, 4, 5].map((i) => (
                <InvoiceItemSkeleton key={i} />
            ))}
        </div>
    );
};

export default {
    InvoiceItemSkeleton,
    InvoiceDetailsSkeleton,
    ProjectCardSkeleton,
    ProjectItemSkeleton,
    ProjectsSkeleton,
    ProjectDetailsSkeleton,
    DashboardSkeleton
}; 