import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BiChevronLeft, BiTrash, BiPlus, BiBell, BiReceipt, BiBuilding, BiCreditCard, BiDollar, BiLayer, BiCog, BiHelpCircle } from "react-icons/bi";
import { useNavigate, useLocation } from 'react-router-dom';
import { updateBusinessInfo, updateBusinessAddress, updatePaymentDetails, changeCurrency, addServiceType, removeServiceType, updateInvoiceAutomation } from '../store/settingsSlice';
import toast from 'react-hot-toast';
import { DEFAULT_SERVICE_TYPES, DEFAULT_SERVICE_TYPE_IDS } from '../utils/constants';
import NotificationsSettings from '../components/NotificationsSettings';
import OnboardingDialog from '../components/OnboardingDialog';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    // Add fallbacks for all properties
    const settings = useSelector(state => state.settings || {});
    const businessInfo = settings.businessInfo || {};
    const paymentDetails = settings.paymentDetails || {};
    const currency = settings.currency || { code: 'GBP', symbol: '£' };
    const availableCurrencies = settings.availableCurrencies || [
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' }
    ];
    // Add a fallback for serviceTypes
    const serviceTypes = settings.serviceTypes || DEFAULT_SERVICE_TYPES;
    // Add fallback for invoiceAutomation
    const invoiceAutomation = settings.invoiceAutomation || {
        enabled: false,
        generateMonthEndInvoices: false,
        defaultHourlyRate: 50,
        defaultPaymentTerms: 30
    };

    const [activeTab, setActiveTab] = useState('business');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [formData, setFormData] = useState({
        name: businessInfo.name || '',
        email: businessInfo.email || '',
        phone: businessInfo.phone || '',
        taxId: businessInfo.taxId || '',
        street: businessInfo.address?.street || '',
        city: businessInfo.address?.city || '',
        postCode: businessInfo.address?.postCode || '',
        country: businessInfo.address?.country || ''
    });

    const [paymentFormData, setPaymentFormData] = useState({
        bankName: paymentDetails?.bankName || '',
        iban: paymentDetails?.iban || '',
        swiftBic: paymentDetails?.swiftBic || ''
    });

    // For invoice automation settings
    const [automationSettings, setAutomationSettings] = useState({
        enabled: invoiceAutomation?.enabled || false,
        generateMonthEndInvoices: invoiceAutomation?.generateMonthEndInvoices || false,
        defaultHourlyRate: invoiceAutomation?.defaultHourlyRate || 50,
        defaultPaymentTerms: invoiceAutomation?.defaultPaymentTerms || 30
    });

    // For service types management
    const [newServiceType, setNewServiceType] = useState({ name: '' });

    // Update form data when settings change (e.g., on initial load from localStorage)
    useEffect(() => {
        setFormData({
            name: businessInfo.name || '',
            email: businessInfo.email || '',
            phone: businessInfo.phone || '',
            taxId: businessInfo.taxId || '',
            street: businessInfo.address?.street || '',
            city: businessInfo.address?.city || '',
            postCode: businessInfo.address?.postCode || '',
            country: businessInfo.address?.country || ''
        });
    }, [businessInfo]);

    // Update payment form data when settings change
    useEffect(() => {
        setPaymentFormData({
            bankName: paymentDetails?.bankName || '',
            iban: paymentDetails?.iban || '',
            swiftBic: paymentDetails?.swiftBic || ''
        });
    }, [paymentDetails]);

    // Update automation settings when settings change
    useEffect(() => {
        setAutomationSettings({
            enabled: invoiceAutomation?.enabled || false,
            generateMonthEndInvoices: invoiceAutomation?.generateMonthEndInvoices || false,
            defaultHourlyRate: invoiceAutomation?.defaultHourlyRate || 50,
            defaultPaymentTerms: invoiceAutomation?.defaultPaymentTerms || 30
        });
    }, [invoiceAutomation]);

    const [selectedCurrency, setSelectedCurrency] = useState(currency);

    // Update selected currency when settings change
    useEffect(() => {
        setSelectedCurrency(currency);
    }, [currency]);

    // Add this to get the current workspace ID
    const { currentWorkspace } = useSelector(state => state.workspaces || { currentWorkspace: null });
    const workspaceId = currentWorkspace?.id || 'default';

    // Check if we should open a specific tab based on router state
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentFormData({
            ...paymentFormData,
            [name]: value
        });
    };

    const handleAutomationChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAutomationSettings({
            ...automationSettings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const saveBusinessInfo = () => {
        dispatch(updateBusinessInfo({
            data: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                taxId: formData.taxId
            },
            workspaceId
        }));

        dispatch(updateBusinessAddress({
            data: {
                street: formData.street,
                city: formData.city,
                postCode: formData.postCode,
                country: formData.country
            },
            workspaceId
        }));

        // Debug logging
        console.log("Business info saved:", {
            name: formData.name,
            email: formData.email,
            workspaceId: workspaceId
        });

        toast.success('Business information saved successfully');
    };

    const savePaymentDetails = () => {
        dispatch(updatePaymentDetails({
            data: {
                bankName: paymentFormData.bankName,
                iban: paymentFormData.iban,
                swiftBic: paymentFormData.swiftBic
            },
            workspaceId
        }));

        // Debug logging
        console.log("Payment details saved:", {
            bankName: paymentFormData.bankName,
            iban: paymentFormData.iban,
            workspaceId: workspaceId
        });

        toast.success('Payment details saved successfully');
    };

    const saveCurrencySettings = () => {
        dispatch(changeCurrency({
            data: selectedCurrency,
            workspaceId
        }));
        toast.success('Currency settings updated successfully');
    };

    const addNewServiceType = () => {
        if (!newServiceType.name.trim()) {
            toast.error('Service name cannot be empty');
            return;
        }

        // Check if service with similar name already exists
        const nameExists = serviceTypes.some(
            service => service.name.toLowerCase() === newServiceType.name.toLowerCase()
        );

        if (nameExists) {
            toast.error('A service with this name already exists');
            return;
        }

        // Create a valid ID from the name (lowercase, dash-separated)
        const id = newServiceType.name.toLowerCase().replace(/\s+/g, '-');

        // Add to redux store
        dispatch(addServiceType({
            data: { id, name: newServiceType.name },
            workspaceId
        }));

        // Reset form
        setNewServiceType({ name: '' });

        toast.success('New service type added');
    };

    // Add this function to handle deleting service types
    const handleDeleteServiceType = (id) => {
        // Don't allow deletion of default service types
        if (DEFAULT_SERVICE_TYPE_IDS.includes(id)) {
            toast.error('Cannot delete default service types');
            return;
        }

        // Show confirmation before deleting
        if (window.confirm('Are you sure you want to delete this service type? This cannot be undone.')) {
            dispatch(removeServiceType({
                data: id,
                workspaceId
            }));
            toast.success('Service type removed successfully');
        }
    };

    const saveAutomationSettings = () => {
        dispatch(updateInvoiceAutomation({
            data: automationSettings,
            workspaceId
        }));
        toast.success('Invoice automation settings updated successfully');
    };

    const tabs = [
        { id: 'business', label: 'Business Info', icon: <BiBuilding size={16} /> },
        { id: 'payment', label: 'Payment', icon: <BiCreditCard size={16} /> },
        { id: 'currency', label: 'Currency', icon: <BiDollar size={16} /> },
        { id: 'services', label: 'Services', icon: <BiLayer size={16} /> },
        { id: 'notifications', label: 'Notifications', icon: <BiBell size={16} /> },
        { id: 'automation', label: 'Automation', icon: <BiReceipt size={16} /> },
        { id: 'help', label: 'Help & Setup', icon: <BiHelpCircle size={16} /> },
    ];

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6 p-6 mt-12 md:mt-8 mb-24">
            <div className='flex items-center gap-2'>
                <div className="flex items-center gap-2 justify-start cursor-pointer" onClick={() => navigate('/')} >
                    <BiChevronLeft size={20} className="text-[#7C5DFA]" />
                </div>

                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text transition-colors duration-200">Settings</h1>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-1 border-b border-light-border dark:border-dark-border">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`py-3 px-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 font-medium text-xs sm:text-sm transition-colors duration-200 ${activeTab === tab.id
                            ? 'text-[#7C5DFA] border-b-2 border-[#7C5DFA]'
                            : 'text-light-text-secondary dark:text-dark-text-secondary'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="sm:hidden">{tab.icon}</span>
                        <span className="hidden sm:flex">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'business' && (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 shadow-sm transition-colors duration-200">
                    <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text transition-colors duration-200">Business Information</h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                        Your business information will appear on your invoices. Make sure to provide accurate details for proper identification.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Business Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="Your Business Name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="+1 (123) 456-7890"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Tax ID / VAT Number</label>
                            <input
                                type="text"
                                name="taxId"
                                value={formData.taxId}
                                onChange={handleInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="Tax ID / VAT Number"
                            />
                        </div>
                    </div>

                    <h3 className="text-[#7C5DFA] font-bold mt-8 mb-4">Business Address</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Street Address</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="Street Address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                    placeholder="City"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Post Code</label>
                                <input
                                    type="text"
                                    name="postCode"
                                    value={formData.postCode}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                    placeholder="Post Code"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                    placeholder="Country"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={saveBusinessInfo}
                            className="py-3 px-6 bg-[#7C5DFA] text-white rounded-full font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'payment' && (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 shadow-sm transition-colors duration-200">
                    <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text transition-colors duration-200">Payment Details</h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                        These details will appear on your invoices to help clients make payments.
                    </p>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={paymentFormData.bankName}
                                onChange={handlePaymentInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="Your Bank Name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">IBAN</label>
                            <input
                                type="text"
                                name="iban"
                                value={paymentFormData.iban}
                                onChange={handlePaymentInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="e.g. GB29NWBK60161331926819"
                            />
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
                                International Bank Account Number
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">SWIFT/BIC Code</label>
                            <input
                                type="text"
                                name="swiftBic"
                                value={paymentFormData.swiftBic}
                                onChange={handlePaymentInputChange}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="e.g. NWBKGB2L"
                            />
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
                                Bank Identifier Code for international transfers
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={savePaymentDetails}
                            className="py-3 px-6 bg-[#7C5DFA] text-white rounded-full font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'currency' && (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 shadow-sm transition-colors duration-200">
                    <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text transition-colors duration-200">Currency Settings</h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                        Select the currency you want to use for your invoices. This will determine how amounts are displayed.
                    </p>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Select Currency</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableCurrencies.map((curr) => (
                                    <div
                                        key={curr.code}
                                        onClick={() => setSelectedCurrency(curr)}
                                        className={`p-4 border border-light-border dark:border-dark-border rounded-md flex items-center justify-between cursor-pointer hover:border-[#7C5DFA] transition-colors duration-200 ${selectedCurrency.code === curr.code ? 'border-[#7C5DFA] bg-light-bg dark:bg-dark-border' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold text-light-text dark:text-dark-text transition-colors duration-200">{curr.symbol}</span>
                                            <div>
                                                <p className="font-bold text-light-text dark:text-dark-text transition-colors duration-200">{curr.code}</p>
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">{curr.name}</p>
                                            </div>
                                        </div>
                                        {selectedCurrency.code === curr.code && (
                                            <div className="w-4 h-4 rounded-full bg-[#7C5DFA]"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={saveCurrencySettings}
                            className="py-3 px-6 bg-[#7C5DFA] text-white rounded-full font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 shadow-sm transition-colors duration-200">
                    <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text transition-colors duration-200">Manage Service Types</h2>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                        Customize the service types available when creating invoices. These service types will be available in the dropdown menu when adding items to an invoice.
                    </p>

                    <div className="flex items-end gap-4 mb-6">
                        <div className="flex-1">
                            <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 block transition-colors duration-200">New Service Type</label>
                            <input
                                type="text"
                                value={newServiceType.name}
                                onChange={(e) => setNewServiceType({ name: e.target.value })}
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                placeholder="e.g. Product Photography"
                            />
                        </div>
                        <button
                            onClick={addNewServiceType}
                            className="py-3 px-6 bg-[#7C5DFA] text-white rounded-full font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200 flex items-center gap-2"
                        >
                            <BiPlus size={16} />
                            Add Service
                        </button>
                    </div>

                    <div className="space-y-4 mt-8">
                        <h3 className="text-[#7C5DFA] font-bold mb-4">Current Service Types</h3>
                        <div className="border border-light-border dark:border-dark-border rounded-lg overflow-hidden transition-colors duration-200">
                            <div className="grid grid-cols-[1fr,auto] items-center bg-light-bg dark:bg-dark-bg p-4 border-b border-light-border dark:border-dark-border transition-colors duration-200">
                                <p className="font-bold text-sm text-light-text dark:text-dark-text transition-colors duration-200">Service Name</p>
                                <p className="font-bold text-sm text-light-text dark:text-dark-text transition-colors duration-200">Actions</p>
                            </div>
                            {serviceTypes.map((service) => (
                                <div key={service.id} className="grid grid-cols-[1fr,auto] items-center p-4 border-b border-light-border dark:border-dark-border last:border-b-0 transition-colors duration-200">
                                    <p className="text-light-text dark:text-dark-text transition-colors duration-200">{service.name}</p>
                                    <button
                                        onClick={() => handleDeleteServiceType(service.id)}
                                        disabled={DEFAULT_SERVICE_TYPE_IDS.includes(service.id)}
                                        className={`p-2 rounded-full ${DEFAULT_SERVICE_TYPE_IDS.includes(service.id) ? 'text-light-text-secondary dark:text-dark-text-secondary cursor-not-allowed' : 'text-[#EC5757] hover:bg-[#EC5757]/10'} transition-colors duration-200`}
                                    >
                                        <BiTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'automation' && (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 shadow-sm transition-colors duration-200">
                    <div className="flex items-center gap-3">
                        <BiReceipt size={24} className="text-[#7C5DFA]" />
                        <h2 className="text-xl font-bold text-light-text dark:text-dark-text transition-colors duration-200">Invoice Automation</h2>
                    </div>

                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary my-6 transition-colors duration-200">
                        Configure automatic invoice generation based on your projects. This system can automatically create invoices at the end of the month to save you time.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-light-border dark:border-dark-border rounded-lg transition-colors duration-200">
                            <div>
                                <h3 className="font-semibold text-light-text dark:text-dark-text transition-colors duration-200">Enable Invoice Automation</h3>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
                                    Turn on automated invoice processing features
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="enabled"
                                    checked={automationSettings.enabled}
                                    onChange={handleAutomationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-light-border dark:bg-dark-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C5DFA] transition-colors duration-200"></div>
                            </label>
                        </div>

                        <div className="space-y-6 pl-4 border-l-2 border-light-border dark:border-dark-border transition-colors duration-200">
                            <div className="flex items-center justify-between p-4 border border-light-border dark:border-dark-border rounded-lg opacity-100 transition-colors duration-200" style={{ opacity: automationSettings.enabled ? 1 : 0.5 }}>
                                <div>
                                    <h3 className="font-semibold text-light-text dark:text-dark-text transition-colors duration-200">Month-End Invoicing</h3>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
                                        Automatically generate invoices at the end of each month based on project hours and services
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer" style={{ pointerEvents: automationSettings.enabled ? 'auto' : 'none' }}>
                                    <input
                                        type="checkbox"
                                        name="generateMonthEndInvoices"
                                        checked={automationSettings.generateMonthEndInvoices}
                                        onChange={handleAutomationChange}
                                        disabled={!automationSettings.enabled}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-light-border dark:bg-dark-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C5DFA] transition-colors duration-200"></div>
                                </label>
                            </div>

                            <div className="space-y-4 p-4 border border-light-border dark:border-dark-border rounded-lg opacity-100 transition-colors duration-200" style={{ opacity: automationSettings.enabled ? 1 : 0.5 }}>
                                <h3 className="font-semibold text-light-text dark:text-dark-text transition-colors duration-200">Default Billing Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Default Hourly Rate</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary">
                                                {currency.symbol}
                                            </span>
                                            <input
                                                type="number"
                                                name="defaultHourlyRate"
                                                value={automationSettings.defaultHourlyRate}
                                                onChange={handleAutomationChange}
                                                disabled={!automationSettings.enabled}
                                                className="w-full h-10 pl-8 pr-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                                placeholder="50"
                                                min="1"
                                            />
                                        </div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">
                                            Applied when a project doesn't have a specific rate
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Default Payment Terms (Days)</label>
                                        <input
                                            type="number"
                                            name="defaultPaymentTerms"
                                            value={automationSettings.defaultPaymentTerms}
                                            onChange={handleAutomationChange}
                                            disabled={!automationSettings.enabled}
                                            className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                                            placeholder="30"
                                            min="1"
                                            max="90"
                                        />
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">
                                            Days until payment is due after invoice generation
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={saveAutomationSettings}
                                className="py-3 px-6 bg-[#7C5DFA] text-white rounded-full font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200"
                            >
                                Save Automation Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'help' && (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 shadow-sm transition-colors duration-200">
                    <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text transition-colors duration-200">Help & Setup</h2>

                    <div className="space-y-8">
                        <div className="p-6 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg">
                            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">Workspace Setup Guide</h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                Need help setting up your workspace? Use our step-by-step guide to make sure you've configured everything correctly.
                            </p>
                            <button
                                onClick={() => setShowOnboarding(true)}
                                className="py-2.5 px-5 bg-[#7C5DFA] text-white rounded-lg font-medium hover:bg-[#9277FF] transition-colors"
                            >
                                Open Setup Guide
                            </button>
                        </div>

                        {/* Add more help sections here if needed */}
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && <NotificationsSettings />}

            {/* Onboarding Dialog */}
            <OnboardingDialog isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </div>
    );
};

export default Settings; 