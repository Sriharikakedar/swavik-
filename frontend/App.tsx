import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase/firebase';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import ReportView from './pages/ReportView';
import ViewReport from './pages/ViewReport';
import EditReport from './pages/EditReport';
import Settings from './pages/Settings';
import { SettingsProvider } from './context/SettingsContext';

/* ================= NAVBAR ================= */

interface NavbarProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  user: User | null;
}

interface NavbarExtendedProps extends NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarExtendedProps> = ({ isAuthenticated, setIsAuthenticated, user, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className={isAuthenticated
      ? "fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 flex items-center justify-between md:justify-end px-4 sm:px-6 lg:px-8 py-4 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border"
      : "fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border"}>

      {/* Mobile hamburger for authenticated sidebar */}
      {isAuthenticated && onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-theme-text text-xl p-2 hover:text-theme-accent transition-colors"
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
      )}

      {!isAuthenticated && (
        <div>
          <Link to="/" className="text-2xl sm:text-4xl font-black text-theme-text hover:text-theme-accent transition-colors">
            ResolveX
          </Link>
        </div>
      )}

      <div className="flex items-center space-x-4 sm:space-x-8 text-sm font-medium uppercase tracking-widest text-theme-dim">
        {!isAuthenticated && (
          <Link to="/" className="hidden sm:inline hover:text-theme-text transition-colors">Home</Link>
        )}

        {isAuthenticated ? (
          <>
            {(user || auth.currentUser) && (
              <div className="relative">
                <div
                  className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 border-l border-theme-border cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-theme-text font-bold tracking-tighter truncate max-w-[80px] sm:max-w-[120px] normal-case">
                      {(user || auth.currentUser)?.displayName || (user || auth.currentUser)?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-[8px] text-theme-accent font-black uppercase tracking-widest">PRO</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-navy border border-orange/20 flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-navy/20 uppercase">
                    {(user || auth.currentUser)?.displayName?.charAt(0) || (user || auth.currentUser)?.email?.charAt(0) || 'U'}
                  </div>
                  <i className={`fas fa-chevron-down text-theme-dim/40 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                </div>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-theme-card border border-theme-border rounded-xl shadow-2xl py-2 z-50">
                    <button
                      className="w-full text-left px-6 py-3 text-xs text-red-500 hover:text-red-400 hover:bg-theme-bg transition-colors uppercase tracking-widest font-bold"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-theme-text transition-colors">Login</Link>

            <button
              onClick={() => navigate('/register')}
              className="bg-theme-accent hover:bg-orange-dark text-white px-4 sm:px-6 py-2 rounded-full transition-all text-xs sm:text-sm"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

/* ================= SIDEBAR ================= */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path
    ? "bg-theme-bg text-theme-text border-l-4 border-theme-accent"
    : "text-white/70 hover:text-white hover:bg-white/10 border-l-4 border-transparent";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 fixed top-0 left-0 h-screen bg-navy border-r border-navy/20 flex flex-col py-8 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 text-white/60 hover:text-white text-lg"
          aria-label="Close sidebar"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="px-8 mb-12">
          <Link to="/" onClick={onClose} className="text-3xl font-black text-white hover:text-theme-accent transition-colors flex items-center gap-3">
            <i className="fas fa-layer-group text-theme-accent"></i>
            ResolveX
          </Link>
        </div>

        <div className="px-8 text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Main Navigation</div>

        <nav className="flex flex-col space-y-1 px-4 flex-grow">
          <Link to="/dashboard" onClick={onClose} className={`flex items-center space-x-4 px-4 py-3 rounded-lg uppercase text-xs font-bold tracking-widest transition-all ${isActive('/dashboard')}`}>
            <i className="fas fa-columns w-4 text-center"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/search" onClick={onClose} className={`flex items-center space-x-4 px-4 py-3 rounded-lg uppercase text-xs font-bold tracking-widest transition-all ${isActive('/search')}`}>
            <i className="fas fa-search w-4 text-center"></i>
            <span>Search</span>
          </Link>
          <Link to="/analytics" onClick={onClose} className={`flex items-center space-x-4 px-4 py-3 rounded-lg uppercase text-xs font-bold tracking-widest transition-all ${isActive('/analytics')}`}>
            <i className="fas fa-chart-line w-4 text-center"></i>
            <span>Analytics</span>
          </Link>

          <div className="pt-8 pb-4">
            <div className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Actions</div>
          </div>

          <Link to="/new-report" onClick={onClose} className={`flex items-center space-x-4 px-4 py-3 rounded-lg uppercase text-xs font-bold tracking-widest transition-all ${isActive('/new-report')}`}>
            <i className="fas fa-plus-square w-4 text-center"></i>
            <span>New Report</span>
          </Link>
        </nav>
        <div className="px-8 mt-auto flex flex-col space-y-6">
          <Link to="/settings" onClick={onClose} className={`flex items-center space-x-4 px-4 py-3 -mx-4 rounded-lg uppercase text-xs font-bold tracking-widest transition-all ${isActive('/settings')}`}>
            <i className="fas fa-cog w-4 text-center"></i>
            <span>Settings</span>
          </Link>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] font-bold text-theme-accent uppercase tracking-widest mb-1">System Status</p>
            <p className="text-xs font-black text-white flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

/* ================= FOOTER ================= */

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy py-16 text-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-32">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold">ResolveX</h2>
            <p className="mt-4 text-gray-300 text-sm leading-relaxed max-w-xs">
              AI-powered incident intelligence platform for faster resolution and smarter prevention.
            </p>
            <p className="mt-6 text-sm text-gray-400">
              © 2026 ResolveX. All rights reserved.
            </p>
          </div>

          {/* Platform */}
          <div className="md:text-center">
            <h3 className="text-sm tracking-widest text-gray-400 mb-4 uppercase font-bold">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-theme-accent transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/new-report" className="hover:text-theme-accent transition-colors">Create Report</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-theme-accent transition-colors">Search Reports</Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-theme-accent transition-colors">Analytics</Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:text-right">
            <h3 className="text-sm tracking-widest text-gray-400 mb-4 uppercase font-bold">
              Connect
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-theme-accent transition-colors cursor-pointer">LinkedIn</li>
              <li className="hover:text-theme-accent transition-colors cursor-pointer">Email Support</li>
              <li className="hover:text-theme-accent transition-colors cursor-pointer">Documentation</li>
            </ul>
          </div>

        </div>

      </div>
    </footer>
  );
};

/* ================= PROTECTION ================= */

const ProtectedRoute: React.FC<{
  children: React.ReactElement,
  isAuthenticated: boolean,
  loading: boolean
}> = ({ children, isAuthenticated, loading }) => {
  if (loading) return <div className="min-h-screen bg-theme-bg flex items-center justify-center text-theme-text font-bold">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

/* ================= APP ================= */

import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#F8F3ED',
            color: '#1A2B4C',
            border: '1px solid #1A2B4C20',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            borderRadius: '12px',
            padding: '16px 24px',
          },
          success: {
            iconTheme: {
              primary: '#D1603D',
              secondary: '#fff',
            },
          },
        }}
      />
      <AppContent />
    </SettingsProvider>
  );
};

const AppContent: React.FC = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || "https://swavik-resolvex-backend.onrender.com";
    fetch(backendUrl)
      .then(() => console.log("Backend awake"))
      .catch(() => console.log("Backend wake attempt"));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr) {
        setIsAuthenticated(true);
        setUser(usr);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-theme-bg text-theme-text transition-colors duration-300">

      {isAuthenticated && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

      <div className={`flex flex-col flex-grow min-h-screen w-full ${isAuthenticated ? 'md:ml-64' : ''}`}>

        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-grow pt-24 pb-12 w-full">

          <Routes>

            <Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />

            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />}
            />

            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register setIsAuthenticated={setIsAuthenticated} />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/new-report"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <NewReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/search"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <Search />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/report-view"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <ReportView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-report"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <ViewReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-report"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <EditReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                  <Settings />
                </ProtectedRoute>
              }
            />

          </Routes>

        </main>

        <Footer />

      </div>
    </div>
  );
};

export default App;