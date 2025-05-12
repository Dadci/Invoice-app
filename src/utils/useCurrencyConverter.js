import { useSelector } from 'react-redux';
import { CURRENCY_EXCHANGE_RATES } from './constants';

/**
 * Custom hook for currency conversion throughout the app
 * @returns {Object} Currency conversion utilities
 */
export const useCurrencyConverter = () => {
    const { currency = { code: 'CAD', symbol: '$' } } = useSelector(state => state.settings || {});

    /**
     * Converts an amount from one currency to another
     * @param {number} amount - The amount to convert
     * @param {string} fromCurrency - The source currency code (default: current app currency)
     * @param {string} toCurrency - The target currency code (default: current app currency)
     * @returns {number} The converted amount
     */
    const convertAmount = (amount, fromCurrency = currency.code, toCurrency = currency.code) => {
        if (!amount || fromCurrency === toCurrency) return amount;

        try {
            // Convert from source currency to DZD (our base for exchange rates)
            const amountInDZD = amount / CURRENCY_EXCHANGE_RATES[fromCurrency];

            // Convert from DZD to target currency
            return amountInDZD * CURRENCY_EXCHANGE_RATES[toCurrency];
        } catch (error) {
            console.error(`Currency conversion error: ${error.message}`);
            return amount; // Return original amount on error
        }
    };

    /**
     * Formats a currency amount according to the specified currency
     * @param {number} amount - The amount to format
     * @param {string} currencyCode - The currency code to use for formatting (default: current app currency)
     * @returns {string} Formatted currency string
     */
    const formatCurrency = (amount, currencyCode = currency.code) => {
        if (amount === null || amount === undefined) return '';

        try {
            const symbol = currencyCode === 'DZD' ? 'د.ج' :
                currencyCode === 'EUR' ? '€' :
                    currencyCode === 'CAD' || currencyCode === 'USD' ? '$' : '';

            // Format the number with appropriate decimal places
            let formattedAmount;

            if (currencyCode === 'DZD') {
                // Algerian Dinar typically shown without decimal places
                formattedAmount = Math.round(amount).toLocaleString();
            } else {
                // Other currencies typically shown with 2 decimal places
                formattedAmount = amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }

            // Place the symbol correctly based on currency
            return currencyCode === 'DZD' ?
                `${formattedAmount} ${symbol}` :
                `${symbol}${formattedAmount}`;

        } catch (error) {
            console.error(`Currency formatting error: ${error.message}`);
            return `${amount}`; // Return amount as string on error
        }
    };

    /**
     * Converts and formats an amount from one currency to another
     * @param {number} amount - The amount to convert and format
     * @param {string} fromCurrency - The source currency code (default: 'CAD')
     * @param {string} toCurrency - The target currency code (default: current app currency)
     * @returns {string} Formatted currency string after conversion
     */
    const convertAndFormat = (amount, fromCurrency = 'CAD', toCurrency = currency.code) => {
        const convertedAmount = convertAmount(amount, fromCurrency, toCurrency);
        return formatCurrency(convertedAmount, toCurrency);
    };

    return {
        convertAmount,
        formatCurrency,
        convertAndFormat,
        currentCurrency: currency
    };
};

export default useCurrencyConverter; 