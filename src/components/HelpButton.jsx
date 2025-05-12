import React from 'react';
import { BiHelpCircle } from 'react-icons/bi';
import { motion } from 'framer-motion';

const HelpButton = ({ onClick }) => {
    return (
        <motion.button
            className="fixed right-6 bottom-24 bg-[#7C5DFA] text-white p-3 rounded-full shadow-lg z-30 hover:bg-[#9277FF] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
        >
            <BiHelpCircle size={24} />
        </motion.button>
    );
};

export default HelpButton; 