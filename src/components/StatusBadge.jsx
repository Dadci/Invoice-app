import React from 'react'

const statusStyles = {
    paid: {
        background: '#33D69F10',
        dotColor: '#33D69F',
        textColor: '#33D69F'
    },
    pending: {
        background: '#FF8F0010',
        dotColor: '#FF8F00',
        textColor: '#FF8F00'
    },
    draft: {
        background: '#373B5310',
        dotColor: '#373B53',
        textColor: '#373B53'
    }
}

const StatusBadge = ({status}) => {
    const style = statusStyles[status.toLowerCase()]

    return (
        <div
            className="flex items-center gap-2 px-6 py-3 rounded-md justify-center flex-shrink-0"
            style={{ backgroundColor: style.background }}
        >
            <span
                className="p-1 w-2 h-2 rounded-full animate-pulse mt-[-1px]"
                style={{ backgroundColor: style.dotColor }}
            />
            <p
                className="text-[15px] font-bold leading-none capitalize"
                style={{ color: style.textColor }}
            >
                {status}
            </p>
        </div>
    )
}

export default StatusBadge