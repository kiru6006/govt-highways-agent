import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, navigationItems } from './components/Sidebar';
import { AskAIPanel } from './components/AskAIPanel';
import { Dashboard } from './pages/Dashboard';
import { MinisterDashboard } from './pages/MinisterDashboard';
import { SecretaryDashboard } from './pages/SecretaryDashboard';
import { ProjectsPage } from './pages/ProjectsPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { GovernanceRegistryPage } from './pages/GovernanceRegistryPage';
import { ProgrammeIntelligencePage } from './pages/ProgrammeIntelligencePage';
import { PlaceholderModule } from './pages/PlaceholderModule';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const currentNav = navigationItems.find((n) => n.path === location.pathname);
  const currentModuleName = currentNav ? currentNav.name : 'TN-HDOS Master Platform';

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tn_hdos_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('tn_hdos_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* 17-Module Persistent Sidebar with Category Accordion & Rail Toggle */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Government Header with RBAC Persona Switcher & Sidebar Hamburger */}
        <Header
          currentModuleName={currentModuleName}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* Dynamic Route Body */}
        <main className="flex-1 overflow-y-auto pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leadership/minister" element={<MinisterDashboard />} />
            <Route path="/leadership/secretary" element={<SecretaryDashboard />} />
            <Route path="/ckicp" element={<ProgrammeIntelligencePage />} />
            <Route path="/tnrsp" element={<ProgrammeIntelligencePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/leakage" element={<PlaceholderModule />} />
            <Route path="/project-360" element={<PlaceholderModule />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/departments" element={<PlaceholderModule />} />
            <Route path="/quality" element={<PlaceholderModule />} />
            <Route path="/finance" element={<PlaceholderModule />} />
            <Route path="/contractors" element={<PlaceholderModule />} />
            <Route path="/field-ops" element={<PlaceholderModule />} />
            <Route path="/assets" element={<PlaceholderModule />} />
            <Route path="/digital-office" element={<PlaceholderModule />} />
            <Route path="/land-utility" element={<PlaceholderModule />} />
            <Route path="/compliance" element={<GovernanceRegistryPage />} />
            <Route path="/governance" element={<GovernanceRegistryPage />} />
            <Route path="/citizen-services" element={<PlaceholderModule />} />
            <Route path="/reports" element={<PlaceholderModule />} />
            <Route path="/admin" element={<PlaceholderModule />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>

        {/* Persistent Ask AI Floating Interface */}
        <AskAIPanel currentScreenName={currentModuleName} />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppLayout />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;

