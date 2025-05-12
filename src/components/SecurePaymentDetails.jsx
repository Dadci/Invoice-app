import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BiLock, BiShow, BiHide, BiLockOpen } from 'react-icons/bi';
import { updatePaymentDetails } from '../store/settingsSlice';
import { saveCredentials, loadCredentials, maskSensitiveData, hasCredentials, verifyPassword } from '../utils/secureCredentials';
import toast from 'react-hot-toast';

const SecurePaymentDetails = () => {
    const dispatch = useDispatch();
    const paymentDetails = useSelector(state => state.settings?.paymentDetails || {});

    // State for form and security
    const [formData, setFormData] = useState({
        bankName: paymentDetails?.bankName || '',
        iban: paymentDetails?.iban || '',
        swiftBic: paymentDetails?.swiftBic || ''
    });

    const [securityState, setSecurityState] = useState({
        isEncrypted: hasCredentials(),
        passwordInput: '',
        showPassword: false,
        unlocked: false,
        showIban: false,
        showSwift: false
    });

    // When component loads, check if we have encrypted data
    useEffect(() => {
        checkEncryptionStatus();
    }, []);

    // Update form data when settings change (if not encrypted)
    useEffect(() => {
        if (!securityState.isEncrypted || securityState.unlocked) {
            setFormData({
                bankName: paymentDetails?.bankName || '',
                iban: paymentDetails?.iban || '',
                swiftBic: paymentDetails?.swiftBic || ''
            });
        }
    }, [paymentDetails, securityState.isEncrypted, securityState.unlocked]);

    // Check if payment details are already encrypted
    const checkEncryptionStatus = () => {
        const isEncrypted = hasCredentials();
        setSecurityState(prev => ({
            ...prev,
            isEncrypted
        }));
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle password input changes
    const handlePasswordChange = (e) => {
        setSecurityState({
            ...securityState,
            passwordInput: e.target.value
        });
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setSecurityState({
            ...securityState,
            showPassword: !securityState.showPassword
        });
    };

    // Toggle IBAN visibility
    const toggleIbanVisibility = () => {
        setSecurityState({
            ...securityState,
            showIban: !securityState.showIban
        });
    };

    // Toggle SWIFT/BIC visibility
    const toggleSwiftVisibility = () => {
        setSecurityState({
            ...securityState,
            showSwift: !securityState.showSwift
        });
    };

    // Save payment details without encryption
    const savePaymentDetailsWithoutEncryption = () => {
        dispatch(updatePaymentDetails(formData));
        toast.success('Payment details saved successfully');
    };

    // Encrypt and save payment details
    const encryptAndSavePaymentDetails = () => {
        if (!securityState.passwordInput) {
            toast.error('Please enter a password to encrypt your payment details');
            return;
        }

        // Save to Redux store (avoid sensitive data if possible)
        dispatch(updatePaymentDetails({
            bankName: formData.bankName,
            // Use placeholder values in Redux to indicate encryption
            iban: formData.iban ? '[ENCRYPTED]' : '',
            swiftBic: formData.swiftBic ? '[ENCRYPTED]' : ''
        }));

        // Save sensitive data to encrypted storage
        const success = saveCredentials({
            iban: formData.iban,
            swiftBic: formData.swiftBic
        }, securityState.passwordInput);

        if (success) {
            toast.success('Payment details encrypted and saved successfully');
            setSecurityState({
                ...securityState,
                isEncrypted: true,
                unlocked: true,
                passwordInput: ''
            });
        } else {
            toast.error('Failed to encrypt payment details');
        }
    };

    // Decrypt payment details with password
    const decryptPaymentDetails = () => {
        if (!securityState.passwordInput) {
            toast.error('Please enter your encryption password');
            return;
        }

        const decrypted = loadCredentials(securityState.passwordInput);
        if (decrypted) {
            // Update form with decrypted data
            setFormData({
                ...formData,
                iban: decrypted.iban || '',
                swiftBic: decrypted.swiftBic || ''
            });

            setSecurityState({
                ...securityState,
                unlocked: true,
                passwordInput: ''
            });

            toast.success('Payment details decrypted successfully');
        } else {
            toast.error('Incorrect password');
        }
    };

    const renderIbanField = () => {
        let displayValue = formData.iban;

        // If encrypted but not unlocked, show masked version
        if (securityState.isEncrypted && !securityState.unlocked) {
            return (
                <div className="flex items-center">
                    <span className="flex-grow text-sm text-light-text-secondary dark:text-dark-text-secondary">[Encrypted - Enter password to unlock]</span>
                    <BiLock className="text-[#7C5DFA]" size={20} />
                </div>
            );
        }

        // If we have value and not showing, mask it
        if (displayValue && !securityState.showIban) {
            displayValue = maskSensitiveData(displayValue);
        }

        return (
            <div className="relative">
                <input
                    type="text"
                    name="iban"
                    value={displayValue}
                    onChange={handleInputChange}
                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                    placeholder="e.g. GB29NWBK60161331926819"
                />
                {formData.iban && (
                    <button
                        type="button"
                        onClick={toggleIbanVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] transition-colors"
                    >
                        {securityState.showIban ? <BiHide size={20} /> : <BiShow size={20} />}
                    </button>
                )}
            </div>
        );
    };

    const renderSwiftField = () => {
        let displayValue = formData.swiftBic;

        // If encrypted but not unlocked, show masked version
        if (securityState.isEncrypted && !securityState.unlocked) {
            return (
                <div className="flex items-center">
                    <span className="flex-grow text-sm text-light-text-secondary dark:text-dark-text-secondary">[Encrypted - Enter password to unlock]</span>
                    <BiLock className="text-[#7C5DFA]" size={20} />
                </div>
            );
        }

        // If we have value and not showing, mask it
        if (displayValue && !securityState.showSwift) {
            displayValue = maskSensitiveData(displayValue);
        }

        return (
            <div className="relative">
                <input
                    type="text"
                    name="swiftBic"
                    value={displayValue}
                    onChange={handleInputChange}
                    className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                    placeholder="e.g. NWBKGB2L"
                />
                {formData.swiftBic && (
                    <button
                        type="button"
                        onClick={toggleSwiftVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] transition-colors"
                    >
                        {securityState.showSwift ? <BiHide size={20} /> : <BiShow size={20} />}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text transition-colors duration-200">Payment Details</h2>
                <div className="flex items-center gap-2">
                    {securityState.isEncrypted ? (
                        <span className="text-xs flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 py-1 px-2 rounded-full">
                            <BiLock size={14} />
                            Encrypted
                        </span>
                    ) : (
                        <span className="text-xs flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 py-1 px-2 rounded-full">
                            <BiLockOpen size={14} />
                            Not Encrypted
                        </span>
                    )}
                </div>
            </div>

            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 transition-colors duration-200">
                These details will appear on your invoices to help clients make payments. For security, you can encrypt sensitive information.
            </p>

            {/* Security Controls */}
            {securityState.isEncrypted && !securityState.unlocked && (
                <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg border border-light-border dark:border-dark-border mb-6">
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        Your payment information is encrypted. Enter your password to view or edit.
                    </p>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                            <input
                                type={securityState.showPassword ? "text" : "password"}
                                value={securityState.passwordInput}
                                onChange={handlePasswordChange}
                                placeholder="Enter your encryption password"
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] transition-colors"
                            >
                                {securityState.showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
                            </button>
                        </div>
                        <button
                            className="py-2 px-4 bg-[#7C5DFA] text-white rounded-md font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200"
                            onClick={decryptPaymentDetails}
                        >
                            Unlock
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">Bank Name</label>
                    <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                        placeholder="Your Bank Name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">IBAN</label>
                    {renderIbanField()}
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
                        International Bank Account Number
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary transition-colors duration-200">SWIFT/BIC Code</label>
                    {renderSwiftField()}
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
                        Bank Identifier Code for international transfers
                    </p>
                </div>
            </div>

            {/* Control buttons */}
            <div className="mt-8 flex justify-end gap-4">
                {!securityState.isEncrypted ? (
                    <>
                        <div className="relative flex-grow max-w-xs">
                            <input
                                type={securityState.showPassword ? "text" : "password"}
                                value={securityState.passwordInput}
                                onChange={handlePasswordChange}
                                placeholder="Set encryption password (optional)"
                                className="w-full h-10 px-4 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C5DFA] focus:border-transparent transition-colors duration-200"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#7C5DFA] transition-colors"
                            >
                                {securityState.showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
                            </button>
                        </div>

                        <button
                            onClick={encryptAndSavePaymentDetails}
                            className="py-3 px-6 bg-green-500 text-white rounded-md font-bold text-sm hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                        >
                            <BiLock size={18} />
                            Encrypt & Save
                        </button>

                        <button
                            onClick={savePaymentDetailsWithoutEncryption}
                            className="py-3 px-6 bg-[#7C5DFA] text-white rounded-md font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200"
                        >
                            Save Without Encryption
                        </button>
                    </>
                ) : (
                    <button
                        onClick={securityState.unlocked ? encryptAndSavePaymentDetails : savePaymentDetailsWithoutEncryption}
                        className="py-3 px-6 bg-[#7C5DFA] text-white rounded-md font-bold text-sm hover:bg-[#9277FF] transition-colors duration-200 flex items-center gap-2"
                    >
                        <BiLock size={18} />
                        Save Changes
                    </button>
                )}
            </div>
        </div>
    );
};

export default SecurePaymentDetails; 