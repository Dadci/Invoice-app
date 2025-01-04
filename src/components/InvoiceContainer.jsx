import React from "react";
import { useSelector } from "react-redux";
import InvoiceItem from "./InvoiceItem";

const InvoiceContainer = () => {
  const invoices = useSelector(state => state.invoices.invoices)
  const filter = useSelector(state => state.invoices.filter)

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true
    return invoice.status === filter
  })

  return (
    <div className="px-6 md:px-0 md:max-w-3xl space-y-4">
      {filteredInvoices.map(invoice => (
        <InvoiceItem key={invoice.id} invoice={invoice} />
      ))}
    </div>
  )
}

export default InvoiceContainer;
