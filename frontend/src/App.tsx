import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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
import { Project360Page } from './pages/Project360Page';
import { LeakageIntelligencePage } from './pages/LeakageIntelligencePage';
import { ReportsPage } from './pages/ReportsPage';
import { QualityPage } from './pages/QualityPage';
import { FieldOpsPage } from './pages/FieldOpsPage';
import { AssetsPage } from './pages/AssetsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { LandUtilityPage } from './pages/LandUtilityPage';
import { DigitalOfficePage } from './pages/DigitalOfficePage';
import { PlaceholderModule } from './pages/PlaceholderModule';
import { DemoBanner } from './components/DemoBanner';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isNavyGov } = useTheme();
  const currentNav = navigationItems.find((n) => n.path === location.pathname);
  const currentModuleName = currentNav ? currentNav.name : 'TN-HDOS Master Platform';

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tn_hdos_sidebar_collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('tn_hdos_sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  return (
    <div
      className={`flex min-h-screen font-sans transition-colors duration-200 ${
        isNavyGov ? 'bg-[#F4F7FB] text-[#1F2937]' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 17-Module Persistent Sidebar with Category Accordion, Rail Toggle & Mobile Offcanvas Drawer */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Government Header with RBAC Persona Switcher & Sidebar Hamburger */}
        <Header
          currentModuleName={currentModuleName}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* Demo mode alert banner */}
        <DemoBanner />

        {/* Dynamic Route Body */}
        <main className="flex-1 overflow-y-auto pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leadership/minister" element={<MinisterDashboard />} />
            <Route path="/leadership/secretary" element={<SecretaryDashboard />} />
            <Route path="/ckicp" element={<ProgrammeIntelligencePage />} />
            <Route path="/tnrsp" element={<ProgrammeIntelligencePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/leakage" element={<LeakageIntelligencePage />} />
            <Route path="/project-360" element={<Project360Page />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/quality" element={<QualityPage />} />
            <Route path="/finance" element={<PlaceholderModule />} />
            <Route path="/contractors" element={<PlaceholderModule />} />
            <Route path="/field-ops" element={<FieldOpsPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/digital-office" element={<DigitalOfficePage />} />
            <Route path="/land-utility" element={<LandUtilityPage />} />
            <Route path="/compliance" element={<GovernanceRegistryPage />} />
            <Route path="/governance" element={<GovernanceRegistryPage />} />
            <Route path="/citizen-services" element={<PlaceholderModule />} />
            <Route path="/reports" element={<ReportsPage />} />
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
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

