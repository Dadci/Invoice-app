import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changeCurrency } from '../store/settingsSlice';
import { BiChevronDown, BiCheck } from 'react-icons/bi';
import { CURRENCY_FLAGS, DEFAULT_CURRENCY, AVAILABLE_CURRENCIES } from '../utils/constants';

// Function to get currency flags using the constants
const getCurrencyFlag = (code) => {
    return CURRENCY_FLAGS[code] || '🌐';
};

const CurrencySelector = ({ showLabel = true, dark = false, compact = false }) => {
    const dispatch = useDispatch();
    const { currentWorkspace } = useSelector(state => state.workspaces || { currentWorkspace: null });
    const workspaceId = currentWorkspace?.id || 'default';
    const { theme } = useSelector(state => state.theme);
    const isDarkMode = theme === 'dark' || dark;

    const { currency, availableCurrencies } = useSelector(state => state.settings || {
        currency: DEFAULT_CURRENCY,
        availableCurrencies: AVAILABLE_CURRENCIES
    });

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCurrencyChange = (newCurrency) => {
        dispatch(changeCurrency({
            data: newCurrency,
            workspaceId
        }));
        setIsOpen(false);
    };

    const baseClasses = isDarkMode
        ? "bg-dark-card border-dark-border text-dark-text"
        : "bg-white border-light-border text-light-text";

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`flex items-center justify-center ${compact ? 'gap-1' : 'gap-2'} cursor-pointer border ${isOpen ? 'border-[#7C5DFA]' : ''} ${baseClasses} ${compact ? 'py-2 px-4 rounded-full' : 'py-2 px-3 rounded-full'} hover:border-[#7C5DFA] transition-all duration-200`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`${compact ? 'text-sm' : 'text-base'}`}>
                    {getCurrencyFlag(currency.code)}
                </span>
                {showLabel && !compact && (
                    <span className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Currency:</span>
                )}
                <span className="text-base font-bold">{currency.symbol}</span>
                <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>{currency.code}</span>
                <BiChevronDown className={`${isOpen ? 'rotate-180' : ''} transition-transform duration-200 ${compact ? 'w-3 h-3' : 'w-4 h-4'} text-[#7C5DFA]`} />
            </div>

            {isOpen && (
                <div className={`absolute right-0 mt-1 z-40 w-52 shadow-lg rounded-md overflow-hidden ${isDarkMode ? 'bg-dark-card border border-dark-border' : 'bg-white border border-light-border'}`}>
                    <div className="p-1">
                        {availableCurrencies.map(curr => (
                            <div
                                key={curr.code}
                                onClick={() => handleCurrencyChange(curr)}
                                className={`flex items-center justify-between p-2 hover:bg-light-bg dark:hover:bg-dark-bg/50 rounded-md cursor-pointer transition-colors ${currency.code === curr.code ? 'bg-[#7C5DFA]/10' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getCurrencyFlag(curr.code)}</span>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-sm">{curr.symbol}</span>
                                            <span className="text-xs font-medium">{curr.code}</span>
                                        </div>
                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{curr.name}</span>
                                    </div>
                                </div>
                                {currency.code === curr.code && (
                                    <BiCheck size={16} className="text-[#7C5DFA]" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencySelector; 