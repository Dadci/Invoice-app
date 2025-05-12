import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../store/themeSlice";
import { setCurrentWorkspace } from "../store/workspacesSlice";
import { setActiveWorkspaceInvoices } from "../store/invoicesSlice";
import { setActiveWorkspaceProjects } from "../store/projectsSlice";
import { setActiveWorkspaceSettings } from "../store/settingsSlice";
import logo from "../assets/logo.svg";
import {
  BiFolder,
  BiHome,
  BiCog,
  BiSun,
  BiMoon,
  BiBuildings,
  BiPlus,
  BiChevronDown,
  BiSearch,
  BiCheck
} from "react-icons/bi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.theme);
  const { workspaces, currentWorkspace } = useSelector(state => state.workspaces);
  const navigate = useNavigate();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const desktopMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const mobileButtonRef = useRef(null);
  const searchInputRef = useRef(null);

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
        setSearchText("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when menu opens
  useEffect(() => {
    if (workspaceMenuOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [workspaceMenuOpen]);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleWorkspaceClick = () => {
    setWorkspaceMenuOpen(!workspaceMenuOpen);
    setSearchText("");
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
    setSearchText("");

    // Navigate directly to dashboard without delay
    console.log(`Switching to workspace ${workspace.id} from sidebar and navigating to dashboard`);
    navigate('/');
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  // Filter workspaces based on search text
  const filteredWorkspaces = workspaces.filter(w => {
    if (!searchText.trim()) return true;
    return w.name.toLowerCase().includes(searchText.toLowerCase());
  });

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
            aria-label="Select workspace"
          >
            {/* Improved workspace icon */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold border-2 border-white/50 shadow-md transition-all duration-200 transform group-hover:scale-105"
                style={{ backgroundColor: currentWorkspace?.color || '#7C5DFA' }}
                title={currentWorkspace?.name || 'Personal'}
              >
                <span className="text-sm">
                  {getInitials(currentWorkspace?.name || 'Personal')}
                </span>
              </div>
              <div className="flex items-center mt-1 text-white/70 text-xs font-medium">
                <BiChevronDown className={`w-4 h-4 transition-transform duration-300 ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
              </div>
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
            className="group flex items-center gap-1"
            aria-label="Select workspace"
            ref={mobileButtonRef}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold border-2 border-white/50 shadow-md transition-all duration-200"
              style={{ backgroundColor: currentWorkspace?.color || '#7C5DFA' }}
            >
              <span className="text-xs">
                {getInitials(currentWorkspace?.name || 'Personal')}
              </span>
            </div>
            <BiChevronDown className={`w-4 h-4 text-white transition-transform duration-300 ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Workspace dropdown menu - desktop position */}
        {workspaceMenuOpen && (
          <div
            ref={desktopMenuRef}
            className="hidden md:block fixed left-28 bottom-8 w-72 bg-light-card dark:bg-[#252945] rounded-md shadow-lg overflow-visible z-[100]"
            style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            {/* Arrow pointing to the profile */}
            <div className="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-light-card dark:border-r-[#252945] border-b-8 border-b-transparent"></div>

            <div className="p-3 border-b border-light-border dark:border-[#373B53]">
              <p className="text-xs text-light-text-secondary dark:text-white/70 mb-2 font-medium">Current workspace</p>
              <div className="flex items-center gap-3 p-2 bg-light-bg dark:bg-[#2D3250] rounded-md">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm relative"
                  style={{ backgroundColor: currentWorkspace?.color }}
                >
                  {getInitials(currentWorkspace?.name || 'Personal')}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-md flex items-center justify-center border-2 border-light-card dark:border-[#2D3250]">
                    <BiCheck size={9} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="block text-sm text-light-text dark:text-white font-medium truncate">{currentWorkspace?.name}</span>
                  <span className="text-xs text-light-text-secondary dark:text-white/50">Active workspace</span>
                </div>
              </div>
            </div>

            {/* Search input */}
            <div className="p-3 border-b border-light-border dark:border-[#373B53]">
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-white/50" size={16} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-light-border dark:border-[#373B53] bg-light-bg dark:bg-[#1E2139] text-light-text dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7C5DFA]"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {filteredWorkspaces.length > 0 ? (
                <div className="py-2">
                  {filteredWorkspaces
                    .filter(w => w.id !== currentWorkspace?.id)
                    .map(workspace => (
                      <button
                        key={workspace.id}
                        onClick={() => handleWorkspaceSelect(workspace)}
                        className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-light-bg dark:hover:bg-[#2D3250] transition-colors text-light-text dark:text-white"
                      >
                        <div
                          className="w-7 h-7 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                          style={{ backgroundColor: workspace.color }}
                        >
                          {getInitials(workspace.name)}
                        </div>
                        <span className="truncate">{workspace.name}</span>
                      </button>
                    ))
                  }
                </div>
              ) : searchText ? (
                <div className="py-6 text-center text-light-text-secondary dark:text-white/50 text-sm">
                  No workspaces match your search
                </div>
              ) : (
                <div className="py-4 text-center text-light-text-secondary dark:text-white/50 text-sm">
                  No other workspaces available
                </div>
              )}
            </div>

            {/* Workspace management options */}
            <div className="border-t border-light-border dark:border-[#373B53] py-2 px-2">
              <Link
                to="/workspaces/new"
                className="w-full text-left px-3 py-2.5 text-sm flex items-center text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-[#2D3250] transition-colors rounded-md"
              >
                <div className="w-7 h-7 rounded-lg bg-[#7C5DFA]/20 flex items-center justify-center mr-3">
                  <BiPlus className="w-4 h-4 text-[#7C5DFA]" />
                </div>
                <span>New Workspace</span>
              </Link>
              <Link
                to="/workspaces"
                className="w-full text-left px-3 py-2.5 text-sm flex items-center text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-[#2D3250] transition-colors rounded-md"
              >
                <div className="w-7 h-7 rounded-lg bg-[#7C5DFA]/20 flex items-center justify-center mr-3">
                  <BiBuildings className="w-4 h-4 text-[#7C5DFA]" />
                </div>
                <span>Manage Workspaces</span>
              </Link>
            </div>
          </div>
        )}

        {/* Mobile workspace dropdown */}
        {workspaceMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden fixed left-0 right-0 top-16 mx-4 w-auto bg-light-card dark:bg-[#252945] rounded-md shadow-lg overflow-visible z-[100]"
            style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            <div className="p-3 border-b border-light-border dark:border-[#373B53]">
              <p className="text-xs text-light-text-secondary dark:text-white/70 mb-2 font-medium">Current workspace</p>
              <div className="flex items-center gap-3 p-2 bg-light-bg dark:bg-[#2D3250] rounded-md">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm relative"
                  style={{ backgroundColor: currentWorkspace?.color }}
                >
                  {getInitials(currentWorkspace?.name || 'Personal')}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-md flex items-center justify-center border-2 border-light-card dark:border-[#2D3250]">
                    <BiCheck size={9} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="block text-sm text-light-text dark:text-white font-medium truncate">{currentWorkspace?.name}</span>
                  <span className="text-xs text-light-text-secondary dark:text-white/50">Active workspace</span>
                </div>
              </div>
            </div>

            {/* Search input for mobile */}
            <div className="p-3 border-b border-light-border dark:border-[#373B53]">
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-white/50" size={16} />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-light-border dark:border-[#373B53] bg-light-bg dark:bg-[#1E2139] text-light-text dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7C5DFA]"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {filteredWorkspaces.length > 0 ? (
                <div className="py-2">
                  {filteredWorkspaces
                    .filter(w => w.id !== currentWorkspace?.id)
                    .map(workspace => (
                      <button
                        key={workspace.id}
                        onClick={() => handleWorkspaceSelect(workspace)}
                        className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-light-bg dark:hover:bg-[#2D3250] transition-colors text-light-text dark:text-white"
                      >
                        <div
                          className="w-7 h-7 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                          style={{ backgroundColor: workspace.color }}
                        >
                          {getInitials(workspace.name)}
                        </div>
                        <span className="truncate">{workspace.name}</span>
                      </button>
                    ))
                  }
                </div>
              ) : searchText ? (
                <div className="py-6 text-center text-light-text-secondary dark:text-white/50 text-sm">
                  No workspaces match your search
                </div>
              ) : (
                <div className="py-4 text-center text-light-text-secondary dark:text-white/50 text-sm">
                  No other workspaces available
                </div>
              )}
            </div>

            <div className="border-t border-light-border dark:border-[#373B53] py-2 px-2">
              <Link
                to="/workspaces/new"
                className="w-full text-left px-3 py-2.5 text-sm flex items-center text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-[#2D3250] transition-colors rounded-md"
              >
                <div className="w-7 h-7 rounded-lg bg-[#7C5DFA]/20 flex items-center justify-center mr-3">
                  <BiPlus className="w-4 h-4 text-[#7C5DFA]" />
                </div>
                <span>New Workspace</span>
              </Link>
              <Link
                to="/workspaces"
                className="w-full text-left px-3 py-2.5 text-sm flex items-center text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-[#2D3250] transition-colors rounded-md"
              >
                <div className="w-7 h-7 rounded-lg bg-[#7C5DFA]/20 flex items-center justify-center mr-3">
                  <BiBuildings className="w-4 h-4 text-[#7C5DFA]" />
                </div>
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
