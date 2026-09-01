import React from 'react';
import { JigawaPolyLogo } from './JigawaPolyLogo';
import {
  Menu,
  X,
  User,
  ShieldCheck,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';

interface TopHeaderProps {
  onProfileClick: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onProfileClick,
  onToggleSidebar,
  isSidebarOpen = true,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) => {
  const { studentProfile, selectedTab, stages, alerts, selectTab } = useClearance();

  const completedCount = stages.filter(s => s.status === 'COMPLETED').length;
  const unreadAlertsCount = alerts.filter(a => !a.isRead || a.isUrgent).length;

  const tabTitles = [
    { title: 'Clearance Overview', subtitle: 'Digital Clearance Ledger & Progress' },
    { title: 'Clearance Stages', subtitle: '8 Institutional Directorates & Requirements' },
    { title: 'AI Clearance Advisor', subtitle: 'Intelligent Guidance & Form Assistant' },
    { title: 'Alerts & Notices', subtitle: 'Directorate Reviews & Official Updates' },
    { title: 'Student Profile', subtitle: 'Official Dossier & Verification QR Code' }
  ];

  const currentTabInfo = tabTitles[selectedTab] || tabTitles[0];

  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-md border-b border-[#E3E8F1] shadow-2xs px-3 sm:px-6 h-16 flex items-center justify-between transition-all">
      <div className="w-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Sidebar Toggle Button & Current Page Title */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Universal Sidebar Toggle Button (Desktop & Tablet) */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FF] hover:bg-[#EAEFF8] text-[#005FB0] border border-[#E3E8F1] active:scale-95 transition-all cursor-pointer shadow-2xs group"
            title={isSidebarOpen ? "Close / Collapse Sidebar" : "Open / Expand Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-[#005FB0] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold hidden lg:inline">Close Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-[#005FB0] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Open Sidebar</span>
              </>
            )}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#005FB0] bg-[#F7F9FF] border border-[#E3E8F1] hover:bg-[#EAEFF8] active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle navigation drawer"
            title="Toggle Sidebar Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile brand logo (visible on mobile only) */}
          <div
            onClick={() => selectTab(0)}
            className="md:hidden flex items-center gap-2 cursor-pointer select-none"
          >
            <JigawaPolyLogo size={34} showBorder={true} />
            <div className="flex flex-col">
              <span className="font-black text-xs text-[#005FB0] leading-none tracking-wider">JSP DUTSE</span>
              <span className="text-[9px] text-[#74777F] font-mono leading-tight">{studentProfile.matricNumber || 'ND/CTE/M/24/0001'}</span>
            </div>
          </div>

          {/* Active page title */}
          <div className="hidden md:flex flex-col">
            <h1 className="text-base font-black text-[#1B1B1F] tracking-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs text-[#74777F] font-medium">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Status & User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Clearance Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F7F9FF] border border-[#E3E8F1] rounded-2xl text-xs">
            <span className="w-2 h-2 rounded-full bg-[#1B873F] animate-pulse" />
            <span className="text-[#44474F] font-medium">Status:</span>
            <span className="font-bold text-[#005FB0]">{completedCount}/8 Cleared</span>
          </div>

          {/* Alerts notification icon shortcut */}
          <button
            onClick={() => selectTab(3)}
            className="relative p-2 rounded-xl text-[#44474F] hover:bg-[#F1F4FA] transition-colors cursor-pointer"
            title="View Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#BA1A1A] rounded-full border-2 border-white" />
            )}
          </button>

          {/* Student Profile avatar */}
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 p-1 pl-2 pr-3 bg-[#F1F4FA] hover:bg-[#E3E8F1] rounded-2xl transition-colors cursor-pointer border border-[#E3E8F1]"
            title="Open Student Profile"
          >
            <div className="w-8 h-8 rounded-xl bg-[#005FB0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {studentProfile.fullName ? studentProfile.fullName.charAt(0) : 'S'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#1B1B1F] truncate max-w-[120px]">
                {studentProfile.fullName || 'Student'}
              </span>
              <span className="text-[10px] font-mono text-[#005FB0] font-bold">
                {studentProfile.matricNumber || 'ND/CTE/M/24/0001'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
