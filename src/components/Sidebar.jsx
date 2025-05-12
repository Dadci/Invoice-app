import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../store/themeSlice";
import { setCurrentWorkspace } from "../store/workspacesSlice";
import { setActiveWorkspaceInvoices } from "../store/invoicesSlice";
import { setActiveWorkspaceProjects } from "../store/projectsSlice";
import { setActiveWorkspaceSettings } from "../store/settingsSlice";
import logo from "../assets/logo.svg";
import { BiFolder, BiHome, BiCog, BiSun, BiMoon, BiBuildings, BiPlus } from "react-icons/bi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.theme);
  const { workspaces, currentWorkspace } = useSelector(state => state.workspaces);
  const navigate = useNavigate();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const mobileButtonRef = useRef(null);

  // Close workspace menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideDesktopMenu = desktopMenuRef.current && desktopMenuRef.current.contains(event.target);
      const clickedInsideMobileMenu = mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
      const clickedProfileButton = profileButtonRef.current && profileButtonRef.current.contains(event.target);
      const clickedMobileButton = mobileButtonRef.current && mobileButtonRef.current.contains(event.target);

      // Only close if clicked outside both menus and buttons
      if (!clickedInsideDesktopMenu && !clickedInsideMobileMenu &&
        !clickedProfileButton && !clickedMobileButton) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleWorkspaceClick = () => {
    setWorkspaceMenuOpen(!workspaceMenuOpen);
  };

  const handleWorkspaceSelect = (workspace) => {
    // Update the current workspace in state
    dispatch(setCurrentWorkspace(workspace.id));

    // Load the appropriate invoices and projects for this workspace
    dispatch(setActiveWorkspaceInvoices(workspace.id));
    dispatch(setActiveWorkspaceProjects(workspace.id));
    dispatch(setActiveWorkspaceSettings(workspace.id));

    // Close the menu after selection
    setWorkspaceMenuOpen(false);

    // Navigate directly to dashboard without delay
    console.log(`Switching to workspace ${workspace.id} from sidebar and navigating to dashboard`);
    navigate('/');
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full md:w-24 h-16 md:h-screen flex md:flex-col justify-between bg-[#373B53] md:rounded-r-[20px]">
      {/* Logo and top section */}
      <div className="flex md:flex-col items-center justify-start">
        <Link to="/" className="p-4">
          <img src={logo} alt="logo" className="w-8 h-8 md:w-auto md:h-auto" />
        </Link>

        {/* Desktop navigation links - positioned at the top */}
        <div className="hidden md:flex md:flex-col items-center md:pt-2">
          <Link to="/" className="text-white hover:text-[#7C5DFA] transition-colors p-3 my-1">
            <BiHome className="w-6 h-6" />
          </Link>
          <Link to="/projects" className="text-white hover:text-[#7C5DFA] transition-colors p-3 my-1">
            <BiFolder className="w-6 h-6" />
          </Link>
          <Link to="/settings" className="text-white hover:text-[#7C5DFA] transition-colors p-3 my-1">
            <BiCog className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Mobile navigation links */}
      <div className="flex md:hidden items-center justify-center gap-10 flex-1">
        <Link to="/" className="text-white hover:text-[#7C5DFA] transition-colors">
          <BiHome className="w-6 h-6" />
        </Link>
        <Link to="/projects" className="text-white hover:text-[#7C5DFA] transition-colors">
          <BiFolder className="w-6 h-6" />
        </Link>
        <Link to="/settings" className="text-white hover:text-[#7C5DFA] transition-colors">
          <BiCog className="w-6 h-6" />
        </Link>
      </div>

      {/* Bottom section: Theme toggle and profile with workspace selector */}
      <div className="flex md:flex-col items-center justify-end p-3 md:pb-8">
        {/* Empty flex spacer to push elements to bottom */}
        <div className="hidden md:block flex-1"></div>

        {/* Theme toggle */}
        <div className="hidden md:flex md:justify-center w-full mb-8">
          <button
            onClick={handleToggleTheme}
            className="w-8 h-8 flex items-center justify-center text-white hover:text-[#DFE3FA] transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <BiSun className="w-6 h-6 text-white cursor-pointer" />
            ) : (
              <BiMoon className="w-6 h-6 text-white cursor-pointer" />
            )}
          </button>
        </div>

        {/* Desktop divider */}
        <div className="hidden md:block border-t w-full border-t-indigo-200/40 mb-8"></div>

        {/* Profile with workspace indicator for desktop */}
        <div className="hidden md:block relative">
          <button
            onClick={handleWorkspaceClick}
            className="relative group"
            ref={profileButtonRef}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold border border-white"
              style={{ backgroundColor: currentWorkspace?.color || '#7C5DFA' }}
              title={currentWorkspace?.name || 'Personal'}
            >
              <span className="flex items-center justify-center w-full h-full text-center absolute inset-0 m-auto">
                {getInitials(currentWorkspace?.name || 'Personal')}
              </span>
            </div>
          </button>
        </div>

        {/* Theme toggle for mobile */}
        <button
          onClick={handleToggleTheme}
          className="md:hidden w-6 h-6 flex items-center justify-center text-white hover:text-[#DFE3FA] transition-colors mr-4"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <BiSun className="w-6 h-6 text-white cursor-pointer" />
          ) : (
            <BiMoon className="w-6 h-6 text-white cursor-pointer" />
          )}
        </button>

        {/* Mobile workspace selector (only visible on mobile) */}
        <div className="md:hidden relative">
          <button
            onClick={handleWorkspaceClick}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold border border-white relative"
            style={{ backgroundColor: currentWorkspace?.color || '#7C5DFA' }}
            aria-label="Select workspace"
            ref={mobileButtonRef}
          >
            <span className="flex items-center justify-center w-full h-full text-center absolute inset-0 m-auto">
              {getInitials(currentWorkspace?.name || 'Personal')}
            </span>
          </button>
        </div>

        {/* Workspace dropdown menu - desktop position */}
        {workspaceMenuOpen && (
          <div
            ref={desktopMenuRef}
            className="hidden md:block fixed left-28 bottom-8 w-64 bg-[#252945] rounded-md shadow-lg overflow-visible z-[100]"
            style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            {/* Arrow pointing to the profile */}
            <div className="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#252945] border-b-8 border-b-transparent"></div>

            <div className="p-2 border-b border-[#373B53]">
              <p className="text-xs text-white/70 mb-1 px-2">Current workspace</p>
              <div className="flex items-center gap-2 p-2 bg-[#2D3250] rounded-md">
                <div
                  className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-white font-bold text-xs relative"
                  style={{ backgroundColor: currentWorkspace?.color }}
                >
                  <span className="flex items-center justify-center w-full h-full text-center absolute inset-0 m-auto">
                    {getInitials(currentWorkspace?.name || 'Personal')}
                  </span>
                </div>
                <span className="text-sm text-white font-medium truncate">{currentWorkspace?.name}</span>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto py-1">
              {workspaces.filter(w => w.id !== currentWorkspace?.id).map(workspace => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-[#2D3250] transition-colors text-white"
                >
                  <div
                    className="w-5 h-5 rounded-md mr-2 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs relative"
                    style={{ backgroundColor: workspace.color }}
                  >
                    <span className="flex items-center justify-center w-full h-full text-center absolute inset-0 m-auto">
                      {getInitials(workspace.name)}
                    </span>
                  </div>
                  <span className="truncate">{workspace.name}</span>
                </button>
              ))}
            </div>

            {/* Workspace management options */}
            <div className="border-t border-[#373B53] mt-1 pt-1 pb-1 px-1">
              <Link
                to="/workspaces/new"
                className="w-full text-left px-3 py-2 text-sm flex items-center text-white hover:bg-[#2D3250] transition-colors rounded"
              >
                <BiPlus className="w-4 h-4 mr-2" />
                <span>New Workspace</span>
              </Link>
              <Link
                to="/workspaces"
                className="w-full text-left px-3 py-2 text-sm flex items-center text-white hover:bg-[#2D3250] transition-colors rounded"
              >
                <BiBuildings className="w-4 h-4 mr-2" />
                <span>Manage Workspaces</span>
              </Link>
            </div>
          </div>
        )}

        {/* Mobile workspace dropdown */}
        {workspaceMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden fixed left-0 right-0 top-16 mx-4 w-auto bg-[#252945] rounded-md shadow-lg overflow-visible z-[100]"
            style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            <div className="p-2 border-b border-[#373B53]">
              <p className="text-xs text-white/70 mb-1 px-2">Current workspace</p>
              <div className="flex items-center gap-2 p-2 bg-[#2D3250] rounded-md">
                <div
                  className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-white font-bold text-xs relative"
                  style={{ backgroundColor: currentWorkspace?.color }}
                >
                  <span className="flex items-center justify-center w-full h-full text-center absolute inset-0 m-auto">
                    {getInitials(currentWorkspace?.name || 'Personal')}
                  </span>
                </div>
                <span className="text-sm text-white font-medium truncate">{currentWorkspace?.name}</span>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto py-1">
              {workspaces.filter(w => w.id !== currentWorkspace?.id).map(workspace => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-[#2D3250] transition-colors text-white"
                >
                  <div
                    className="w-5 h-5 rounded-md mr-2 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs relative"
                    style={{ backgroundColor: workspace.color }}
                  >
                    <span className="flex items-center justify-center w-full h-full text-center absolute inset-0 m-auto">
                      {getInitials(workspace.name)}
                    </span>
                  </div>
                  <span className="truncate">{workspace.name}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-[#373B53] mt-1 pt-1 pb-1 px-1">
              <Link
                to="/workspaces/new"
                className="w-full text-left px-3 py-2 text-sm flex items-center text-white hover:bg-[#2D3250] transition-colors rounded"
              >
                <BiPlus className="w-4 h-4 mr-2" />
                <span>New Workspace</span>
              </Link>
              <Link
                to="/workspaces"
                className="w-full text-left px-3 py-2 text-sm flex items-center text-white hover:bg-[#2D3250] transition-colors rounded"
              >
                <BiBuildings className="w-4 h-4 mr-2" />
                <span>Manage Workspaces</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
