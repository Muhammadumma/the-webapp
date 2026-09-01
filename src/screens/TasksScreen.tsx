import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  Building2,
  Calendar,
  Tag,
  ShieldCheck,
  Award,
  Layers
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';
import { getRequirementForStage } from '../data/departmentRequirements';
import { CertificateModal } from '../components/CertificateModal';

export const TasksScreen: React.FC = () => {
  const {
    stages,
    documents,
    openUploadScreen,
    studentProfile,
    selectTab
  } = useClearance();

  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({
    1: true,
    4: true
  });
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const toggleExpand = (stageId: number) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const completedCount = stages.filter(s => s.status === 'COMPLETED').length;
  const totalStages = stages.length || 8;
  const progressPercent = Math.round((completedCount / totalStages) * 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#D4F5DC] text-[#003914] flex items-center gap-1 border border-[#1B873F]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1B873F]" />
            COMPLETED
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#FFDAD6] text-[#410002] flex items-center gap-1 border border-[#BA1A1A]/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-[#BA1A1A]" />
            ACTION REQUIRED
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#D5E3FF] text-[#001B3C] flex items-center gap-1 border border-[#005FB0]/30">
            <Clock className="w-3.5 h-3.5 text-[#005FB0]" />
            IN REVIEW
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#FFE082]/60 text-[#241A00] flex items-center gap-1 border border-[#FFB74D]/50">
            <Layers className="w-3.5 h-3.5 text-[#005FB0]" />
            READY
          </span>
        );
      case 'LOCKED':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#E3E8F1] text-[#74777F] flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#74777F]" />
            LOCKED
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1B1B1F] tracking-tight">
          Clearance Stages
        </h2>
        <p className="text-xs sm:text-sm text-[#44474F] mt-1 font-medium">
          Upload requirements & verify clearance documents across all 8 institutional directorates.
        </p>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E3E8F1] space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#74777F] uppercase tracking-wider">
              Overall Progress
            </span>
            <h3 className="text-xl font-black text-[#005FB0]">
              {completedCount} of {totalStages} Stages Cleared ({progressPercent}%)
            </h3>
          </div>

          {progressPercent === 100 && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="py-2 px-3.5 bg-[#1B873F] hover:bg-[#157347] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View Certificate</span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-[#EBF0F9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#005FB0] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stages Accordion List */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const isExpanded = !!expandedStages[stage.id];
          const req = getRequirementForStage(stage.id);
          const stageDoc = documents.find(d => d.stageId === stage.id);

          return (
            <div
              key={stage.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                stage.status === 'ACTION_REQUIRED'
                  ? 'border-[#BA1A1A]/40 ring-1 ring-[#BA1A1A]/20'
                  : stage.status === 'COMPLETED'
                  ? 'border-[#1B873F]/30'
                  : 'border-[#E3E8F1]'
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => toggleExpand(stage.id)}
                className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F9FF] transition-colors select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Stage Number Orb */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                      stage.status === 'COMPLETED'
                        ? 'bg-[#1B873F] text-white'
                        : stage.status === 'ACTION_REQUIRED'
                        ? 'bg-[#BA1A1A] text-white'
                        : stage.status === 'LOCKED'
                        ? 'bg-[#E3E8F1] text-[#74777F]'
                        : 'bg-[#005FB0] text-white'
                    }`}
                  >
                    {stage.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : stage.status === 'LOCKED' ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      stage.stageNumber
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777F] truncate block">
                      Stage {stage.stageNumber} • {stage.department}
                    </span>
                    <h4 className="font-bold text-sm text-[#1B1B1F] truncate">{stage.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getStatusBadge(stage.status)}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#74777F]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#74777F]" />
                  )}
                </div>
              </div>

              {/* Expanded Body Content */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-[#E3E8F1] space-y-4 bg-[#FAFBFF]">
                  {/* Guidelines & Description */}
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E3E8F1] space-y-2 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#005FB0]">
                      <Building2 className="w-4 h-4" />
                      <span>{stage.department} Guidelines</span>
                    </div>
                    <p className="text-xs text-[#44474F] leading-relaxed">
                      {req.guidelines}
                    </p>
                  </div>

                  {/* Checklist of Required Documents */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474F] block">
                      Required Documentation:
                    </span>
                    <div className="space-y-1">
                      {req.requiredDocuments.map((docItem, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#1B1B1F]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#005FB0] mt-1.5 shrink-0" />
                          <span>{docItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* If Rejection or Action Required */}
                  {stage.status === 'ACTION_REQUIRED' && stage.rejectionReason && (
                    <div className="p-3.5 bg-[#FFDAD6]/60 border border-[#BA1A1A]/40 rounded-2xl text-xs space-y-1">
                      <strong className="text-[#BA1A1A] font-bold block flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Officer Feedback:
                      </strong>
                      <p className="text-[#410002]">{stage.rejectionReason}</p>
                    </div>
                  )}

                  {/* Submitted Document Information */}
                  {(stage.documentName || stageDoc) && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[#D5E3FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-5 h-5 text-[#005FB0] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#1B1B1F] block">
                            {stage.documentName || stageDoc?.fileName}
                          </span>
                          <span className="text-[11px] text-[#74777F]">
                            Ref: <code className="font-mono text-[#005FB0]">{stage.receiptNumber || stageDoc?.receiptNumber}</code> • Date: {stage.paymentDate || stageDoc?.paymentDate}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#006874] bg-[#97F0FF]/30 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                        {stage.documentStatus}
                      </span>
                    </div>
                  )}

                  {/* Action Trigger Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {stage.status === 'ACTION_REQUIRED' ? (
                      <button
                        onClick={() => openUploadScreen(stage.id)}
                        className="py-2.5 px-4 bg-[#BA1A1A] hover:bg-[#93000a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Re-upload Credentials</span>
                      </button>
                    ) : stage.status === 'COMPLETED' ? (
                      <button
                        onClick={() => openUploadScreen(stage.id)}
                        className="py-2 px-3 bg-[#EBF0F9] hover:bg-[#D5E3FF] text-[#001B3C] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Supplementary File</span>
                      </button>
                    ) : stage.status === 'LOCKED' ? (
                      <div className="text-xs text-[#74777F] italic flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Complete earlier prerequisite stages to unlock this directorate.</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => openUploadScreen(stage.id)}
                        className="py-2.5 px-4 bg-[#005FB0] hover:bg-[#004F94] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{stage.actionButtonText || 'Upload Credentials'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        profile={studentProfile}
        stages={stages}
      />
    </div>
  );
};
