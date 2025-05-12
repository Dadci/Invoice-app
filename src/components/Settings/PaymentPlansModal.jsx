import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiX } from 'react-icons/bi';
import PaymentPlans from './PaymentPlans';

const PaymentPlansModal = ({ isOpen, onClose, onSelectPlan }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 w-full max-w-7xl overflow-y-auto max-h-[90vh] rounded-xl bg-white dark:bg-dark-card shadow-2xl"
                    >
                        <div className="sticky top-0 z-20 flex justify-end p-4 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-light-border dark:border-dark-border">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg transition-colors hover:text-[#EC5757]"
                                aria-label="Close modal"
                            >
                                <BiX size={24} />
                            </button>
                        </div>

                        <div className="px-8 py-8">
                            <PaymentPlans onClose={onClose} onSelectPlan={onSelectPlan} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentPlansModal; 