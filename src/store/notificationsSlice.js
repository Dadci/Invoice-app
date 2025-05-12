import { createSlice } from '@reduxjs/toolkit';

// Load notifications from localStorage if available
const loadNotificationsFromStorage = () => {
    try {
        const savedNotifications = localStorage.getItem('invoiceAppNotifications');
        const parsedNotifications = savedNotifications ? JSON.parse(savedNotifications) : null;

        // Initialize workspaceNotifications if needed
        if (parsedNotifications && !parsedNotifications.workspaceNotifications) {
            parsedNotifications.workspaceNotifications = {
                'default': parsedNotifications.notifications || []
            };
        }

        return parsedNotifications;
    } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
        return null;
    }
};

const savedNotifications = loadNotificationsFromStorage();

const defaultInitialState = {
    notifications: [], // Will be deprecated, use workspaceNotifications instead
    workspaceNotifications: {
        'default': [] // Initialize with default workspace
    },
    settings: {
        monthEndReminder: true, // Reminder for month-end invoicing
        projectDeadlineReminder: true, // Reminder for approaching project deadlines
        paymentDueReminder: true, // Reminder for upcoming payment due dates
        reminderDays: 3, // Days before to send reminder
    },
    unreadCount: 0
};

// Use saved notifications or default if none exist
const initialState = savedNotifications || defaultInitialState;

// Helper to save state to localStorage
const saveNotificationsToStorage = (state) => {
    try {
        localStorage.setItem('invoiceAppNotifications', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving notifications to localStorage:', error);
    }
};

// Helper to count total unread notifications across all workspaces
const countTotalUnread = (workspaceNotifications) => {
    let total = 0;
    Object.values(workspaceNotifications).forEach(notifications => {
        notifications.forEach(notification => {
            if (!notification.read) {
                total++;
            }
        });
    });
    return total;
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            const { workspaceId = 'default', ...notificationData } = action.payload;

            const newNotification = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                read: false,
                workspaceId, // Store the workspace ID with the notification
                ...notificationData
            };

            // Initialize workspace if it doesn't exist
            if (!state.workspaceNotifications[workspaceId]) {
                state.workspaceNotifications[workspaceId] = [];
            }

            // Add to workspace notifications
            state.workspaceNotifications[workspaceId].unshift(newNotification); // Add to beginning of array

            // For backward compatibility
            if (workspaceId === 'default') {
                state.notifications = state.workspaceNotifications[workspaceId];
            }

            // Update unread count across all workspaces
            state.unreadCount = countTotalUnread(state.workspaceNotifications);

            saveNotificationsToStorage(state);
        },
        markAsRead: (state, action) => {
            const { notificationId, workspaceId = 'default' } = action.payload;

            // Find in the specific workspace
            if (state.workspaceNotifications[workspaceId]) {
                const notification = state.workspaceNotifications[workspaceId].find(n => n.id === notificationId);
                if (notification && !notification.read) {
                    notification.read = true;

                    // For backward compatibility
                    if (workspaceId === 'default') {
                        state.notifications = state.workspaceNotifications[workspaceId];
                    }

                    // Update unread count
                    state.unreadCount = countTotalUnread(state.workspaceNotifications);

                    saveNotificationsToStorage(state);
                }
            }
        },
        markAllAsRead: (state, action) => {
            const { workspaceId } = action.payload || {};

            if (workspaceId) {
                // Mark all as read in specific workspace
                if (state.workspaceNotifications[workspaceId]) {
                    state.workspaceNotifications[workspaceId].forEach(notification => {
                        notification.read = true;
                    });
                }
            } else {
                // Mark all as read in all workspaces
                Object.keys(state.workspaceNotifications).forEach(wsId => {
                    state.workspaceNotifications[wsId].forEach(notification => {
                        notification.read = true;
                    });
                });
            }

            // For backward compatibility
            state.notifications = state.workspaceNotifications['default'] || [];

            // Update unread count
            state.unreadCount = countTotalUnread(state.workspaceNotifications);

            saveNotificationsToStorage(state);
        },
        deleteNotification: (state, action) => {
            const { notificationId, workspaceId = 'default' } = action.payload;

            // Delete from specific workspace
            if (state.workspaceNotifications[workspaceId]) {
                const notification = state.workspaceNotifications[workspaceId].find(n => n.id === notificationId);
                if (notification && !notification.read) {
                    // Decrease unread count if unread
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }

                state.workspaceNotifications[workspaceId] = state.workspaceNotifications[workspaceId].filter(n => n.id !== notificationId);

                // For backward compatibility
                if (workspaceId === 'default') {
                    state.notifications = state.workspaceNotifications[workspaceId];
                }

                saveNotificationsToStorage(state);
            }
        },
        updateNotificationSettings: (state, action) => {
            state.settings = {
                ...state.settings,
                ...action.payload
            };
            saveNotificationsToStorage(state);
        },
        clearAllNotifications: (state, action) => {
            const { workspaceId } = action.payload || {};

            if (workspaceId) {
                // Clear notifications for specific workspace
                if (state.workspaceNotifications[workspaceId]) {
                    state.workspaceNotifications[workspaceId] = [];
                }
            } else {
                // Clear all notifications in all workspaces
                Object.keys(state.workspaceNotifications).forEach(wsId => {
                    state.workspaceNotifications[wsId] = [];
                });
            }

            // For backward compatibility
            state.notifications = state.workspaceNotifications['default'] || [];

            // Update unread count
            state.unreadCount = countTotalUnread(state.workspaceNotifications);

            saveNotificationsToStorage(state);
        }
    }
});

export const {
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateNotificationSettings,
    clearAllNotifications
} = notificationsSlice.actions;

export default notificationsSlice.reducer; 