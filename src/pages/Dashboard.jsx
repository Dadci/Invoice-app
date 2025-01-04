import React from "react";
import Header from "../components/Header";
import InvoiceContainer from "../components/InvoiceContainer";
import AddInvoiceModal from '../components/AddInvoiceModal'
import EmptyState from "../components/EmptyState";
import { useSelector } from "react-redux";


const Dashboard = () => {
  const invoices = useSelector(state => state.invoices.invoices)
  const { editingInvoice } = useSelector(state => state.modal)

  return <div className="max-w-3xl mx-auto flex flex-col gap-16">
    <Header />
    <div className=" ">

      {invoices.length === 0 ? <EmptyState /> : <>

        <InvoiceContainer />
      </>
      }
    </div>

    <AddInvoiceModal />


  </div>;
};

export default Dashboard;
