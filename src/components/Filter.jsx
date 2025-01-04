import React, { useState, useRef, useEffect } from 'react'
import { BiChevronDown } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'
import { setFilter } from '../store/invoicesSlice'

const Filter = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const dispatch = useDispatch()
    const currentFilter = useSelector(state => state.invoices.filter)
    const filters = ['all', 'paid', 'pending', 'draft']

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleKeyDown = (e, filter) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            dispatch(setFilter(filter))
            setIsOpen(false)
        }
        if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                aria-haspopup="true"
                aria-expanded={isOpen}
                className="flex items-center gap-3 px-6 py-3 rounded-full hover:bg-[#DFE3FA]/20 transition-all duration-200" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <p className="text-[#0C0E16] text-base font-bold whitespace-nowrap">
                    Filter by status {currentFilter !== 'all' && (
                        <span className="text-[#7C5DFA] ml-1">({currentFilter})</span>
                    )}
                </p>
                <BiChevronDown 
                    size={20} 
                    className={`text-[#7C5DFA] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            <div 
                className={`absolute top-full right-0 mt-4 bg-white rounded-lg shadow-[0_10px_20px_rgba(72,84,159,0.25)] 
                    p-6 min-w-[192px] z-50 transform transition-all duration-200 origin-top
                    ${isOpen 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
            >
                {filters.map(filter => (
                    <div 
                        key={filter}
                        tabIndex={0}
                        role="menuitem"
                        className="flex items-center gap-4 py-2 px-1 cursor-pointer group
                            hover:bg-[#F8F8FB] rounded-lg transition-all duration-200 -mx-1"
                        onClick={() => {
                            dispatch(setFilter(filter))
                            setIsOpen(false)
                        }}
                        onKeyDown={(e) => handleKeyDown(e, filter)}
                    >
                        <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center
                            transition-all duration-200
                            ${currentFilter === filter 
                                ? 'border-[#7C5DFA] bg-[#7C5DFA] group-hover:bg-[#9277FF]' 
                                : 'border-[#DFE3FA] group-hover:border-[#7C5DFA]'
                            }`}
                        >
                            {currentFilter === filter && (
                                <svg width="11" height="9" xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                        d="M1.5 4.5l2.5 2.5L9.5 1.5" 
                                        stroke="#FFF" 
                                        strokeWidth="2" 
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </div>
                        <span className={`capitalize text-sm font-bold transition-colors duration-200
                            ${currentFilter === filter ? 'text-[#7C5DFA]' : 'text-[#0C0E16]'}
                            group-hover:text-[#7C5DFA]`}
                        >
                            {filter}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Filter