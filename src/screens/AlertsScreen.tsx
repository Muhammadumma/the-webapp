import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  Check,
  Filter
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';

export const AlertsScreen: React.FC = () => {
  const {
    alerts,
    markAlertRead,
    openUploadScreen
  } = useClearance();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'URGENT' | 'UNREAD'>('ALL');

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'URGENT') return alert.isUrgent;
    if (activeFilter === 'UNREAD') return !alert.isRead;
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B1B1F] tracking-tight">
            Clearance Alerts
          </h2>
          <p className="text-xs sm:text-sm text-[#44474F] mt-1 font-medium">
            Administrative notices, approval confirmations, and required document updates.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-[#EBF0F9] p-1 rounded-2xl border border-[#E3E8F1] self-start sm:self-auto">
          {(['ALL', 'URGENT', 'UNREAD'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#005FB0] text-white shadow-xs'
                  : 'text-[#44474F] hover:text-[#005FB0]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-[#E3E8F1] text-center space-y-2">
            <Bell className="w-10 h-10 text-[#C4C6D0] mx-auto" />
            <h4 className="font-bold text-sm text-[#1B1B1F]">No notifications in this category</h4>
            <p className="text-xs text-[#74777F]">You are completely up to date with your clearance ledger.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.isUrgent
                  ? 'border-[#BA1A1A]/40 bg-[#FFF8F7]'
                  : !alert.isRead
                  ? 'border-[#005FB0]/40 bg-[#FAFBFF]'
                  : 'border-[#E3E8F1]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    alert.isUrgent
                      ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                      : !alert.isRead
                      ? 'bg-[#D5E3FF] text-[#005FB0]'
                      : 'bg-[#F1F4FA] text-[#74777F]'
                  }`}
                >
                  {alert.isUrgent ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#1B1B1F]">{alert.title}</h4>
                    {alert.isUrgent && (
                      <span className="px-2 py-0.5 bg-[#BA1A1A] text-white text-[9px] font-black uppercase rounded-full">
                        Urgent
                      </span>
                    )}
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#005FB0]" />
                    )}
                  </div>
                  <p className="text-xs text-[#44474F] leading-relaxed max-w-xl">
                    {alert.description}
                  </p>
                  <span className="text-[10px] text-[#74777F] font-medium block pt-1">
                    {alert.timeAgo}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {alert.isUrgent && alert.stageId && (
                  <button
                    onClick={() => openUploadScreen(alert.stageId || 1)}
                    className="py-2 px-3 bg-[#BA1A1A] hover:bg-[#93000a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Resolve Now</span>
                  </button>
                )}

                {!alert.isRead && (
                  <button
                    onClick={() => markAlertRead(alert.id)}
                    className="py-2 px-3 bg-[#EBF0F9] hover:bg-[#D5E3FF] text-[#001B3C] text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5 text-[#005FB0]" />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
