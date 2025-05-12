import React, { useState } from 'react';
import { BiCheck, BiX, BiChevronRight, BiShieldQuarter, BiGroup, BiBuildings, BiCreditCard, BiTime, BiSupport, BiLock } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { fadeIn } from '../../utils/animations';
import { useSelector, useDispatch } from 'react-redux';
import { upgradePlan, startTrial } from '../../store/subscriptionSlice';

const plans = [
    {
        id: 'free',
        name: 'Free',
        badge: null,
        price: 0,
        description: 'For individuals or small teams',
        features: [
            'Up to 1 admin user',
            'Unlimited members with viewer access',
            'Unlimited invoices',
            'Unlimited clients',
            'Basic templates'
        ],
        limitations: [
            'No multi-admin access',
            'No priority support',
            'No custom branding'
        ],
        actionText: 'Current Plan',
        disabled: true,
        highlight: false,
        icon: <BiShieldQuarter size={24} className="text-[#7C5DFA]" />
    },
    {
        id: 'pro',
        name: 'Pro',
        badge: 'MOST POPULAR',
        price: 12,
        description: 'For growing businesses',
        features: [
            'Up to 3 admin users',
            'Unlimited members with customizable roles',
            'Advanced templates',
            'Priority email support',
            'Remove "Powered by" branding',
            'Custom invoice numbering',
            'Project time tracking'
        ],
        limitations: [],
        actionText: 'Upgrade Now',
        disabled: false,
        highlight: true,
        icon: <BiGroup size={24} className="text-[#7C5DFA]" />
    },
    {
        id: 'business',
        name: 'Business',
        badge: 'ENTERPRISE',
        price: 29,
        description: 'For larger organizations',
        features: [
            'Unlimited admin users',
            'Enterprise support',
            'Custom branding',
            'Advanced reporting',
            'API access',
            'Dedicated account manager',
            'SSO/SAML authentication',
            'Custom user permissions'
        ],
        limitations: [],
        actionText: 'Upgrade Now',
        disabled: false,
        highlight: false,
        icon: <BiBuildings size={24} className="text-[#7C5DFA]" />
    }
];

const PlanFeatureSection = ({ title, icon, children }) => (
    <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
            {icon}
            <h4 className="text-sm font-medium text-light-text dark:text-dark-text">{title}</h4>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const PaymentPlans = ({ onClose, onSelectPlan }) => {
    const dispatch = useDispatch();
    const { currentPlan } = useSelector(state => state.subscription);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const yearlyDiscount = 0.2; // 20% discount for yearly billing

    const handleSelectPlan = (plan) => {
        if (plan.disabled) return;

        // For demo purposes, we'll just process the upgrade immediately in the demo
        if (plan.id.toUpperCase() === currentPlan) {
            return; // No need to upgrade to the same plan
        }

        // Simulate payment flow
        const paymentDetails = {
            planId: plan.id,
            billingCycle,
            finalPrice: billingCycle === 'yearly'
                ? Math.round(plan.price * 12 * (1 - yearlyDiscount))
                : plan.price * (billingCycle === 'monthly' ? 1 : 12),
            purchaseDate: new Date().toISOString()
        };

        // Set plan as selected
        setSelectedPlan(plan.id);

        // Dispatch the upgrade action
        dispatch(upgradePlan({
            planId: plan.id,
            paymentDetails
        }));

        // Call the onSelectPlan callback for the parent component
        onSelectPlan({
            ...plan,
            billingCycle,
            finalPrice: paymentDetails.finalPrice
        });
    };

    const handleStartTrial = (plan) => {
        if (plan.disabled) return;

        // Dispatch start trial action
        dispatch(startTrial({
            planId: plan.id,
            durationDays: 14
        }));

        // Call the onSelectPlan callback with trial info
        onSelectPlan({
            ...plan,
            isTrial: true,
            trialDays: 14
        });
    };

    const getPlanDisabledState = (planId) => {
        return planId.toUpperCase() === currentPlan;
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-full mx-auto"
        >
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl font-bold text-center text-light-text dark:text-dark-text mb-3">
                    Upgrade Your Workspace
                </h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary text-center max-w-2xl text-lg">
                    Add more admin users and unlock powerful features to grow your business
                </p>

                <div className="flex items-center mt-8 bg-light-bg dark:bg-dark-bg rounded-lg p-1 shadow-sm">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${billingCycle === 'monthly'
                                ? 'bg-[#7C5DFA] text-white shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-white/10'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center ${billingCycle === 'yearly'
                                ? 'bg-[#7C5DFA] text-white shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-white/10'
                            }`}
                    >
                        Yearly
                        <span className="ml-2 text-xs font-medium bg-[#33D69F] text-white px-1.5 py-0.5 rounded-sm">
                            Save 20%
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    // Dynamically update the disabled state based on current plan
                    const isDisabled = getPlanDisabledState(plan.id);
                    const isCurrent = plan.id.toUpperCase() === currentPlan;

                    return (
                        <motion.div
                            key={plan.id}
                            whileHover={!isDisabled ? { y: -5 } : {}}
                            transition={{ duration: 0.2 }}
                            className={`border rounded-xl overflow-hidden transition-all ${plan.highlight
                                    ? 'border-[#7C5DFA] ring-2 ring-[#7C5DFA] ring-opacity-20 transform md:scale-105 relative shadow-xl'
                                    : isDisabled
                                        ? 'border-[#7C5DFA] border-opacity-50 bg-[#7C5DFA]/5'
                                        : 'border-light-border dark:border-dark-border hover:shadow-lg'
                                }`}
                        >
                            {plan.badge && (
                                <div className={`text-white text-xs font-medium py-1.5 text-center ${plan.highlight ? 'bg-[#7C5DFA]' : 'bg-[#33D69F]'}`}>
                                    {plan.badge}
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex items-center mb-3">
                                    {plan.icon}
                                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text ml-2">{plan.name}</h3>
                                    {isCurrent && (
                                        <span className="ml-2 text-xs bg-[#7C5DFA]/10 text-[#7C5DFA] px-2 py-0.5 rounded-full">Current</span>
                                    )}
                                </div>

                                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-5">
                                    {plan.description}
                                </p>

                                <div className="mb-6">
                                    <div className="flex items-end">
                                        <span className="text-4xl font-bold text-light-text dark:text-dark-text">
                                            ${billingCycle === 'yearly'
                                                ? Math.round(plan.price * (1 - yearlyDiscount))
                                                : plan.price}
                                        </span>
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary ml-2 mb-1.5">
                                            /mo{billingCycle === 'yearly' ? ' (billed yearly)' : ''}
                                        </span>
                                    </div>

                                    {billingCycle === 'yearly' && plan.price > 0 && (
                                        <div className="text-sm text-[#33D69F] mt-1 flex items-center">
                                            <BiCheck size={18} className="mr-1" />
                                            Save ${Math.round(plan.price * 12 * yearlyDiscount)} per year
                                        </div>
                                    )}
                                </div>

                                <PlanFeatureSection title="Users & Permissions" icon={<BiGroup size={16} className="text-[#7C5DFA]" />}>
                                    {plan.features.filter(f => f.includes('user') || f.includes('role') || f.includes('permission')).map((feature, index) => (
                                        <div key={index} className="flex items-start">
                                            <BiCheck className="text-[#33D69F] mt-0.5 mr-2 flex-shrink-0" size={18} />
                                            <span className="text-sm text-light-text dark:text-dark-text">{feature}</span>
                                        </div>
                                    ))}
                                </PlanFeatureSection>

                                <PlanFeatureSection title="Features & Capabilities" icon={<BiLock size={16} className="text-[#7C5DFA]" />}>
                                    {plan.features.filter(f => !f.includes('user') && !f.includes('role') && !f.includes('permission') && !f.includes('support')).map((feature, index) => (
                                        <div key={index} className="flex items-start">
                                            <BiCheck className="text-[#33D69F] mt-0.5 mr-2 flex-shrink-0" size={18} />
                                            <span className="text-sm text-light-text dark:text-dark-text">{feature}</span>
                                        </div>
                                    ))}
                                </PlanFeatureSection>

                                <PlanFeatureSection title="Support" icon={<BiSupport size={16} className="text-[#7C5DFA]" />}>
                                    {plan.features.filter(f => f.includes('support') || f.includes('manager')).map((feature, index) => (
                                        <div key={index} className="flex items-start">
                                            <BiCheck className="text-[#33D69F] mt-0.5 mr-2 flex-shrink-0" size={18} />
                                            <span className="text-sm text-light-text dark:text-dark-text">{feature}</span>
                                        </div>
                                    ))}
                                </PlanFeatureSection>

                                {plan.limitations.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {plan.limitations.map((limitation, index) => (
                                            <div key={index} className="flex items-start opacity-60">
                                                <BiX className="text-[#EC5757] mt-0.5 mr-2 flex-shrink-0" size={18} />
                                                <span className="text-sm text-light-text dark:text-dark-text">{limitation}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={isDisabled}
                                        className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-1 transition-colors ${isDisabled
                                                ? 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary cursor-default'
                                                : plan.highlight
                                                    ? 'bg-[#7C5DFA] text-white hover:bg-[#9277FF]'
                                                    : 'border border-[#7C5DFA] text-[#7C5DFA] hover:bg-[#7C5DFA]/10'
                                            }`}
                                    >
                                        {isCurrent ? 'Current Plan' : plan.actionText}
                                        {!isDisabled && <BiChevronRight size={18} />}
                                    </button>

                                    {!isDisabled && plan.price > 0 && (
                                        <button
                                            onClick={() => handleStartTrial(plan)}
                                            className="w-full py-2.5 border border-light-border dark:border-dark-border rounded-md text-sm text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg transition-colors flex items-center justify-center"
                                        >
                                            <BiTime size={16} className="mr-1.5" />
                                            Try free for 14 days
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="text-center mt-12 flex flex-col items-center">
                <div className="mb-6 flex items-center bg-[#33D69F]/10 py-3 px-6 rounded-lg">
                    <BiCreditCard size={20} className="text-[#33D69F] mr-2" />
                    <span className="text-sm text-light-text dark:text-dark-text">
                        All plans include secure payment processing and SSL protection
                    </span>
                </div>

                <button
                    onClick={onClose}
                    className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] transition-colors text-sm"
                >
                    Maybe later
                </button>
            </div>
        </motion.div>
    );
};

export default PaymentPlans; 