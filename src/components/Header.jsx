import React from "react";
import { BiChevronDown } from "react-icons/bi";
import { BiPlus } from "react-icons/bi";
import { useDispatch } from 'react-redux'
import { toggleModal } from '../store/modalSlice'
import { useSelector } from "react-redux";
import Filter from "./Filter";

const Header = () => {
    const dispatch = useDispatch()
    const invoices = useSelector(state => state.invoices.invoices)

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4  sm:p-6 md:p-0 sm:mt-24 ">
            <div className="flex flex-col w-full sm:w-auto ">
                <h1 className="text-xl sm:text-2xl md:text-4xl text-[#0C0E16] font-bold">Invoices</h1>
                <p className="text-xs sm:text-sm text-[#888EB0] font-medium mt-1">
                     {invoices.length} total invoices
                </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                <Filter />
                <button
                    onClick={() => dispatch(toggleModal())}
                    className="flex items-center gap-2 px-2 py-2 sm:pr-4 bg-[#7C5DFA] text-white rounded-full text-sm font-bold group whitespace-nowrap"
                >
                    <span className="text-[#7C5DFA] p-2 bg-white rounded-full group-hover:animate-spin">
                        <BiPlus size={18} sm:size={20} />
                    </span>
                    <span className="text-xs sm:text-sm">New </span>
                </button>
            </div>
        </div>
    );
};

export default Header;
