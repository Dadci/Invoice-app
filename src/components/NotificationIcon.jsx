import React, { useState, useRef, useEffect } from 'react';
import { BiBell, BiX, BiCheck, BiTrash, BiEnvelope } from 'react-icons/bi';
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../store/notificationsSlice';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotificationIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get current workspace
    const currentWorkspace = useSelector(state => state.workspaces.currentWorkspace);
    const workspaceId = currentWorkspace?.id || 'default';

    // Get notifications for current workspace
    const notificationsState = useSelector(state => state.notifications);
    const { unreadCount } = notificationsState;

    // Get workspace-specific notifications
    const currentWorkspaceNotifications = notificationsState.workspaceNotifications[workspaceId] || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (id) => {
        dispatch(markAsRead({ notificationId: id, workspaceId }));
    };

    const handleDeleteNotification = (e, id) => {
        e.stopPropagation();
        dispatch(deleteNotification({ notificationId: id, workspaceId }));
    };

    const handleViewInvoice = (e, invoiceId, notificationId) => {
        e.stopPropagation();
        dispatch(markAsRead({ notificationId, workspaceId }));
        setIsOpen(false);
        navigate(`/invoice/${invoiceId}`);
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return `Today at ${format(date, 'h:mm a')}`;
        } else if (isYesterday(date)) {
            return `Yesterday at ${format(date, 'h:mm a')}`;
        } else {
            return format(date, 'MMM d, yyyy');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'monthEnd':
                return <span className="bg-[#7C5DFA] text-white p-2 rounded-full">📆</span>;
            case 'projectDeadline':
                return <span className="bg-[#FF8F00] text-white p-2 rounded-full">🔔</span>;
            case 'paymentDue':
                return <span className="bg-[#33D69F] text-white p-2 rounded-full">💰</span>;
            case 'invoiceReminder':
                return <span className="bg-[#7C5DFA] p-2 rounded-full flex items-center justify-center"><BiEnvelope size={18} className="text-white" /></span>;
            default:
                return <span className="bg-[#7C5DFA] text-white p-2 rounded-full">🔔</span>;
        }
    };

    // Get current workspace unread count
    const currentWorkspaceUnreadCount = currentWorkspaceNotifications.filter(n => !n.read).length;

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border transition-colors duration-200"
                aria-label="Notifications"
            >
                <BiBell size={20} />
                {currentWorkspaceUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#7C5DFA] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {currentWorkspaceUnreadCount > 9 ? '9+' : currentWorkspaceUnreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute right-0 mt-2 w-80 bg-light-card dark:bg-dark-card rounded-lg shadow-lg z-50 border border-light-border dark:border-dark-border overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
                            <h3 className="font-semibold text-light-text dark:text-dark-text">
                                {currentWorkspace?.name || 'Default'} Notifications
                            </h3>
                            <div className="flex items-center gap-2">
                                {currentWorkspaceUnreadCount > 0 && (
                                    <button
                                        onClick={() => dispatch(markAllAsRead({ workspaceId }))}
                                        className="text-xs flex items-center gap-1 text-[#7C5DFA] hover:underline"
                                    >
                                        <BiCheck size={16} />
                                        Mark all as read
                                    </button>
                                )}
                                {currentWorkspaceNotifications.length > 0 && (
                                    <button
                                        onClick={() => dispatch(clearAllNotifications({ workspaceId }))}
                                        className="text-xs flex items-center gap-1 text-[#EC5757] hover:underline"
                                    >
                                        <BiTrash size={16} />
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {currentWorkspaceNotifications.length === 0 ? (
                                <div className="py-6 text-center text-light-text-secondary dark:text-dark-text-secondary">
                                    No notifications yet
                                </div>
                            ) : (
                                currentWorkspaceNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={`p-4 cursor-pointer hover:bg-light-bg dark:hover:bg-dark-bg flex gap-3 border-b border-light-border dark:border-dark-border transition-colors duration-200 
                                        ${!notification.read ? 'bg-light-bg/30 dark:bg-dark-bg/30' : ''}`}
                                    >
                                        <div className="flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-light-text dark:text-dark-text`}>
                                                    {notification.title}
                                                </p>
                                                <button
                                                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                                                    className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] transition-colors duration-200"
                                                >
                                                    <BiX size={18} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                                {formatTimestamp(notification.timestamp)}
                                            </p>

                                            {/* Add View Invoice button for invoice reminders */}
                                            {notification.type === 'invoiceReminder' && notification.invoiceId && (
                                                <div className="mt-2 flex justify-end">
                                                    <button
                                                        className="text-xs text-[#7C5DFA] hover:text-[#9277FF] font-medium transition-colors duration-200 flex items-center gap-1"
                                                        onClick={(e) => handleViewInvoice(e, notification.invoiceId, notification.id)}
                                                    >
                                                        <BiEnvelope size={14} />
                                                        View Invoice
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationIcon; 