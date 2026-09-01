import React, { useState, useEffect } from 'react';
import { ClearanceProvider, useClearance } from './context/ClearanceContext';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { SidebarNav } from './components/SidebarNav';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TasksScreen } from './screens/TasksScreen';
import { AiAssistantScreen } from './screens/AiAssistantScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { DocumentUploadScreen } from './screens/DocumentUploadScreen';

const ClearanceMainLayout: React.FC = () => {
  const {
    studentProfile,
    selectedTab,
    selectTab,
    uploadScreenStageId,
    openUploadScreen
  } = useClearance();

  // Desktop & Mobile Sidebar State
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('jsp_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('jsp_sidebar_collapsed');
    return saved === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('jsp_sidebar_open', String(isDesktopSidebarOpen));
  }, [isDesktopSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('jsp_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // If student is not logged in, show Auth / Registration flow
  if (!studentProfile.isLoggedIn) {
    return <AuthScreen />;
  }

  // Render current selected tab matching Jetpack Compose BottomNav index
  const renderTabScreen = () => {
    if (uploadScreenStageId !== null) {
      return <DocumentUploadScreen />;
    }

    switch (selectedTab) {
      case 0:
        return <HomeScreen />;
      case 1:
        return <TasksScreen />;
      case 2:
        return <AiAssistantScreen />;
      case 3:
        return <AlertsScreen />;
      case 4:
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const handleToggleSidebar = () => {
    setIsDesktopSidebarOpen(prev => !prev);
  };

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FF] flex font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* Desktop Sidebar (Toggleable Open/Close or Collapsed Rail) */}
      {isDesktopSidebarOpen && (
        <div className="hidden md:flex shrink-0 transition-all duration-300">
          <SidebarNav
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onToggleSidebar={handleToggleSidebar}
            onOpenUpload={() => openUploadScreen(1)}
          />
        </div>
      )}

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 h-full bg-white shadow-2xl flex flex-col">
            <SidebarNav
              onToggleSidebar={() => setIsMobileMenuOpen(false)}
              onOpenUpload={() => {
                setIsMobileMenuOpen(false);
                openUploadScreen(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader
          isSidebarOpen={isDesktopSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onProfileClick={() => {
            setIsMobileMenuOpen(false);
            selectTab(4);
          }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 w-full overflow-y-auto">
          {renderTabScreen()}
        </main>

        {/* Mobile-only Bottom Navigation for quick thumb-reach */}
        <div className="md:hidden">
          <BottomNav selectedIndex={selectedTab} onTabSelected={selectTab} />
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ClearanceProvider>
      <ClearanceMainLayout />
    </ClearanceProvider>
  );
}

export default App;
