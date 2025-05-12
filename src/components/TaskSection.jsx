import React, { useState } from 'react';
import { BiCheck, BiX, BiPlus, BiPencil, BiTrash, BiTimeFive } from 'react-icons/bi';
import { format } from 'date-fns';

const TaskSection = ({ project, onUpdateTasks }) => {
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium' });
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [filter, setFilter] = useState('all');

    // Task statuses and their display settings
    const taskStatuses = [
        { value: 'todo', label: 'To Do', color: '#7C5DFA' },
        { value: 'in-progress', label: 'In Progress', color: '#FF8F00' },
        { value: 'review', label: 'Review', color: '#6460FF' },
        { value: 'done', label: 'Done', color: '#33D69F' }
    ];

    // Task priorities and their display settings
    const taskPriorities = [
        { value: 'low', label: 'Low', color: '#6460FF' },
        { value: 'medium', label: 'Medium', color: '#7C5DFA' },
        { value: 'high', label: 'High', color: '#FF8F00' },
        { value: 'urgent', label: 'Urgent', color: '#EC5757' }
    ];

    // Initialize tasks array if it doesn't exist
    const tasks = project.tasks || [];

    // Filter tasks based on selected filter
    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(task => task.status === filter);

    // Get statistics for tasks
    const taskStats = {
        total: tasks.length,
        todo: tasks.filter(task => task.status === 'todo').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        review: tasks.filter(task => task.status === 'review').length,
        done: tasks.filter(task => task.status === 'done').length
    };

    // Handle creating a new task
    const handleCreateTask = () => {
        if (!newTask.title.trim()) {
            return;
        }

        const newTaskItem = {
            id: Date.now().toString(),
            title: newTask.title.trim(),
            description: newTask.description.trim(),
            status: newTask.status,
            priority: newTask.priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedTasks = [...tasks, newTaskItem];
        onUpdateTasks(updatedTasks);

        // Reset form
        setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' });
        setShowNewTaskForm(false);
    };

    // Handle updating a task
    const handleUpdateTask = (taskId) => {
        if (!newTask.title.trim()) {
            return;
        }

        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    title: newTask.title.trim(),
                    description: newTask.description.trim(),
                    status: newTask.status,
                    priority: newTask.priority,
                    updatedAt: new Date().toISOString()
                };
            }
            return task;
        });

        onUpdateTasks(updatedTasks);

        // Reset form
        setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' });
        setEditingTaskId(null);
    };

    // Handle deleting a task
    const handleDeleteTask = (taskId) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        onUpdateTasks(updatedTasks);
    };

    // Handle changing status of a task
    const handleChangeStatus = (taskId, newStatus) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                };
            }
            return task;
        });

        onUpdateTasks(updatedTasks);
    };

    // Start editing a task
    const startEditTask = (task) => {
        setNewTask({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority || 'medium'
        });
        setEditingTaskId(task.id);
        setShowNewTaskForm(true);
    };

    // Cancel task form
    const cancelTaskForm = () => {
        setNewTask({ title: '', description: '', status: 'todo', priority: 'medium' });
        setShowNewTaskForm(false);
        setEditingTaskId(null);
    };

    // Get the color for a status
    const getStatusColor = (status) => {
        const statusObj = taskStatuses.find(s => s.value === status);
        return statusObj ? statusObj.color : '#7C5DFA';
    };

    // Get the color for a priority
    const getPriorityColor = (priority) => {
        const priorityObj = taskPriorities.find(p => p.value === priority);
        return priorityObj ? priorityObj.color : '#7C5DFA';
    };

    // Get the label for a status
    const getStatusLabel = (status) => {
        const statusObj = taskStatuses.find(s => s.value === status);
        return statusObj ? statusObj.label : 'Unknown';
    };

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                    Tasks
                    <span className="text-xs bg-light-bg dark:bg-dark-bg px-2 py-0.5 rounded-full text-light-text-secondary dark:text-dark-text-secondary">
                        {taskStats.total}
                    </span>
                </h3>
                <button
                    onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                    className="px-4 py-2 bg-[#7C5DFA] text-white rounded-full text-sm hover:bg-[#9277FF] transition-colors duration-200 flex items-center gap-2"
                >
                    {showNewTaskForm ? (
                        <>
                            <BiX size={16} />
                            Cancel
                        </>
                    ) : (
                        <>
                            <BiPlus size={16} />
                            New Task
                        </>
                    )}
                </button>
            </div>

            {/* Task filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'all'
                            ? 'bg-[#7C5DFA] text-white'
                            : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary'
                        }`}
                >
                    All ({taskStats.total})
                </button>
                {taskStatuses.map(status => (
                    <button
                        key={status.value}
                        onClick={() => setFilter(status.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${filter === status.value
                                ? `text-white`
                                : `text-${status.color}`
                            }`}
                        style={{
                            backgroundColor: filter === status.value ? status.color : `${status.color}20`,
                            color: filter === status.value ? 'white' : status.color
                        }}
                    >
                        {status.label} ({status.value === 'todo' ? taskStats.todo :
                            status.value === 'in-progress' ? taskStats.inProgress :
                                status.value === 'review' ? taskStats.review :
                                    taskStats.done})
                    </button>
                ))}
            </div>

            {/* Task form */}
            {showNewTaskForm && (
                <div className="mb-6 bg-light-bg dark:bg-dark-bg p-4 rounded-lg border border-light-border dark:border-dark-border">
                    <h4 className="text-md font-semibold text-light-text dark:text-dark-text mb-4">
                        {editingTaskId ? 'Edit Task' : 'New Task'}
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="Task title"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                Description
                            </label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200 resize-none"
                                placeholder="Task description"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Status
                                </label>
                                <select
                                    value={newTask.status}
                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                    className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                >
                                    {taskStatuses.map(status => (
                                        <option key={status.value} value={status.value} style={{ color: status.color }}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Priority
                                </label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="w-full p-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                >
                                    {taskPriorities.map(priority => (
                                        <option key={priority.value} value={priority.value} style={{ color: priority.color }}>
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelTaskForm}
                                className="px-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingTaskId ? () => handleUpdateTask(editingTaskId) : handleCreateTask}
                                className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md hover:bg-[#9277FF] transition-colors duration-200"
                                disabled={!newTask.title.trim()}
                            >
                                {editingTaskId ? 'Update Task' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task list */}
            {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                    {filteredTasks.map(task => (
                        <div key={task.id} className="bg-light-bg dark:bg-dark-bg rounded-lg p-4 border-l-4 transition-all duration-200 hover:shadow-md"
                            style={{ borderLeftColor: getPriorityColor(task.priority) }}>
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-light-text dark:text-dark-text">{task.title}</h4>
                                    {task.description && (
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: `${getStatusColor(task.status)}30`,
                                                color: getStatusColor(task.status)
                                            }}>
                                            {getStatusLabel(task.status)}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: `${getPriorityColor(task.priority)}30`,
                                                color: getPriorityColor(task.priority)
                                            }}>
                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-light-border dark:border-dark-border">
                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                    <BiTimeFive size={14} />
                                    {format(new Date(task.createdAt), 'dd MMM yyyy')}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Status quick change */}
                                    <div className="relative group inline-block">
                                        <button className="text-xs px-2 py-1 rounded bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors duration-200">
                                            Move To
                                        </button>
                                        <div className="absolute right-0 mt-1 w-32 bg-light-card dark:bg-dark-card rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                            {taskStatuses.map(status => (
                                                <button
                                                    key={status.value}
                                                    onClick={() => handleChangeStatus(task.id, status.value)}
                                                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200 ${status.value === task.status ? 'font-semibold' : ''}`}
                                                    style={{
                                                        color: status.color
                                                    }}
                                                    disabled={status.value === task.status}
                                                >
                                                    {status.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => startEditTask(task)}
                                        className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] transition-colors duration-200"
                                    >
                                        <BiPencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors duration-200"
                                    >
                                        <BiTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary bg-light-bg dark:bg-dark-bg rounded-lg">
                    {tasks.length === 0
                        ? 'No tasks created yet. Add your first task to get started!'
                        : 'No tasks match the selected filter.'}
                </div>
            )}

            {/* Task progress section */}
            {tasks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border">
                    <h4 className="text-md font-semibold text-light-text dark:text-dark-text mb-3">
                        Task Progress
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        <span>0%</span>
                        <span>{Math.round((taskStats.done / taskStats.total) * 100)}% completed</span>
                        <span>100%</span>
                    </div>
                    <div className="h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#33D69F]"
                            style={{ width: `${(taskStats.done / taskStats.total) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-4 text-xs">
                        <div className="flex flex-col items-center">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">To Do</span>
                            <span className="text-[#7C5DFA] font-semibold">{taskStats.todo}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">In Progress</span>
                            <span className="text-[#FF8F00] font-semibold">{taskStats.inProgress}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">Review</span>
                            <span className="text-[#6460FF] font-semibold">{taskStats.review}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">Done</span>
                            <span className="text-[#33D69F] font-semibold">{taskStats.done}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskSection; 