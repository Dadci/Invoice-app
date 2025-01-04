import { useSelector, useDispatch } from 'react-redux'
import { toggleModal } from '../store/modalSlice'
import { useState, useEffect } from 'react'
import { addInvoice, editInvoice } from '../store/invoicesSlice' // Add editInvoice import
import { BiTrash } from 'react-icons/bi'
import toast from 'react-hot-toast'

const AddInvoiceModal = () => {
    const { isOpen, editingInvoice } = useSelector(state => state.modal)
    const dispatch = useDispatch()
    const [formData, setFormData] = useState(editingInvoice || {
        senderAddress: { street: '', city: '', postCode: '', country: '' },
        clientName: '',
        clientEmail: '',
        clientAddress: { street: '', city: '', postCode: '', country: '' },
        invoiceDate: '',
        paymentTerms: 'Net 30 Days',
        projectDescription: '',
        items: [{ name: '', quantity: 1, price: 0, total: 0 }]
    })

    useEffect(() => {
        if (editingInvoice && isOpen) {
            setFormData(editingInvoice)
        } else if (!isOpen) {
            setFormData({
                senderAddress: { street: '', city: '', postCode: '', country: '' },
                clientName: '',
                clientEmail: '',
                clientAddress: { street: '', city: '', postCode: '', country: '' },
                invoiceDate: '',
                paymentTerms: 'Net 30 Days',
                projectDescription: '',
                items: [{ name: '', quantity: 1, price: 0, total: 0 }]
            })
        }
    }, [isOpen, editingInvoice])

    const handleSubmit = (isDraft = false) => {
        const total = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
        const daysToAdd = parseInt(formData.paymentTerms.split(' ')[1])
        const paymentDue = new Date(new Date().getTime() + (daysToAdd * 24 * 60 * 60 * 1000)).toISOString()

        try {
            if (editingInvoice) {
                dispatch(editInvoice({
                    ...formData,
                    id: editingInvoice.id,
                    total,
                    paymentDue,
                    status: isDraft ? 'draft' : 'pending'
                }))
                toast.success('Invoice updated successfully')
            } else {
                dispatch(addInvoice({
                    ...formData,
                    total,
                    isDraft,
                    createdAt: new Date().toISOString(),
                    paymentDue
                }))
                toast.success(isDraft ? 'Draft saved' : 'Invoice created successfully')
            }

            setFormData({
                senderAddress: { street: '', city: '', postCode: '', country: '' },
                clientName: '',
                clientEmail: '',
                clientAddress: { street: '', city: '', postCode: '', country: '' },
                invoiceDate: '',
                paymentTerms: 'Net 30 Days',
                projectDescription: '',
                items: [{ name: '', quantity: 1, price: 0, total: 0 }]
            })

            dispatch(toggleModal(null))
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    const addNewItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 1, price: 0, total: 0 }]
        })
    }

    const removeItem = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        })
    }

    const handleInputChange = (e, type, subType = null) => {
        if (subType) {
            setFormData({
                ...formData,
                [type]: {
                    ...formData[type],
                    [subType]: e.target.value
                }
            })
        } else {
            setFormData({
                ...formData,
                [type]: e.target.value
            })
        }
    }

    const handleItemChange = (index, field, value) => {
        const newItems = formData.items.map((item, i) => {
            if (i === index) {
                const newItem = { ...item, [field]: value }
                
                if (field === 'quantity' || field === 'price') {
                    newItem.total = newItem.quantity * newItem.price
                }
                return newItem
            }
            return item
        })

        setFormData({
            ...formData,
            items: newItems
        })
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ease-in-out
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => dispatch(toggleModal())}
            />
            <div className={`fixed top-0 left-0 bottom-0 w-full md:w-[620px] lg:w-[780px] bg-[#f8f8f8] z-50
                transform transition-all duration-300 ease-out md:rounded-r-[20px] flex flex-col
                ${isOpen ? 'translate-x-0 opacity-100 shadow-2xl' : '-translate-x-full opacity-0'}`}
            >
                
                <div className="flex-1 mt-20 md:mt-0 overflow-y-auto">
                    <div className="p-6 md:pl-36 md:pr-12 md:py-12">
                        <h1 className="text-2xl font-bold mb-8">
                            {editingInvoice ? `Edit #${editingInvoice.id}` : 'New Invoice'}
                        </h1>
                        <form className="space-y-8">
                           
                            <div className="space-y-4">
                                <h4 className="text-[#7C5DFA] font-bold">Bill From</h4>
                                <div className="space-y-2">
                                    <label className="text-sm text-[#888EB0]">Street Address</label>
                                    <input
                                        type="text"
                                        value={formData.senderAddress.street}
                                        onChange={(e) => handleInputChange(e, 'senderAddress', 'street')}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#888EB0]">City</label>
                                        <input
                                            type="text"
                                            value={formData.senderAddress.city}
                                            onChange={(e) => handleInputChange(e, 'senderAddress', 'city')}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#888EB0]">Post Code</label>
                                        <input
                                            type="text"
                                            value={formData.senderAddress.postCode}
                                            onChange={(e) => handleInputChange(e, 'senderAddress', 'postCode')}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#888EB0]">Country</label>
                                        <input
                                            type="text"
                                            value={formData.senderAddress.country}
                                            onChange={(e) => handleInputChange(e, 'senderAddress', 'country')}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[#7C5DFA] font-bold">Bill To</h4>
                                <div className="space-y-2">
                                    <label className="text-sm text-[#888EB0]">Client's Name</label>
                                    <input
                                        type="text"
                                        value={formData.clientName}
                                        onChange={(e) => handleInputChange(e, 'clientName')}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-[#888EB0]">Client's Email</label>
                                    <input
                                        type="email"
                                        value={formData.clientEmail}
                                        onChange={(e) => handleInputChange(e, 'clientEmail')}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-[#888EB0]">Street Address</label>
                                    <input
                                        type="text"
                                        value={formData.clientAddress.street}
                                        onChange={(e) => handleInputChange(e, 'clientAddress', 'street')}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#888EB0]">City</label>
                                        <input
                                            type="text"
                                            value={formData.clientAddress.city}
                                            onChange={(e) => handleInputChange(e, 'clientAddress', 'city')}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#888EB0]">Post Code</label>
                                        <input
                                            type="text"
                                            value={formData.clientAddress.postCode}
                                            onChange={(e) => handleInputChange(e, 'clientAddress', 'postCode')}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#888EB0]">Country</label>
                                        <input
                                            type="text"
                                            value={formData.clientAddress.country}
                                            onChange={(e) => handleInputChange(e, 'clientAddress', 'country')}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                           
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-[#888EB0]">Invoice Date</label>
                                    <input
                                        type="date"
                                        value={formData.invoiceDate}
                                        onChange={(e) => handleInputChange(e, 'invoiceDate')}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-[#888EB0]">Payment Terms</label>
                                    <select
                                        value={formData.paymentTerms}
                                        onChange={(e) => handleInputChange(e, 'paymentTerms')}
                                        className="w-full p-3 border rounded"
                                    >
                                        <option>Net 30 Days</option>
                                        <option>Net 14 Days</option>
                                        <option>Net 7 Days</option>
                                    </select>
                                </div>
                                <div className='col-span-2'>
                                    <label className="text-sm text-[#888EB0]">Project Description</label>
                                    <input
                                        type="text"
                                        value={formData.projectDescription}
                                        onChange={(e) => handleInputChange(e, 'projectDescription')}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>

                           
                            <div className="space-y-4">
                                <h4 className="text-xl font-bold">Item List</h4>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-5">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                placeholder="Item name"
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                placeholder="Qty"
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                                placeholder="Price"
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <p className="font-bold">£ {(item.total || 0).toFixed(2)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-[#888EB0]"
                                        >
                                            <BiTrash />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addNewItem}
                                    className="w-full p-3 bg-[#e9ecf7] text-[#7C5DFA] rounded-full font-bold"
                                >
                                    + Add New Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

               
                <div className="sticky bottom-0 w-full bg-white p-6 md:pl-36 md:pr-12 rounded-r-[20px] mt-auto ">
                    <div className="flex flex-row md:flex-row justify-between gap-2 md:gap-0">
                        <button
                            type="button"
                            onClick={() => dispatch(toggleModal())}
                            className="px-6 py-3 bg-[#e7ecff] text-[#7C5DFA] rounded-full"
                        >
                            Discard
                        </button>
                        <div className="space-x-2">
                            <button
                                type="button"
                                onClick={() => handleSubmit(true)}
                                className="px-6 py-3 bg-[#373B53] text-white rounded-full"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit(false)}
                                className="px-6 py-3 bg-[#7C5DFA] text-white rounded-full"
                            >
                                Save & Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddInvoiceModal