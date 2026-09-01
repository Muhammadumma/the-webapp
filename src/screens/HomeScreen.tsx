import React from 'react';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  ChevronRight,
  Award,
  Layers
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';

export const HomeScreen: React.FC = () => {
  const {
    stages,
    activities,
    selectTab,
    openUploadScreen,
    studentProfile
  } = useClearance();

  const completedStagesCount = stages.filter(s => s.status === 'COMPLETED').length;
  const totalStages = stages.length || 8;
  const progressPercentage = Math.round((completedStagesCount / totalStages) * 100);
  const actionRequiredStages = stages.filter(s => s.status === 'ACTION_REQUIRED');
  const currentStageIndex = Math.min(completedStagesCount + 1, totalStages);

  // SVG Circular progress math
  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in">
      {/* Top Radial Progress Meter Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#E3E8F1] flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Radial SVG Meter */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background Track */}
            <circle
              stroke="#EBF0F9"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress Stroke */}
            <circle
              stroke="#005FB0"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-[#005FB0] font-['Space_Grotesk',sans-serif]">
              {progressPercentage}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777F]">
              Completed
            </span>
          </div>
        </div>

        {/* Status Text & Meta */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D5E3FF]/70 text-[#001B3C] rounded-full text-xs font-bold">
            <Layers className="w-3.5 h-3.5 text-[#005FB0]" />
            <span>Stage {currentStageIndex} of {totalStages} Active</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#1B1B1F] tracking-tight">
            {progressPercentage === 100
              ? 'Clearance Complete!'
              : actionRequiredStages.length > 0
              ? 'Attention Required on Documents'
              : 'Clearance In Progress'}
          </h2>

          <p className="text-xs sm:text-sm text-[#44474F] max-w-md leading-relaxed">
            {progressPercentage === 100
              ? 'All 8 departmental clearances are approved. Your official JSP Digital Certificate is ready in your Profile.'
              : `${completedStagesCount} of ${totalStages} departments verified. Review your pending tasks or consult the AI Assistant.`}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => selectTab(1)}
              className="px-4 py-2 bg-[#005FB0] hover:bg-[#004F94] active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Stages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {progressPercentage === 100 && (
              <button
                onClick={() => selectTab(4)}
                className="px-4 py-2 bg-[#1B873F] hover:bg-[#157347] active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Required / Next Steps Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-base text-[#1B1B1F] tracking-tight">
              Action Required & Next Steps
            </h3>
            {actionRequiredStages.length > 0 && (
              <span className="px-2 py-0.5 bg-[#BA1A1A] text-white text-[10px] font-bold rounded-full animate-pulse">
                {actionRequiredStages.length} Urgent
              </span>
            )}
          </div>
          <button
            onClick={() => selectTab(1)}
            className="text-xs font-bold text-[#005FB0] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {actionRequiredStages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actionRequiredStages.map(stage => (
              <div
                key={stage.id}
                className="p-4 bg-[#FFDAD6]/40 border border-[#BA1A1A]/30 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-[#BA1A1A]/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FFDAD6] text-[#BA1A1A] shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#BA1A1A]">
                      Stage {stage.stageNumber} • {stage.department}
                    </span>
                    <h4 className="font-bold text-sm text-[#1B1B1F]">{stage.title}</h4>
                    <p className="text-xs text-[#410002] mt-1 line-clamp-2">
                      {stage.rejectionReason || "Credentials need review or re-upload."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openUploadScreen(stage.id)}
                  className="w-full py-2 bg-[#BA1A1A] hover:bg-[#93000a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Re-upload Document Now</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Next Pending Stage Card */
          (() => {
            const nextPending = stages.find(s => s.status === 'READY' || (s.status === 'PENDING' && s.documentStatus === 'NOT_UPLOADED'));
            if (!nextPending) return (
              <div className="p-4 bg-[#D4F5DC]/40 border border-[#1B873F]/30 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1B873F]" />
                <span className="text-xs font-bold text-[#003914]">
                  All current clearance stages have been submitted and are under review!
                </span>
              </div>
            );
            return (
              <div className="p-4 bg-white border border-[#E3E8F1] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#D5E3FF] text-[#005FB0] shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#005FB0]">
                        Next • Stage {nextPending.stageNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-[#EBF0F9] text-[#001B3C] text-[9px] font-bold rounded-md">
                        {nextPending.department}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1B1B1F] mt-0.5">{nextPending.title}</h4>
                    <p className="text-xs text-[#44474F] mt-0.5 line-clamp-1">{nextPending.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => openUploadScreen(nextPending.id)}
                  className="w-full sm:w-auto py-2.5 px-4 bg-[#005FB0] hover:bg-[#004F94] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Requirements</span>
                </button>
              </div>
            );
          })()
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Talk to AI Assistant */}
        <div
          onClick={() => selectTab(2)}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#005FB0] to-[#004F58] text-white shadow-md hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#97F0FF]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#97F0FF]">
                Smart Clearance Agent
              </span>
            </div>
            <h4 className="text-base font-black">AI Clearance Assistant</h4>
            <p className="text-xs text-white/80">Ask questions about requirements, fees, or issues.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Direct Upload Document */}
        <div
          onClick={() => openUploadScreen(1)}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#0F5132] to-[#198754] text-white shadow-md hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#D4F5DC]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4F5DC]">
                Digital Dossier
              </span>
            </div>
            <h4 className="text-base font-black">Upload Document / Receipt</h4>
            <p className="text-xs text-white/80">Snap camera photo or upload PDF/JPG receipt.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E3E8F1] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E8F1] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#005FB0]" />
            <h3 className="font-black text-sm text-[#1B1B1F] tracking-tight">Recent Clearance Activity</h3>
          </div>
          <button
            onClick={() => selectTab(3)}
            className="text-xs font-bold text-[#005FB0] hover:underline cursor-pointer"
          >
            View Alerts
          </button>
        </div>

        <div className="divide-y divide-[#E3E8F1]">
          {activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  activity.status === 'COMPLETED'
                    ? 'bg-[#1B873F]'
                    : activity.status === 'ACTION_REQUIRED'
                    ? 'bg-[#BA1A1A]'
                    : 'bg-[#005FB0]'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-bold text-xs text-[#1B1B1F] truncate">{activity.title}</h5>
                  <span className="text-[10px] text-[#74777F] shrink-0 font-medium">{activity.timeAgo}</span>
                </div>
                <p className="text-xs text-[#44474F] mt-0.5 line-clamp-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
