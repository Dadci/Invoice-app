import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    addWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember,
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
} from '../../store/workspacesSlice';
import { BiUserPlus, BiTrash, BiEdit, BiX, BiCheck, BiShield, BiUser, BiEnvelope, BiLockOpen, BiLock, BiChevronDown, BiShieldQuarter, BiGroup, BiBuildings } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_PLANS } from '../../store/subscriptionSlice';
import PaymentPlansModal from './PaymentPlansModal';
import { toast } from 'react-hot-toast';

const ROLE_INFO = {
    [ROLES.OWNER]: {
        label: 'Owner',
        description: 'Full access to all features and settings. Can add/remove members and delete workspace.',
        icon: <BiShield className="text-[#7C5DFA]" size={18} />,
        color: 'text-[#7C5DFA]',
        bgColor: 'bg-[#7C5DFA]/10',
    },
    [ROLES.ADMIN]: {
        label: 'Admin',
        description: 'Manage all content, settings, and members. Cannot delete workspace.',
        icon: <BiShield className="text-[#33D69F]" size={18} />,
        color: 'text-[#33D69F]',
        bgColor: 'bg-[#33D69F]/10',
    },
    [ROLES.MEMBER]: {
        label: 'Member',
        description: 'Create and edit invoices and projects. Cannot manage members or settings.',
        icon: <BiUser className="text-[#FF8F00]" size={18} />,
        color: 'text-[#FF8F00]',
        bgColor: 'bg-[#FF8F00]/10',
    },
    [ROLES.VIEWER]: {
        label: 'Viewer',
        description: 'View-only access to invoices and projects.',
        icon: <BiUser className="text-[#5757EC]" size={18} />,
        color: 'text-[#5757EC]',
        bgColor: 'bg-[#5757EC]/10',
    }
};

// Group permissions by category for display
const PERMISSION_CATEGORIES = {
    workspace: {
        title: 'Workspace Management',
        icon: <BiLockOpen size={18} />,
        permissions: [
            PERMISSIONS.MANAGE_WORKSPACE,
            PERMISSIONS.INVITE_MEMBERS,
            PERMISSIONS.MANAGE_MEMBERS,
            PERMISSIONS.MANAGE_SETTINGS
        ]
    },
    invoice: {
        title: 'Invoice Management',
        icon: <BiEnvelope size={18} />,
        permissions: [
            PERMISSIONS.CREATE_INVOICE,
            PERMISSIONS.EDIT_INVOICE,
            PERMISSIONS.DELETE_INVOICE,
            PERMISSIONS.VIEW_INVOICE
        ]
    },
    project: {
        title: 'Project Management',
        icon: <BiUser size={18} />,
        permissions: [
            PERMISSIONS.CREATE_PROJECT,
            PERMISSIONS.EDIT_PROJECT,
            PERMISSIONS.DELETE_PROJECT,
            PERMISSIONS.VIEW_PROJECT
        ]
    }
};

// Format permission name for display
const formatPermissionName = (permission) => {
    return permission
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const WorkspaceMembers = () => {
    const dispatch = useDispatch();
    const { currentWorkspace, currentUser } = useSelector(state => state.workspaces);
    const { currentPlan, planDetails } = useSelector(state => state.subscription);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showPaymentPlans, setShowPaymentPlans] = useState(false);
    const [pendingRoleChange, setPendingRoleChange] = useState(null);
    const [inviteData, setInviteData] = useState({
        email: '',
        name: '',
        role: ROLES.MEMBER
    });
    const [editRoleData, setEditRoleData] = useState({
        role: ROLES.MEMBER
    });

    // Function to check if current user has permission to manage members
    const canManageMembers = () => {
        if (!currentWorkspace?.members) return false;

        const currentMember = currentWorkspace.members.find(m => m.userId === currentUser.id);
        if (!currentMember) return false;

        const permissions = ROLE_PERMISSIONS[currentMember.role] || [];
        return permissions.includes(PERMISSIONS.MANAGE_MEMBERS);
    };

    // Function to check if user is the only owner
    const isOnlyOwner = (userId) => {
        if (!currentWorkspace?.members) return false;

        const owners = currentWorkspace.members.filter(m => m.role === ROLES.OWNER);
        return owners.length === 1 && owners[0].userId === userId;
    };

    // Function to check if we can add more admin users based on subscription plan
    const canAddAdminUser = () => {
        if (!currentWorkspace?.members) return true;

        const adminCount = currentWorkspace.members.filter(m =>
            m.role === ROLES.ADMIN || m.role === ROLES.OWNER
        ).length;

        return adminCount < planDetails.maxAdmins;
    };

    // Function to count admins in the workspace
    const countAdminUsers = () => {
        if (!currentWorkspace?.members) return 0;

        return currentWorkspace.members.filter(m =>
            m.role === ROLES.ADMIN || m.role === ROLES.OWNER
        ).length;
    };

    const handleInviteChange = (e) => {
        const { name, value } = e.target;

        // If changing to admin role and we're at the limit, show payment plans immediately
        if (name === 'role' && (value === ROLES.ADMIN || value === ROLES.OWNER) && !canAddAdminUser()) {
            setPendingRoleChange({
                type: 'invite',
                data: { ...inviteData, role: value }
            });
            setShowPaymentPlans(true);
            return;
        }

        setInviteData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditRoleChange = (e) => {
        const { name, value } = e.target;
        setEditRoleData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInviteMember = (e) => {
        e.preventDefault();

        if (!inviteData.email || !inviteData.name) return;

        // Check if we're adding an admin and if we've reached the limit
        if ((inviteData.role === ROLES.ADMIN || inviteData.role === ROLES.OWNER) && !canAddAdminUser()) {
            // Save pending invite to complete after upgrade
            setPendingRoleChange({
                type: 'invite',
                data: { ...inviteData }
            });

            // Show payment plans
            setShowPaymentPlans(true);
            return;
        }

        // In a real app, this would send an invitation email
        // For now, we'll just add the member directly
        dispatch(addWorkspaceMember({
            workspaceId: currentWorkspace.id,
            member: {
                userId: `user-${Date.now()}`, // Generate a unique ID
                name: inviteData.name,
                email: inviteData.email,
                role: inviteData.role
            }
        }));

        // Show success message
        toast.success(`Invitation sent to ${inviteData.email}`);

        // Reset form
        setInviteData({
            email: '',
            name: '',
            role: ROLES.MEMBER
        });
        setShowInviteForm(false);
    };

    const handleCancelInvite = () => {
        setShowInviteForm(false);
        setInviteData({
            email: '',
            name: '',
            role: ROLES.MEMBER
        });
    };

    const handleStartEditRole = (member) => {
        setEditingMemberId(member.userId);
        setEditRoleData({
            role: member.role
        });
    };

    const handleSaveRole = (userId) => {
        // Check if we're changing to an admin role and if we've reached the limit
        const member = currentWorkspace.members.find(m => m.userId === userId);
        const currentRole = member?.role || '';
        const newRole = editRoleData.role;

        // If changing from non-admin to admin role, check limits
        if (
            (currentRole !== ROLES.ADMIN && currentRole !== ROLES.OWNER) &&
            (newRole === ROLES.ADMIN || newRole === ROLES.OWNER) &&
            !canAddAdminUser()
        ) {
            // Save pending role change to complete after upgrade
            setPendingRoleChange({
                type: 'update',
                data: {
                    userId,
                    role: newRole
                }
            });

            // Show payment plans
            setShowPaymentPlans(true);
            setEditingMemberId(null);
            return;
        }

        dispatch(updateWorkspaceMember({
            workspaceId: currentWorkspace.id,
            userId,
            updates: {
                role: editRoleData.role
            }
        }));

        setEditingMemberId(null);
    };

    const handleCancelEditRole = () => {
        setEditingMemberId(null);
    };

    const handleRemoveMember = (userId) => {
        if (window.confirm('Are you sure you want to remove this member from the workspace?')) {
            dispatch(removeWorkspaceMember({
                workspaceId: currentWorkspace.id,
                userId
            }));
        }
    };

    const handleSelectRole = (role) => {
        setSelectedRole(selectedRole === role ? null : role);
    };

    const handleSelectPlan = (plan) => {
        // In a real app, this would handle payment processing
        // For demo purposes, we'll just show a message
        console.log(`Selected plan: ${plan.name} (${plan.billingCycle})`);
        toast.success(`Upgraded to ${plan.name} plan! This is a demo - no payment was processed.`);

        // Close the payment plans modal
        setShowPaymentPlans(false);

        // Complete the pending role change
        if (pendingRoleChange) {
            if (pendingRoleChange.type === 'invite') {
                // Complete the pending invitation
                dispatch(addWorkspaceMember({
                    workspaceId: currentWorkspace.id,
                    member: {
                        userId: `user-${Date.now()}`,
                        name: pendingRoleChange.data.name,
                        email: pendingRoleChange.data.email,
                        role: pendingRoleChange.data.role
                    }
                }));

                toast.success(`Invitation sent to ${pendingRoleChange.data.email}`);
                setShowInviteForm(false);
            } else if (pendingRoleChange.type === 'update') {
                // Complete the pending role update
                dispatch(updateWorkspaceMember({
                    workspaceId: currentWorkspace.id,
                    userId: pendingRoleChange.data.userId,
                    updates: {
                        role: pendingRoleChange.data.role
                    }
                }));
            }

            // Clear the pending role change
            setPendingRoleChange(null);
        }
    };

    const handleClosePaymentPlans = () => {
        setShowPaymentPlans(false);
        setPendingRoleChange(null);
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Workspace Members</h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Manage team members and their access permissions
                    </p>
                </div>

                {canManageMembers() && (
                    <button
                        onClick={() => setShowInviteForm(true)}
                        className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md flex items-center gap-2 hover:bg-[#9277FF] transition-colors"
                    >
                        <BiUserPlus size={18} />
                        <span>Invite Member</span>
                    </button>
                )}
            </div>

            {/* Subscription limits alert */}
            <div className="mb-6 p-6 bg-gradient-to-r from-[#7C5DFA]/5 to-[#7C5DFA]/10 border border-[#7C5DFA]/20 rounded-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h3 className="text-base font-medium text-[#7C5DFA] flex items-center">
                            {currentPlan === 'FREE' ? (
                                <>
                                    <BiShieldQuarter size={20} className="mr-2" />
                                    Free Plan
                                </>
                            ) : currentPlan === 'PRO' ? (
                                <>
                                    <BiGroup size={20} className="mr-2" />
                                    Pro Plan
                                </>
                            ) : (
                                <>
                                    <BiBuildings size={20} className="mr-2" />
                                    Business Plan
                                </>
                            )}

                            {planDetails.isTrialActive && (
                                <span className="ml-2 text-xs bg-[#33D69F]/20 text-[#33D69F] px-2 py-0.5 rounded-full">
                                    Trial Active
                                </span>
                            )}
                        </h3>

                        <div className="mt-2 flex items-center gap-4">
                            <div>
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Admin Users
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="w-32 h-2.5 bg-[#7C5DFA]/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#7C5DFA]"
                                            style={{
                                                width: `${planDetails.maxAdmins === Infinity ? 100 : (countAdminUsers() / planDetails.maxAdmins) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">
                                        {countAdminUsers()} / {planDetails.maxAdmins === Infinity ? '∞' : planDetails.maxAdmins}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Workspaces
                                </div>
                                <div className="text-sm font-medium mt-1">
                                    {planDetails.maxWorkspaces === Infinity ? 'Unlimited' : `Up to ${planDetails.maxWorkspaces}`}
                                </div>
                            </div>
                        </div>

                        {planDetails.isTrialActive && planDetails.trialEndsAt && (
                            <div className="mt-2 text-sm text-[#EC5757]">
                                Trial ends in {Math.ceil((new Date(planDetails.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))} days
                            </div>
                        )}
                    </div>

                    {planDetails.maxAdmins !== Infinity && (
                        <button
                            onClick={() => setShowPaymentPlans(true)}
                            className="mt-4 md:mt-0 px-4 py-2 bg-[#7C5DFA] text-white rounded-md hover:bg-[#9277FF] transition-colors flex items-center"
                        >
                            Upgrade Plan
                        </button>
                    )}
                </div>
            </div>

            {/* Roles overview */}
            <div className="mb-8">
                <h3 className="text-md font-bold text-light-text dark:text-dark-text mb-4">Roles & Permissions</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Object.values(ROLES).map(role => (
                        <div
                            key={role}
                            onClick={() => handleSelectRole(role)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${selectedRole === role
                                ? 'border-[#7C5DFA] ring-2 ring-[#7C5DFA]/20'
                                : 'border-light-border dark:border-dark-border hover:border-[#7C5DFA]/50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className={`flex items-center gap-2 ${ROLE_INFO[role].color}`}>
                                    {ROLE_INFO[role].icon}
                                    <span className="font-medium">{ROLE_INFO[role].label}</span>
                                </div>
                                <span className={`${ROLE_INFO[role].bgColor} ${ROLE_INFO[role].color} text-xs px-2 py-0.5 rounded-full`}>
                                    {Object.values(currentWorkspace?.members || []).filter(m => m.role === role).length} user(s)
                                </span>
                            </div>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                {ROLE_INFO[role].description}
                            </p>

                            <button
                                className="w-full mt-3 text-xs flex items-center justify-center gap-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA]"
                            >
                                <span>View permissions</span>
                                <BiChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${selectedRole === role ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Permission details for selected role */}
                {selectedRole && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg mb-6"
                    >
                        <h4 className="text-sm font-medium text-light-text dark:text-dark-text mb-4">
                            {ROLE_INFO[selectedRole].label} Permissions
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.values(PERMISSION_CATEGORIES).map(category => (
                                <div key={category.title} className="space-y-2">
                                    <h5 className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                        {category.icon}
                                        {category.title}
                                    </h5>

                                    <ul className="space-y-1.5">
                                        {category.permissions.map(permission => {
                                            const hasPermission = ROLE_PERMISSIONS[selectedRole].includes(permission);

                                            return (
                                                <li key={permission} className="flex items-center gap-2 text-sm">
                                                    {hasPermission ? (
                                                        <BiCheck size={18} className="text-[#33D69F]" />
                                                    ) : (
                                                        <BiX size={18} className="text-[#EC5757]" />
                                                    )}
                                                    <span className={hasPermission
                                                        ? 'text-light-text dark:text-dark-text'
                                                        : 'text-light-text-secondary dark:text-dark-text-secondary line-through opacity-70'
                                                    }>
                                                        {formatPermissionName(permission)}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Invite form */}
            {showInviteForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-5 border border-light-border dark:border-dark-border rounded-lg"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-bold text-light-text dark:text-dark-text">Invite New Member</h3>
                        <button
                            onClick={handleCancelInvite}
                            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757]"
                        >
                            <BiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleInviteMember} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={inviteData.name}
                                    onChange={handleInviteChange}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={inviteData.email}
                                    onChange={handleInviteChange}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                                Role
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(ROLES).map(([key, value]) => (
                                    <div
                                        key={key}
                                        onClick={() => setInviteData({ ...inviteData, role: value })}
                                        className={`p-3 rounded-md border cursor-pointer transition-all duration-200 ${inviteData.role === value
                                            ? `border-[#7C5DFA] ${ROLE_INFO[value].bgColor}`
                                            : 'border-light-border dark:border-dark-border hover:border-[#7C5DFA]/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {ROLE_INFO[value].icon}
                                            <span className={`font-medium ${inviteData.role === value ? ROLE_INFO[value].color : ''}`}>
                                                {ROLE_INFO[value].label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                {ROLE_INFO[inviteData.role].description}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={handleCancelInvite}
                                className="px-4 py-2 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#7C5DFA] text-white rounded-md"
                            >
                                Send Invitation
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Members list */}
            <div>
                <h3 className="text-md font-bold text-light-text dark:text-dark-text mb-4">Current Members</h3>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-light-border dark:border-dark-border">
                                <th className="text-left px-4 py-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Name</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Email</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Role</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Joined</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentWorkspace?.members?.map((member) => (
                                <tr key={member.userId} className="border-b border-light-border/30 dark:border-dark-border/30 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
                                    <td className="px-4 py-3 text-light-text dark:text-dark-text">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ROLE_INFO[member.role].bgColor}`}>
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{member.name}</span>
                                            {member.userId === currentUser.id && (
                                                <span className="text-xs bg-[#7C5DFA]/10 text-[#7C5DFA] px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        {member.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingMemberId === member.userId ? (
                                            <select
                                                name="role"
                                                value={editRoleData.role}
                                                onChange={handleEditRoleChange}
                                                className="w-full px-2 py-1 border border-light-border dark:border-dark-border rounded-md bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text"
                                                disabled={isOnlyOwner(member.userId)}
                                            >
                                                {Object.entries(ROLES).map(([key, value]) => (
                                                    <option key={key} value={value} disabled={isOnlyOwner(member.userId) && value !== ROLES.OWNER}>
                                                        {ROLE_INFO[value].label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${ROLE_INFO[member.role].bgColor} ${ROLE_INFO[member.role].color}`}>
                                                {ROLE_INFO[member.role].icon}
                                                <span>{ROLE_INFO[member.role].label}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {new Date(member.joinedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {canManageMembers() && (
                                            <div className="flex items-center justify-end gap-1">
                                                {editingMemberId === member.userId ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveRole(member.userId)}
                                                            className="p-1.5 text-[#33D69F] hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors"
                                                            title="Save role"
                                                        >
                                                            <BiCheck size={18} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEditRole}
                                                            className="p-1.5 text-[#EC5757] hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <BiX size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleStartEditRole(member)}
                                                            className="p-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors"
                                                            title="Edit role"
                                                            disabled={member.userId === currentUser.id}
                                                        >
                                                            <BiEdit size={18} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleRemoveMember(member.userId)}
                                                            className="p-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#EC5757] hover:bg-light-bg dark:hover:bg-dark-bg rounded-full transition-colors"
                                                            title="Remove member"
                                                            disabled={member.userId === currentUser.id || isOnlyOwner(member.userId)}
                                                        >
                                                            <BiTrash size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!currentWorkspace?.members || currentWorkspace?.members.length === 0) && (
                    <div className="text-center py-12">
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            No members in this workspace yet.
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Plans Modal */}
            <PaymentPlansModal
                isOpen={showPaymentPlans}
                onClose={handleClosePaymentPlans}
                onSelectPlan={handleSelectPlan}
            />
        </div>
    );
};

export default WorkspaceMembers;