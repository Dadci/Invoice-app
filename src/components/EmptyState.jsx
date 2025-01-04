import React from 'react'
import empty from '../assets/empty-state.png'

function EmptyState() {
    return (
        <div className='flex flex-col items-center justify-center space-y-4 mt-24'>
            <img src={empty} alt="empty state" width={240} className='mb-8' />
            <h2 className=' text-[#0C0E16] font-bold text-2xl'>There is nothing here</h2>
            <p className='text-[#888EB0] text-sm text-center'>Create a new invoice by clicking the <span className='text-[#7C5DFA] font-semibold'>New Invoice</span> button and get started</p>

        </div>
    )
}

export default EmptyState