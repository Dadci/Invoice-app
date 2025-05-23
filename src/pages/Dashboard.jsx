import React, { useMemo, useState, useEffect } from "react";
import Header from "../components/Header";
import InvoiceContainer from "../components/InvoiceContainer";
import AddInvoiceModal from '../components/AddInvoiceModal'
import EmptyState from "../components/EmptyState";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "../utils/animations";
import { BiReceipt, BiTrendingUp, BiTrendingDown, BiBarChart, BiPlus } from 'react-icons/bi';
import { toggleModal } from '../store/modalSlice';
import useCurrencyConverter from "../utils/useCurrencyConverter";
import CurrencyDisplay from "../components/CurrencyDisplay";
import { useLocation } from "react-router-dom";

const EnhancedDashboardCard = ({
  title,
  value,
  icon,
  color,
  lightBgColor,
  darkBgColor,
  accentColor,
  subtitle,
  secondaryValue,
  trend = 0,
  height,
  amount,
  baseCurrency
}) => {
  const { theme } = useSelector(state => state.theme);
  const { convertAndFormat, currentCurrency, formatCurrency } = useCurrencyConverter();

  // Determine trend icon and color
  const trendIcon = trend >= 0 ? <BiTrendingUp size={16} /> : <BiTrendingDown size={16} />;
  const trendColor = trend >= 0 ? 'text-green-500' : 'text-red-500';
  const trendText = `${Math.abs(trend)}% ${trend >= 0 ? 'increase' : 'decrease'}`;

  // Format the displayed value based on whether it's a currency amount
  const displayValue = amount !== undefined && amount !== null ?
    convertAndFormat(amount, baseCurrency) :
    value;

  // Create a secondary display showing original currency if different
  const showOriginalCurrency = amount !== undefined &&
    amount !== null &&
    baseCurrency &&
    currentCurrency &&
    baseCurrency !== currentCurrency.code;

  const originalAmountDisplay = showOriginalCurrency ?
    `(${baseCurrency} ${formatCurrency(amount, baseCurrency)})` :
    '';

  return (
    <motion.div
      variants={slideUp}
      className={`${theme === 'dark' ? darkBgColor : lightBgColor} rounded-lg overflow-hidden shadow flex flex-col transition-all duration-200 hover:shadow-md transform hover:-translate-y-1`}
      style={{
        height: height || 'auto'
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-sm tracking-wide transition-colors duration-200 text-light-text-secondary dark:text-dark-text-secondary">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 opacity-70 transition-colors duration-200">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} shadow-sm`}>
            {icon}
          </div>
        </div>

        <div className="flex flex-col flex-grow">
          <p className="text-2xl font-bold text-light-text dark:text-dark-text transition-colors duration-200">
            {displayValue}
          </p>

          {showOriginalCurrency && (
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
              {originalAmountDisplay}
            </p>
          )}

          {secondaryValue && (
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 transition-colors duration-200">
              {secondaryValue}
            </p>
          )}

          <div className="mt-auto pt-3">
            {trend !== 0 && (
              <div className={`flex items-center text-xs font-medium ${trendColor}`}>
                {trendIcon}
                <span className="ml-1">{trendText}</span>
                <span className="text-light-text-secondary dark:text-dark-text-secondary ml-1 font-normal">from last month</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const invoices = useSelector(state => state.invoices.invoices);
  const projects = useSelector(state => state.projects.projects);
  const filter = useSelector(state => state.invoices.filter);
  const clientFilter = useSelector(state => state.invoices.clientFilter);
  const searchQuery = useSelector(state => state.invoices.searchQuery || '');
  const { editingInvoice } = useSelector(state => state.modal);
  const { currency } = useSelector(state => state.settings || {});
  const { enabled: isAutomationEnabled } = useSelector(state => state.settings?.invoiceAutomation || { enabled: false });
  const { defaultHourlyRate = 13 } = useSelector(state => state.settings?.invoiceAutomation || { defaultHourlyRate: 13 });
  const settings = useSelector(state => state.settings);
  const { formatCurrency, convertAndFormat } = useCurrencyConverter();

  // Currency constant for calculations
  const defaultHourlyRateCurrency = "CAD";

  // Check if header should be displayed
  // Do not show Header on workspace creation or management pages
  const shouldShowHeader = !location.pathname.includes('/workspaces');

  // Get current month projects and estimated revenue
  const currentMonthData = useMemo(() => {
    // Get current month's start and end dates
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter projects created in the current month
    const thisMonthProjects = projects.filter(project => {
      const projectDate = new Date(project.createdAt);
      return projectDate >= firstDayOfMonth && projectDate <= lastDayOfMonth;
    });

    // Calculate estimated revenue based on hours estimated * hourly rate in CAD
    const estimatedRevenue = thisMonthProjects.reduce((sum, project) => {
      return sum + ((project.hoursEstimated || 0) * defaultHourlyRate);
    }, 0);

    // Get previous month's data for comparison (mock data for demonstration)
    const prevMonthProjectCount = Math.round(thisMonthProjects.length * 0.8); // Mock: 20% growth in projects
    const projectTrend = prevMonthProjectCount ? Math.round((thisMonthProjects.length - prevMonthProjectCount) / prevMonthProjectCount * 100) : 0;

    return {
      projectCount: thisMonthProjects.length,
      estimatedRevenue: estimatedRevenue,
      projectTrend
    };
  }, [projects, defaultHourlyRate]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    // Apply the current filters to keep metrics consistent with visible invoices
    let filteredInvoices = invoices;

    if (filter !== 'all') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === filter);
    }

    if (clientFilter !== 'all') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.clientName === clientFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.id?.toLowerCase().includes(query) ||
        invoice.clientName?.toLowerCase().includes(query) ||
        invoice.projectDescription?.toLowerCase().includes(query) ||
        invoice.clientEmail?.toLowerCase().includes(query) ||
        invoice.items?.some(item => item.name?.toLowerCase().includes(query))
      );
    }

    const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid');
    const pendingInvoices = filteredInvoices.filter(invoice => invoice.status === 'pending');
    const draftInvoices = filteredInvoices.filter(invoice => invoice.status === 'draft');
    const sentInvoices = filteredInvoices.filter(invoice => invoice.status === 'sent');

    // Calculate totals, ensuring amounts are properly converted to numbers
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => {
      const total = typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total || 0);
      return sum + total;
    }, 0);

    const paidRevenue = paidInvoices.reduce((sum, invoice) => {
      const total = typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total || 0);
      return sum + total;
    }, 0);

    const pendingRevenue = pendingInvoices.reduce((sum, invoice) => {
      const total = typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total || 0);
      return sum + total;
    }, 0);

    // Generate mock trend data (would be replaced with real historical data)
    const revenueTrend = 15; // Assuming 15% increase from last month
    const pendingTrend = -12; // Assuming 12% decrease in pending invoices
    const paidTrend = 8; // Assuming 8% increase in paid invoices

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      draftCount: draftInvoices.length,
      sentCount: sentInvoices.length,
      revenueTrend,
      pendingTrend,
      paidTrend,
      totalCount: filteredInvoices.length
    };
  }, [invoices, filter, clientFilter, searchQuery]);

  // Fixed height for consistent card sizing
  const cardHeight = '180px';

  // Get current workspace information
  const { currentWorkspace } = useSelector(state => state.workspaces);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-5 px-4 md:px-6 pb-16">
      {shouldShowHeader && <Header />}

      {/* Simple welcome message */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-1"
      >
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text flex items-center gap-2">
          Welcome to {currentWorkspace?.name || 'Your Workspace'} 👋🏼
        </h2>
      </motion.div>

      {/* Dashboard metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
      >
        <EnhancedDashboardCard
          title="Total Revenue"
          subtitle="Overall from all invoices"
          icon={<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"></path>
          </svg>}
          color="bg-[#7C5DFA]"
          lightBgColor="bg-white"
          darkBgColor="bg-dark-card"
          secondaryValue={<>from <span className="font-semibold">{dashboardMetrics.totalCount}</span> invoices</>}
          trend={dashboardMetrics.revenueTrend}
          height={cardHeight}
          amount={dashboardMetrics.totalRevenue}
          baseCurrency="CAD"
        />
        <EnhancedDashboardCard
          title="Pending Invoices"
          subtitle="Awaiting payment"
          value={dashboardMetrics.pendingCount}
          icon={<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
          </svg>}
          color="bg-[#FF8F00]"
          lightBgColor="bg-white"
          darkBgColor="bg-dark-card"
          secondaryValue={<>outstanding <CurrencyDisplay amount={dashboardMetrics.pendingRevenue} baseCurrency="CAD" size="sm" showOriginal /></>}
          trend={dashboardMetrics.pendingTrend}
          height={cardHeight}
          amount={dashboardMetrics.pendingRevenue}
          baseCurrency="CAD"
        />
        <EnhancedDashboardCard
          title="Paid Invoices"
          subtitle="Completed payments"
          value={dashboardMetrics.paidCount}
          icon={<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
          </svg>}
          color="bg-[#33D69F]"
          lightBgColor="bg-white"
          darkBgColor="bg-dark-card"
          secondaryValue={<>collected <CurrencyDisplay amount={dashboardMetrics.paidRevenue} baseCurrency="CAD" size="sm" showOriginal /></>}
          trend={dashboardMetrics.paidTrend}
          height={cardHeight}
          amount={dashboardMetrics.paidRevenue}
          baseCurrency="CAD"
        />
        <EnhancedDashboardCard
          title="This Month's Projects"
          subtitle="Active work and revenue forecast"
          value={currentMonthData.projectCount}
          icon={<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path>
          </svg>}
          color="bg-[#6460FF]"
          lightBgColor="bg-white"
          darkBgColor="bg-dark-card"
          secondaryValue={<>estimated value <CurrencyDisplay amount={currentMonthData.estimatedRevenue} baseCurrency="CAD" size="sm" showOriginal /></>}
          trend={currentMonthData.projectTrend}
          height={cardHeight}
          amount={currentMonthData.estimatedRevenue}
          baseCurrency="CAD"
        />
      </motion.div>

      {/* Invoices section with page title */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-2"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text transition-colors duration-200">Invoices</h2>

          <button
            onClick={() => dispatch(toggleModal({ type: 'addInvoice' }))}
            className="bg-[#7C5DFA] hover:bg-[#9277FF] transition-colors text-white py-2 px-4 rounded-full flex items-center gap-2 text-sm font-medium"
          >
            <BiPlus size={18} />
            <span className="hidden md:inline">New Invoice</span>
          </button>
        </div>

        {invoices.length ? (
          <InvoiceContainer invoices={invoices} />
        ) : (
          <EmptyState
            title="There are no invoices yet"
            description="Get started by creating your first invoice. Click the 'New Invoice' button to begin."
            buttonText="New Invoice"
            icon={<BiReceipt className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary opacity-30" />}
            onButtonClick={() => dispatch(toggleModal({ type: 'addInvoice' }))}
          />
        )}
      </motion.div>

      <AddInvoiceModal />
    </div>
  );
};

export default Dashboard;
