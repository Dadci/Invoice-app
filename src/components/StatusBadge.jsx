import React from 'react'
import { useSelector } from 'react-redux'

const getStatusStyles = (theme, status) => {
    const baseStyles = {
        paid: {
            lightBackground: '#33D69F15',
            darkBackground: '#33D69F30',
            dotColor: '#33D69F',
            textColor: '#33D69F',
            borderColor: theme === 'dark' ? '#33D69F40' : 'transparent'
        },
        pending: {
            lightBackground: '#FF8F0015',
            darkBackground: '#FF8F0030',
            dotColor: '#FF8F00',
            textColor: '#FF8F00',
            borderColor: theme === 'dark' ? '#FF8F0040' : 'transparent'
        },
        sent: {
            lightBackground: '#7C5DFA15',
            darkBackground: '#7C5DFA30',
            dotColor: '#7C5DFA',
            textColor: '#7C5DFA',
            borderColor: theme === 'dark' ? '#7C5DFA40' : 'transparent'
        },
        draft: {
            lightBackground: '#373B5315',
            darkBackground: '#DFE3FA20',
            dotColor: theme === 'dark' ? '#DFE3FA' : '#373B53',
            textColor: theme === 'dark' ? '#DFE3FA' : '#373B53',
            borderColor: theme === 'dark' ? '#DFE3FA40' : 'transparent'
        }
    };

    const statusKey = status.toLowerCase();
    return baseStyles[statusKey] || baseStyles.draft;
}

const StatusBadge = ({ status, size = 'default' }) => {
    const { theme } = useSelector(state => state.theme);
    const styles = getStatusStyles(theme, status);

    // Size variants
    const sizeClasses = {
        small: "px-3 py-1",
        default: "px-6 py-3"
    };

    const dotSizeClasses = {
        small: "w-1.5 h-1.5",
        default: "w-2 h-2"
    };

    const textSizeClasses = {
        small: "text-xs",
        default: "text-[15px]"
    };

    return (
        <div
            className={`flex items-center gap-2 rounded-md justify-center flex-shrink-0 transition-all duration-200 ${sizeClasses[size]}`}
            style={{
                backgroundColor: theme === 'dark' ? styles.darkBackground : styles.lightBackground,
                border: `1px solid ${styles.borderColor}`
            }}
        >
            <span
                className={`rounded-full animate-pulse ${dotSizeClasses[size]}`}
                style={{
                    backgroundColor: styles.dotColor,
                    boxShadow: theme === 'dark' ? `0 0 4px ${styles.dotColor}` : 'none'
                }}
            />
            <p
                className={`font-bold leading-none capitalize ${textSizeClasses[size]}`}
                style={{ color: styles.textColor }}
            >
                {status}
            </p>
        </div>
    )
}

export default StatusBadge