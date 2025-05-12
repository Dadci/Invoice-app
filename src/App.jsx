import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import InvoiceDetails from "./pages/InvoiceDetails";
import Sidebar from "./components/Sidebar";
import Settings from "./pages/Settings";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import WorkspaceManagement from "./pages/WorkspaceManagement";
import CreateWorkspace from "./pages/CreateWorkspace";
import { Toaster } from 'react-hot-toast'
import ThemeInitializer from "./components/ThemeInitializer";
import { checkAllReminders } from "./utils/reminderUtils";
import { initializeWorkspaces } from "./store/workspacesSlice";
import { setActiveWorkspaceInvoices } from "./store/invoicesSlice";
import { setActiveWorkspaceProjects } from "./store/projectsSlice";
import { setActiveWorkspaceSettings } from "./store/settingsSlice";
import OnboardingDialog from "./components/OnboardingDialog";
import HelpButton from "./components/HelpButton";

// Create a wrapper component to handle location changes
const AppContent = () => {
  const { theme } = useSelector(state => state.theme);
  const { currentWorkspace, workspaces } = useSelector(state => state.workspaces);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastWorkspaceId, setLastWorkspaceId] = useState(null);
  const [isWorkspaceSwitching, setIsWorkspaceSwitching] = useState(false);

  // Initialize workspaces and reminders on app load
  useEffect(() => {
    // Initialize workspaces
    dispatch(initializeWorkspaces());

    // Check for reminders and invoice automation on initial load
    checkAllReminders();

    // Set up daily reminder and automation checks
    const reminderCheckInterval = setInterval(() => {
      checkAllReminders();
    }, 1000 * 60 * 60 * 12); // Check twice a day (every 12 hours)

    // Clean up interval on component unmount
    return () => clearInterval(reminderCheckInterval);
  }, [dispatch]);

  // Load workspace data when current workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      // Set flag to indicate workspace is switching
      setIsWorkspaceSwitching(true);

      dispatch(setActiveWorkspaceInvoices(currentWorkspace.id));
      dispatch(setActiveWorkspaceProjects(currentWorkspace.id));
      dispatch(setActiveWorkspaceSettings(currentWorkspace.id));

      // Check if this is a new workspace by comparing with the previous one
      if (currentWorkspace.id !== lastWorkspaceId) {
        setLastWorkspaceId(currentWorkspace.id);

        // Check if this workspace is newly created (compare with localStorage)
        const storedWorkspaceIds = localStorage.getItem('onboardedWorkspaces')
          ? JSON.parse(localStorage.getItem('onboardedWorkspaces'))
          : [];

        if (!storedWorkspaceIds.includes(currentWorkspace.id)) {
          // Show onboarding for newly switched workspace
          setShowOnboarding(true);

          // Update the stored list of onboarded workspaces
          const updatedWorkspaceIds = [...storedWorkspaceIds, currentWorkspace.id];
          localStorage.setItem('onboardedWorkspaces', JSON.stringify(updatedWorkspaceIds));
        }

        // Navigate to dashboard only if we're not already there
        // This prevents double navigation
        if (location.pathname !== '/') {
          navigate('/');
        }
      }

      // Reset the switching flag after a short delay to allow data to load
      setTimeout(() => {
        setIsWorkspaceSwitching(false);
      }, 50);
    }
  }, [currentWorkspace?.id, dispatch, lastWorkspaceId, location.pathname, navigate]);

  // Handle closing onboarding dialog
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  // Handle opening onboarding dialog
  const handleOpenOnboarding = () => {
    // Force refresh of workspace data to ensure latest state
    if (currentWorkspace) {
      console.log("Forcing refresh of workspace data before opening dialog");
      dispatch(setActiveWorkspaceInvoices(currentWorkspace.id));
      dispatch(setActiveWorkspaceProjects(currentWorkspace.id));
      dispatch(setActiveWorkspaceSettings(currentWorkspace.id));
    }
    setShowOnboarding(true);
  };

  return (
    <div className={`flex min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-200`}>
      <Sidebar />
      <main className="flex-1 pt-4 md:pt-3 md:ml-24 w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoice/:id" element={<InvoiceDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/workspaces" element={<WorkspaceManagement />} />
          <Route path="/workspaces/new" element={<CreateWorkspace />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1E2139' : '#fff',
            color: theme === 'dark' ? '#DFE3FA' : '#0C0E16',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#33D69F',
              secondary: theme === 'dark' ? '#1E2139' : '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EC5757',
              secondary: theme === 'dark' ? '#1E2139' : '#fff',
            },
          }
        }}
      />

      {/* Help Button */}
      <HelpButton onClick={handleOpenOnboarding} />

      {/* Onboarding Dialog */}
      <OnboardingDialog isOpen={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeInitializer />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
