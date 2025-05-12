import { createSlice } from '@reduxjs/toolkit';

// Plan definitions with user limits
export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        maxAdmins: 1,
        maxMembers: Infinity, // Unlimited viewers
        maxWorkspaces: 3
    },
    PRO: {
        name: 'Pro',
        maxAdmins: 3,
        maxMembers: Infinity,
        maxWorkspaces: 10
    },
    BUSINESS: {
        name: 'Business',
        maxAdmins: Infinity, // Unlimited admins
        maxMembers: Infinity,
        maxWorkspaces: Infinity
    }
};

// Load subscription from localStorage if available
const loadSubscriptionFromStorage = () => {
    try {
        const savedSubscription = localStorage.getItem('invoiceAppSubscription');
        const parsedSubscription = savedSubscription ? JSON.parse(savedSubscription) : null;

        return parsedSubscription;
    } catch (error) {
        console.error('Error loading subscription from localStorage:', error);
        return null;
    }
};

const savedState = loadSubscriptionFromStorage();

const defaultInitialState = {
    currentPlan: 'FREE',
    planDetails: SUBSCRIPTION_PLANS.FREE,
    paymentDetails: null,
    subscriptionHistory: [],
    isTrialActive: false,
    trialEndsAt: null,
    error: null
};

// Use saved subscription or default if none exists
const initialState = savedState || defaultInitialState;

// Helper to save state to localStorage
const saveSubscriptionToStorage = (state) => {
    try {
        localStorage.setItem('invoiceAppSubscription', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving subscription to localStorage:', error);
    }
};

const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        // Upgrade to a new plan
        upgradePlan: (state, action) => {
            const { planId, paymentDetails } = action.payload;
            const planKey = planId.toUpperCase();

            if (SUBSCRIPTION_PLANS[planKey]) {
                state.currentPlan = planKey;
                state.planDetails = SUBSCRIPTION_PLANS[planKey];
                state.paymentDetails = paymentDetails || null;

                // Add to subscription history
                state.subscriptionHistory.push({
                    plan: planKey,
                    startedAt: new Date().toISOString(),
                    paymentDetails: paymentDetails || null
                });

                // Reset trial info if upgrading
                state.isTrialActive = false;
                state.trialEndsAt = null;

                saveSubscriptionToStorage(state);
            } else {
                state.error = `Invalid plan: ${planId}`;
            }
        },

        // Start a trial of a premium plan
        startTrial: (state, action) => {
            const { planId, durationDays = 14 } = action.payload;
            const planKey = planId.toUpperCase();

            if (SUBSCRIPTION_PLANS[planKey] && planKey !== 'FREE') {
                state.currentPlan = planKey;
                state.planDetails = SUBSCRIPTION_PLANS[planKey];
                state.isTrialActive = true;

                // Set trial end date
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + durationDays);
                state.trialEndsAt = trialEnd.toISOString();

                saveSubscriptionToStorage(state);
            } else {
                state.error = `Invalid trial plan: ${planId}`;
            }
        },

        // Cancel subscription and revert to free plan
        cancelSubscription: (state) => {
            state.currentPlan = 'FREE';
            state.planDetails = SUBSCRIPTION_PLANS.FREE;
            state.paymentDetails = null;
            state.isTrialActive = false;
            state.trialEndsAt = null;

            saveSubscriptionToStorage(state);
        },

        // Check if user has specific subscription capability
        checkSubscriptionCapability: (state, action) => {
            const { capability, count } = action.payload;

            // No capability check needed for free features
            if (!capability) return true;

            // Check for admin user limit
            if (capability === 'adminUsers') {
                return count <= state.planDetails.maxAdmins;
            }

            // Check for workspaces limit
            if (capability === 'workspaces') {
                return count <= state.planDetails.maxWorkspaces;
            }

            // Check for total members limit
            if (capability === 'members') {
                return count <= state.planDetails.maxMembers;
            }

            return true;
        }
    }
});

export const {
    upgradePlan,
    startTrial,
    cancelSubscription,
    checkSubscriptionCapability
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer; 