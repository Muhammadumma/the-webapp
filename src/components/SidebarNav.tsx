import React from 'react';
import {
  LayoutGrid,
  CheckSquare,
  Sparkles,
  Bell,
  UserCheck,
  UploadCloud,
  ShieldCheck,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Plus
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';
import { JigawaPolyLogo } from './JigawaPolyLogo';

interface SidebarNavProps {
  onOpenUpload?: () => void;
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  onOpenUpload,
  onToggleSidebar,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const {
    studentProfile,
    stages,
    alerts,
    selectedTab,
    selectTab,
    openUploadScreen
  } = useClearance();

  const completedCount = stages.filter(s => s.status === 'COMPLETED').length;
  const actionRequiredCount = stages.filter(s => s.status === 'ACTION_REQUIRED').length;
  const unreadAlertsCount = alerts.filter(a => !a.isRead || a.isUrgent).length;
  const progressPercent = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  const navItems = [
    {
      id: 0,
      label: 'Home',
      sublabel: 'Dashboard & Status',
      icon: LayoutGrid,
      badge: null
    },
    {
      id: 1,
      label: 'Tasks',
      sublabel: '8 Directorate Stages',
      icon: CheckSquare,
      badge: actionRequiredCount > 0 ? `${actionRequiredCount}` : null,
      badgeColor: 'bg-[#BA1A1A] text-white'
    },
    {
      id: 2,
      label: 'AI Assistant',
      sublabel: 'Clearance Advisor',
      icon: Sparkles,
      badge: 'Gemini',
      badgeColor: 'bg-[#E0E7FF] text-[#3730A3]'
    },
    {
      id: 3,
      label: 'Alerts',
      sublabel: 'Notices & Feedback',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null,
      badgeColor: 'bg-[#BA1A1A] text-white'
    },
    {
      id: 4,
      label: 'Profile',
      sublabel: 'Dossier & QR Code',
      icon: UserCheck,
      badge: null
    }
  ];

  // Collapsed Sidebar Mode (Icon Rail)
  if (isCollapsed) {
    return (
      <aside className="w-20 shrink-0 bg-white border-r border-[#E3E8F1] flex flex-col justify-between h-screen sticky top-0 shadow-2xs z-30 select-none py-4 px-2 items-center transition-all duration-300">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo & Toggle Expand */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => selectTab(0)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="JSP Clearance Home"
            >
              <JigawaPolyLogo size={40} showBorder={true} />
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-xl hover:bg-[#F1F4FA] text-[#74777F] hover:text-[#005FB0] transition-colors cursor-pointer"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mini Progress Dot */}
          <div
            className="w-10 h-10 rounded-2xl bg-[#F7F9FF] border border-[#E3E8F1] flex flex-col items-center justify-center cursor-pointer"
            onClick={() => selectTab(0)}
            title={`Clearance Progress: ${progressPercent}% (${completedCount}/8)`}
          >
            <span className="text-[10px] font-black text-[#005FB0]">{progressPercent}%</span>
          </div>

          {/* Nav Icons */}
          <nav className="flex flex-col gap-1.5 w-full items-center pt-2">
            {navItems.map((item) => {
              const isSelected = selectedTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id)}
                  title={`${item.label} - ${item.sublabel}`}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#005FB0] text-white shadow-sm shadow-[#005FB0]/30'
                      : 'text-[#74777F] hover:bg-[#F1F4FA] hover:text-[#1B1B1F]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : ''}`} />
                  {item.badge && (
                    <span
                      className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        item.badgeColor ? 'bg-[#BA1A1A]' : 'bg-[#005FB0]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Upload Icon */}
          <button
            onClick={() => {
              if (onOpenUpload) onOpenUpload();
              else openUploadScreen(1);
            }}
            className="w-11 h-11 rounded-2xl bg-[#1B873F] text-white flex items-center justify-center hover:bg-[#157347] transition-all cursor-pointer shadow-xs"
            title="Upload Document"
          >
            <UploadCloud className="w-5 h-5 text-[#D4F5DC]" />
          </button>
        </div>

        {/* Bottom Profile Dot */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => selectTab(4)}
            className="w-10 h-10 rounded-2xl bg-[#005FB0] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-[#005FB0]/40 transition-all"
            title={`${studentProfile.fullName} (${studentProfile.matricNumber})`}
          >
            {studentProfile.fullName ? studentProfile.fullName.charAt(0) : 'S'}
          </button>
        </div>
      </aside>
    );
  }

  // Full Expanded Sidebar Mode
  return (
    <aside className="w-64 lg:w-72 shrink-0 bg-white border-r border-[#E3E8F1] flex flex-col justify-between h-screen sticky top-0 shadow-2xs z-30 select-none transition-all duration-300">
      {/* Top Section */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
        {/* Brand Header with Close / Collapse Toggle Button */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F1F4FA]">
          <div
            onClick={() => selectTab(0)}
            className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-2xl hover:bg-[#F7F9FF] transition-colors flex-1 min-w-0"
          >
            <JigawaPolyLogo size={42} showBorder={true} className="shadow-xs shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black tracking-widest text-[#005FB0] uppercase">
                JSP Dutse
              </span>
              <h1 className="text-xs sm:text-sm font-black text-[#1B1B1F] tracking-tight leading-tight truncate">
                Clearance Portal
              </h1>
              <span className="text-[10px] text-[#74777F] font-medium truncate">
                Digital Dossier Ledger
              </span>
            </div>
          </div>

          {/* Toggle / Close Sidebar Button */}
          <div className="flex items-center gap-1 shrink-0">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-2 rounded-xl text-[#74777F] hover:text-[#005FB0] hover:bg-[#F1F4FA] active:scale-95 transition-all cursor-pointer"
                title="Collapse Sidebar (Icon View)"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            )}

            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="flex p-2 rounded-xl text-[#74777F] hover:text-[#BA1A1A] hover:bg-[#FFDAD6] active:scale-95 transition-all cursor-pointer"
                title="Close / Hide Sidebar"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Clearance Progress Card in Sidebar */}
        <div className="bg-[#F7F9FF] border border-[#E3E8F1] rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#44474F]">Clearance Progress</span>
            <span className="font-black text-[#005FB0]">{progressPercent}%</span>
          </div>

          <div className="w-full bg-[#E3E8F1] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#005FB0] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#74777F] font-medium pt-0.5">
            <span>{completedCount} of 8 Cleared</span>
            <span className="font-mono font-bold text-[#1B873F]">PIN: {studentProfile.clearancePin}</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#74777F] px-3 tracking-wider block mb-1">
            Navigation Menu
          </span>
          {navItems.map((item) => {
            const isSelected = selectedTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#005FB0] text-white shadow-sm shadow-[#005FB0]/25'
                    : 'text-[#44474F] hover:bg-[#F1F4FA] hover:text-[#1B1B1F]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-white stroke-[2.5]' : 'text-[#74777F]'
                    }`}
                  />
                  <div className="flex flex-col text-left truncate">
                    <span className="truncate">{item.label}</span>
                    <span
                      className={`text-[10px] font-normal truncate ${
                        isSelected ? 'text-white/80' : 'text-[#74777F]'
                      }`}
                    >
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      isSelected
                        ? 'bg-white text-[#005FB0]'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Upload Action */}
        <div className="pt-1">
          <button
            onClick={() => {
              if (onOpenUpload) onOpenUpload();
              else openUploadScreen(1);
            }}
            className="w-full py-2.5 px-3.5 bg-[#1B873F] hover:bg-[#157347] active:scale-[0.98] text-white text-xs font-bold rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#D4F5DC]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Bottom User Card */}
      <div className="p-4 border-t border-[#E3E8F1] bg-[#F7F9FF]/70">
        {/* Student Mini Profile Info */}
        <div
          onClick={() => selectTab(4)}
          className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-[#E3E8F1] hover:border-[#005FB0]/40 transition-colors cursor-pointer shadow-2xs"
          title="Open Profile"
        >
          <div className="w-9 h-9 rounded-xl bg-[#005FB0] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {studentProfile.fullName ? studentProfile.fullName.charAt(0) : 'S'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-[#1B1B1F] truncate">
              {studentProfile.fullName || 'Student'}
            </span>
            <span className="text-[10px] font-mono text-[#005FB0] font-bold truncate">
              {studentProfile.matricNumber || 'ND/CTE/M/24/0001'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#74777F] shrink-0" />
        </div>
      </div>
    </aside>
  );
};
