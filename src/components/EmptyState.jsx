import React from 'react'
import empty from '../assets/empty-state.png'
import { useSelector } from 'react-redux';

function EmptyState() {
    const { theme } = useSelector(state => state.theme);

    return (
        <div className='flex flex-col items-center justify-center space-y-4 mt-24'>
            <div className="relative">
                <img
                    src={empty}
                    alt="empty state"
                    width={240}
                    className='mb-8 transition-all duration-300 hover:scale-105'
                    style={{
                        filter: theme === 'dark' ? 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))' : 'none'
                    }}
                />
                {theme === 'dark' && (
                    <div className="absolute inset-0 bg-[#7C5DFA] opacity-5 rounded-full blur-xl -z-10"></div>
                )}
            </div>
            <h2 className='text-light-text dark:text-dark-text font-bold text-2xl transition-colors duration-200'>There is nothing here</h2>
            <p className='text-light-text-secondary dark:text-dark-text-secondary text-sm text-center transition-colors duration-200 max-w-md'>
                Create a new invoice by clicking the <span className='text-[#7C5DFA] font-semibold hover:text-[#9277FF] transition-colors duration-200'>New Invoice</span> button and get started
            </p>
        </div>
    )
}

export default EmptyState