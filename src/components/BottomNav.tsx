import React from 'react';
import {
  LayoutGrid,
  CheckSquare,
  Sparkles,
  Bell,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';

interface BottomNavProps {
  selectedIndex: number;
  onTabSelected: (index: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ selectedIndex, onTabSelected }) => {
  const { alerts, stages } = useClearance();

  const unreadAlertsCount = alerts.filter(a => !a.isRead || a.isUrgent).length;
  const actionRequiredCount = stages.filter(s => s.status === 'ACTION_REQUIRED').length;

  const navItems = [
    { title: "HOME", icon: LayoutGrid, tag: "nav_home", badge: 0 },
    { title: "TASKS", icon: CheckSquare, tag: "nav_tasks", badge: actionRequiredCount },
    { title: "AI", icon: Sparkles, tag: "nav_ai", badge: 0 },
    { title: "ALERTS", icon: Bell, tag: "nav_alerts", badge: unreadAlertsCount },
    { title: "PROFILE", icon: UserCheck, tag: "nav_profile", badge: 0 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-lg border-t border-[#E3E8F1] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 sm:px-6 h-18 flex items-center justify-around">
      <div className="max-w-md md:max-w-xl mx-auto w-full flex items-center justify-around">
        {navItems.map((item, index) => {
          const isSelected = selectedIndex === index;
          const IconComponent = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => onTabSelected(index)}
              data-testid={item.tag}
              className="group relative flex flex-col items-center justify-center flex-1 py-1.5 focus:outline-hidden transition-transform active:scale-95 select-none"
            >
              <div
                className={`relative px-4 py-1.5 rounded-xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#D5E3FF]/70 text-[#005FB0] font-bold shadow-xs'
                    : 'text-[#44474F] hover:text-[#005FB0] hover:bg-[#F1F4FA]'
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 transition-transform ${
                    isSelected ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />

                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#BA1A1A] text-white text-[10px] font-bold flex items-center justify-center border border-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-bold tracking-wider mt-1 transition-colors ${
                  isSelected ? 'text-[#005FB0] font-black' : 'text-[#74777F]'
                }`}
              >
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
