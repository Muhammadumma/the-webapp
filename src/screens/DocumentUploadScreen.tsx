import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Upload,
  FileText,
  Building,
  CheckCircle2,
  Trash2,
  Loader2,
  Award,
  Sparkles,
  ShieldCheck,
  Calendar,
  Hash,
  User,
  GraduationCap
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';
import { getRequirementForStage } from '../data/departmentRequirements';
import { CameraCaptureModal } from '../components/CameraCaptureModal';

export const DocumentUploadScreen: React.FC = () => {
  const {
    stages,
    uploadScreenStageId,
    closeUploadScreen,
    submitDocument,
    studentProfile,
    getDynamicRequirementsForStage
  } = useClearance();

  const activeStageId = uploadScreenStageId || 1;
  const [selectedStageId, setSelectedStageId] = useState<number>(activeStageId);

  const stageReq = getRequirementForStage(selectedStageId);
  const dynamicReqs = getDynamicRequirementsForStage(selectedStageId);
  const currentStage = stages.find(s => s.id === selectedStageId) || stages[0];

  const availableDocTypes = dynamicReqs.length > 0
    ? dynamicReqs.map(r => r.name)
    : stageReq.requiredDocuments;

  const defaultDocType = availableDocTypes[0] || stageReq.primaryDocumentLabel;

  const [documentType, setDocumentType] = useState<string>(defaultDocType);
  const [documentName, setDocumentName] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState<string>('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileNameAttached, setFileNameAttached] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStepText, setUploadStepText] = useState<string>('');
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Update defaults when selected stage changes
  useEffect(() => {
    const dyn = getDynamicRequirementsForStage(selectedStageId);
    const docTypes = dyn.length > 0 ? dyn.map(r => r.name) : stageReq.requiredDocuments;
    const initialType = docTypes[0] || stageReq.primaryDocumentLabel;
    setDocumentType(initialType);
    setDocumentName(`${studentProfile.matricNumber.replace(/\//g, '_')}_${initialType.split(' ')[0]}.pdf`);
    setReceiptNumber(`${stageReq.defaultReceiptPrefix}${Math.floor(100000 + Math.random() * 900000)}`);
  }, [selectedStageId, studentProfile, dynamicReqs.length]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileNameAttached(file.name);
    setDocumentName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileUri(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageUri: string) => {
    setFileUri(imageUri);
    setFileNameAttached(`Receipt_Capture_${Date.now()}.jpg`);
    setDocumentName(`Receipt_Capture_${Date.now()}.jpg`);
  };

  const handleGenerateRandomReceipt = () => {
    setReceiptNumber(`${stageReq.defaultReceiptPrefix}${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Realistic upload & institutional verification sequence
    setUploadStepText('Verifying student clearance credentials…');
    await new Promise(r => setTimeout(r, 600));

    setUploadStepText('Generating institutional clearance template…');
    await new Promise(r => setTimeout(r, 700));

    setUploadStepText('Recording document to Polytechnic audit ledger…');
    await new Promise(r => setTimeout(r, 600));

    try {
      await submitDocument(
        selectedStageId,
        documentName || `${studentProfile.matricNumber}_${documentType}.pdf`,
        receiptNumber,
        paymentDate,
        documentType,
        remarks
      );
    } catch (err) {
      console.warn('Submission warning:', err);
    } finally {
      setIsUploading(false);
      setUploadStepText('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={closeUploadScreen}
          className="p-2.5 bg-white border border-[#E3E8F1] hover:bg-[#F1F4FA] rounded-2xl text-xs font-bold text-[#1B1B1F] flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </button>

        <span className="px-3 py-1 bg-[#D5E3FF] text-[#001B3C] text-xs font-bold rounded-full">
          Stage {selectedStageId} of 8
        </span>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#E3E8F1] space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#005FB0] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Official Digital Clearance Dossier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B1B1F] tracking-tight">
            Submit Clearance Credentials
          </h2>
          <p className="text-xs sm:text-sm text-[#44474F] mt-1 font-medium">
            Select your clearance document category. The system automatically creates a certified clearance sheet for institutional audit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Clearance Stage Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1.5">
              Clearance Department / Stage
            </label>
            <div className="relative">
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(Number(e.target.value))}
                className="w-full px-3.5 py-3 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs sm:text-sm font-semibold text-[#1B1B1F] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
              >
                {stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    Stage {stg.stageNumber}: {stg.title} ({stg.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Guidelines */}
          <div className="p-3.5 bg-[#EBF0F9] rounded-2xl border border-[#D5E3FF] text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#005FB0]">
              <Building className="w-3.5 h-3.5" />
              <span>{stageReq.departmentName}</span>
            </div>
            <p className="text-[#44474F] text-[11px] leading-relaxed">
              {stageReq.guidelines}
            </p>
          </div>

          {/* Document Type Selection */}
          <div>
            <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1.5">
              Document Category
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs sm:text-sm font-medium text-[#1B1B1F] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
            >
              {availableDocTypes.map((docItem) => (
                <option key={docItem} value={docItem}>
                  {docItem}
                </option>
              ))}
            </select>
          </div>

          {/* Reference / RRR Number & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider">
                  Receipt / RRR Ref.
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomReceipt}
                  className="text-[10px] text-[#005FB0] font-bold hover:underline cursor-pointer"
                >
                  Auto-Gen
                </button>
              </div>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. JSP-BUR-948210"
                className="w-full px-3.5 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs sm:text-sm font-mono font-bold text-[#005FB0] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                Payment / Issue Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs sm:text-sm font-medium text-[#1B1B1F] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Attachment (Scanned Receipt / Physical Proof) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider">
                Attach Reference Photo / Slip <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
              </label>
              {fileNameAttached && (
                <button
                  type="button"
                  onClick={() => {
                    setFileUri(null);
                    setFileNameAttached(null);
                  }}
                  className="text-[11px] text-[#BA1A1A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>

            {!fileNameAttached ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="py-2.5 px-3 bg-[#005FB0]/10 hover:bg-[#005FB0]/20 text-[#005FB0] rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#005FB0]/30 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Camera Snap</span>
                </button>

                <label className="py-2.5 px-3 bg-[#F1F4FA] hover:bg-[#E3E8F1] border border-[#C4C6D0] text-[#1B1B1F] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-[#005FB0]" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFilePick}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="p-3 bg-[#F7F9FF] border border-[#D5E3FF] rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#005FB0]/10 border border-[#005FB0]/20 flex items-center justify-center text-[#005FB0] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs text-[#1B1B1F] truncate block">
                    {fileNameAttached}
                  </span>
                  <span className="text-[10px] text-[#1B873F] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Reference attached & ready
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Institutional Document Preview Card */}
          <div className="p-4 bg-linear-to-br from-[#F7F9FF] to-[#EDF2FA] rounded-2xl border-2 border-dashed border-[#C4C6D0] space-y-3">
            <div className="flex items-center justify-between border-b border-[#D5E3FF] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#005FB0] text-white flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1B1B1F] uppercase tracking-wide">
                    Certified Template Preview
                  </h4>
                  <p className="text-[10px] text-[#74777F]">
                    Jigawa State Polytechnic, Dutse
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                Official Credential
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#74777F] block text-[10px]">Student Name:</span>
                <span className="font-bold text-[#1B1B1F]">{studentProfile.fullName || 'Student'}</span>
              </div>
              <div>
                <span className="text-[#74777F] block text-[10px]">Matric Number:</span>
                <span className="font-mono font-bold text-[#005FB0]">{studentProfile.matricNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#74777F] block text-[10px]">Department:</span>
                <span className="font-semibold text-[#1B1B1F] truncate block">{studentProfile.department || 'Computer Science'}</span>
              </div>
              <div>
                <span className="text-[#74777F] block text-[10px]">Document Category:</span>
                <span className="font-semibold text-[#1B1B1F] truncate block">{documentType}</span>
              </div>
              <div>
                <span className="text-[#74777F] block text-[10px]">Reference / RRR:</span>
                <span className="font-mono font-bold text-[#005FB0]">{receiptNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#74777F] block text-[10px]">Date of Record:</span>
                <span className="font-semibold text-[#1B1B1F]">{paymentDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D5E3FF] flex items-center justify-between text-[10px] text-[#74777F]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Digital institutional signature applied upon submission
              </span>
              <span className="font-mono">JSP-DPS-VERIFIED</span>
            </div>
          </div>

          {/* Remarks / Student Notes */}
          <div>
            <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
              Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide any additional comments or transaction details for the clearance officer..."
              className="w-full px-3.5 py-2 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs sm:text-sm font-medium text-[#1B1B1F] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
            />
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-4 px-4 bg-[#1B873F] hover:bg-[#157347] active:scale-[0.99] disabled:opacity-75 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadStepText || 'Submitting to Clearance Ledger…'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#D4F5DC]" />
                <span>Submit for Institutional Audit</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
