import React from "react";
import { BiChevronRight } from "react-icons/bi";
import StatusBadge from "./StatusBadge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const InvoiceItem = ({ invoice }) => {
    const navigate = useNavigate();
    return (
        <div 
            className="max-w-3xl bg-white p-6 rounded-lg shadow-sm transition duration-300 cursor-pointer hover:shadow-md"
            onClick={() => navigate(`/invoice/${invoice.id}`)}
        >
            {/* Desktop Layout */}
            <div className="hidden md:flex md:flex-row md:justify-between md:items-center">
                <h1 className="text-[15px] font-bold">#{invoice.id}</h1>
                <p className="text-[13px] text-[#888EB0]">Due {format(new Date(invoice.paymentDue), 'dd MMM yyyy')}</p>
                <p className="text-[14px] text-[#888EB0]">{invoice.clientName || 'No Client'}</p>
                <h1 className="text-[15px] font-bold">£ {(invoice.total || 0).toFixed(2)}</h1>
                <div className="flex items-center gap-2">
                    <StatusBadge status={invoice.status} />
                    <BiChevronRight size={24} className="text-[#7C5DFA]" />
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-[15px] font-bold">#{invoice.id}</h1>
                    <p className="text-[14px] text-[#888EB0]">{invoice.clientName || 'No Client'}</p>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                        <p className="text-[13px] text-[#888EB0]">
                            Due {format(new Date(invoice.paymentDue), 'dd MMM yyyy')}
                        </p>
                        <h1 className="text-[15px] font-bold">
                            £ {(invoice.total || 0).toFixed(2)}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={invoice.status} />
                        <BiChevronRight size={24} className="text-[#7C5DFA]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceItem;
