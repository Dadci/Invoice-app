import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateNotificationSettings } from '../store/notificationsSlice';
import { BiInfoCircle } from 'react-icons/bi';
import toast from 'react-hot-toast';

const NotificationsSettings = () => {
    const dispatch = useDispatch();
    const notificationSettings = useSelector(state => state.notifications.settings);

    const [formData, setFormData] = useState({
        monthEndReminder: notificationSettings?.monthEndReminder ?? true,
        projectDeadlineReminder: notificationSettings?.projectDeadlineReminder ?? true,
        paymentDueReminder: notificationSettings?.paymentDueReminder ?? true,
        reminderDays: notificationSettings?.reminderDays ?? 3
    });

    // Update local state when redux state changes (e.g., on initial load)
    useEffect(() => {
        setFormData({
            monthEndReminder: notificationSettings?.monthEndReminder ?? true,
            projectDeadlineReminder: notificationSettings?.projectDeadlineReminder ?? true,
            paymentDueReminder: notificationSettings?.paymentDueReminder ?? true,
            reminderDays: notificationSettings?.reminderDays ?? 3
        });
    }, [notificationSettings]);

    const handleToggleChange = (setting) => {
        setFormData({
            ...formData,
            [setting]: !formData[setting]
        });
    };

    const handleDaysChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 30) {
            setFormData({
                ...formData,
                reminderDays: value
            });
        }
    };

    const saveSettings = () => {
        dispatch(updateNotificationSettings(formData));
        toast.success('Notification settings saved successfully');
    };

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 shadow-sm transition-colors duration-200">
            <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text transition-colors duration-200">Reminder Notifications</h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                Configure when and how you want to receive reminder notifications for invoices, projects, and payment deadlines.
            </p>

            <div className="space-y-6">
                <div className="flex items-center justify-between py-2">
                    <div>
                        <h3 className="text-base font-semibold text-light-text dark:text-dark-text">Month-End Reminders</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Receive reminders to send invoices at the end of each month
                        </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.monthEndReminder}
                            onChange={() => handleToggleChange('monthEndReminder')}
                        />
                        <div className={`w-14 h-7 rounded-full transition-colors duration-200 flex items-center ${formData.monthEndReminder ? 'bg-[#7C5DFA]' : 'bg-gray-400'}`}>
                            <div className={`w-5 h-5 m-1 rounded-full bg-white transform transition-transform duration-200 ${formData.monthEndReminder ? 'translate-x-7' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <h3 className="text-base font-semibold text-light-text dark:text-dark-text">Project Deadline Reminders</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Get notifications when project deadlines are approaching
                        </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.projectDeadlineReminder}
                            onChange={() => handleToggleChange('projectDeadlineReminder')}
                        />
                        <div className={`w-14 h-7 rounded-full transition-colors duration-200 flex items-center ${formData.projectDeadlineReminder ? 'bg-[#7C5DFA]' : 'bg-gray-400'}`}>
                            <div className={`w-5 h-5 m-1 rounded-full bg-white transform transition-transform duration-200 ${formData.projectDeadlineReminder ? 'translate-x-7' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <h3 className="text-base font-semibold text-light-text dark:text-dark-text">Payment Due Reminders</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Receive alerts when invoice payments are due
                        </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.paymentDueReminder}
                            onChange={() => handleToggleChange('paymentDueReminder')}
                        />
                        <div className={`w-14 h-7 rounded-full transition-colors duration-200 flex items-center ${formData.paymentDueReminder ? 'bg-[#7C5DFA]' : 'bg-gray-400'}`}>
                            <div className={`w-5 h-5 m-1 rounded-full bg-white transform transition-transform duration-200 ${formData.paymentDueReminder ? 'translate-x-7' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>

                <div className="pt-6 mt-2 border-t border-light-border dark:border-dark-border">
                    <h3 className="font-semibold text-[#7C5DFA] mb-4">Reminder Timing</h3>

                    <div className="space-y-2">
                        <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-center">
                            Days Before Due Date
                            <div className="group relative ml-2">
                                <BiInfoCircle className="text-light-text-secondary dark:text-dark-text-secondary cursor-help" />
                                <div className="absolute z-10 w-64 p-2 text-xs bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -translate-x-1/2 left-1/2 bottom-full mb-2">
                                    Set how many days in advance you want to receive reminders for upcoming deadlines and payment due dates.
                                </div>
                            </div>
                        </label>

                        <div className="flex items-center">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={formData.reminderDays}
                                onChange={handleDaysChange}
                                className="w-20 h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                            />
                            <span className="ml-3 text-light-text-secondary dark:text-dark-text-secondary">
                                days before due date
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={saveSettings}
                    className="py-3 px-6 bg-[#7C5DFA] text-white rounded-full font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default NotificationsSettings; 