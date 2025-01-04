import { BiChevronLeft } from "react-icons/bi";
import InvoiceActionBar from "../components/InvoiceActionBar";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import AddInvoiceModal from "../components/AddInvoiceModal";

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const invoice = useSelector(state =>
    state.invoices.invoices.find(invoice => invoice.id === id)
  );

  if (!invoice) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 p-6 mt-24 mb-24 md:mb-0 md:mt-14">
      <div className="flex items-center gap-2 justify-start cursor-pointer" onClick={() => navigate('/')} >
        <BiChevronLeft size={20} className="text-[#7C5DFA]" />
        <p className="text-[#0C0E16] text-base font-bold leading-none">Go back</p>
      </div>
      <InvoiceActionBar invoice={invoice} />
      <div className='bg-white p-8 md:p-8 rounded-lg shadow-sm flex flex-col'>
        <div className='flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0'>
          <div className="flex flex-col gap-1">
            <h1 className="text-[15px] font-bold text-[#0C0E16]">
              #{invoice.id}
            </h1>
            <p className="text-[13px] font-medium text-[#888EB0]">
              {invoice.projectDescription}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.senderAddress?.street}</p>
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.senderAddress?.city}</p>
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.senderAddress?.postCode}</p>
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.senderAddress?.country}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-[13px] font-medium text-[#888EB0]">Invoice Date</h2>
            <p className="text-[15px] font-bold text-[#0C0E16]">
              {format(new Date(invoice.createdAt), 'dd MMM yyyy')}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[13px] font-medium text-[#888EB0]">Bill To</h2>
            <p className="text-[15px] font-bold text-[#0C0E16]">{invoice.clientName}</p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-[13px] font-medium text-[#888EB0]">Send To</h2>
            <p className="text-[15px] font-bold text-[#0C0E16]">{invoice.clientEmail}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-[13px] font-medium text-[#888EB0]">Payment Due</h2>
            <p className="text-[15px] font-bold text-[#0C0E16]">
              {format(new Date(invoice.paymentDue), 'dd MMM yyyy')}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.clientAddress?.street}</p>
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.clientAddress?.city}</p>
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.clientAddress?.postCode}</p>
            <p className="text-[13px] font-medium text-[#888EB0]">{invoice.clientAddress?.country}</p>
          </div>
        </div>
        
        <div className="mt-8 bg-[#F9FAFE] rounded-lg">
          <div className="px-8 pt-8 pb-4">
            <table className="w-full">
              <thead>
                <tr className="text-[13px] text-[#888EB0]">
                  <th className="text-left font-medium pb-4">Item Name</th>
                  <th className="text-center font-medium pb-4">QTY.</th>
                  <th className="text-right font-medium pb-4">Price</th>
                  <th className="text-right font-medium pb-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="text-[15px] text-[#0C0E16] font-bold pb-4">
                    <td className="">{item.name}</td>
                    <td className="text-center text-[#888EB0]">{item.quantity}</td>
                    <td className="text-right text-[#888EB0]">£ {item.price.toFixed(2)}</td>
                    <td className="text-right">£ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-row justify-between items-center w-full px-8 py-6 bg-[#373B53] rounded-b-lg">
            <p className="text-[15px] text-white font-normal">Amount Due</p>
            <p className="text-[15px] text-white font-bold">£ {invoice.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <AddInvoiceModal />
    </div>
  );
};

export default InvoiceDetails;
