import React from 'react';
import useCurrencyConverter from '../utils/useCurrencyConverter';

/**
 * A component for displaying currency amounts with automatic conversion
 * 
 * @param {Object} props
 * @param {number} props.amount - The amount to display
 * @param {string} props.baseCurrency - The currency code the amount is in (defaults to CAD)
 * @param {boolean} props.showOriginal - Whether to show the original amount if conversion happens
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 */
const CurrencyDisplay = ({
  amount,
  baseCurrency = 'CAD',
  showOriginal = false,
  className = '',
  size = 'md'
}) => {
  const { convertAndFormat, currentCurrency, formatCurrency } = useCurrencyConverter();

  // Skip rendering if amount is undefined or null
  if (amount === undefined || amount === null) return null;

  // Ensure amount is a number
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  // Format with conversion to current currency
  const formattedAmount = convertAndFormat(numericAmount, baseCurrency);
  const isConverted = currentCurrency.code !== baseCurrency;

  // Determine text size based on size prop
  const textSize = size === 'sm' ? 'text-sm' :
    size === 'lg' ? 'text-xl font-bold' :
      'text-base'; // Default for 'md'

  return (
    <span className={`${className}`}>
      <span className={textSize}>{formattedAmount}</span>

      {showOriginal && isConverted && (
        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary ml-1">
          ({baseCurrency} {formatCurrency(numericAmount, baseCurrency)})
        </span>
      )}
    </span>
  );
};

export default CurrencyDisplay; 