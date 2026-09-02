import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Upload,
  FileText,
  Calendar,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  Trash2,
  Loader2
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';
import { getRequirementForStage, departmentRequirements } from '../data/departmentRequirements';
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
  const [fileUri, setFileUri] = useState<string | null>(null);         // local preview URI
  const [pickedFile, setPickedFile] = useState<File | null>(null);     // raw File for GitHub upload
  const [fileSizeKB, setFileSizeKB] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    // GitHub Contents API limit is 25 MB per file
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(`File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. GitHub allows a maximum of 25 MB per file.`);
      return;
    }
    setErrorMsg(null);
    setFileSizeKB(Math.round(file.size / 1024));
    setDocumentName(file.name);
    setPickedFile(file);
    // Show a local preview
    const reader = new FileReader();
    reader.onload = () => setFileUri(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageUri: string) => {
    setErrorMsg(null);
    const approxKB = Math.round((imageUri.length * 0.75) / 1024);
    setFileSizeKB(approxKB);
    setFileUri(imageUri);
    setPickedFile(null); // camera gives a data URI, not a File
    setDocumentName(`Receipt_Capture_${Date.now()}.jpg`);
  };

  const handleGenerateRandomReceipt = () => {
    setReceiptNumber(`${stageReq.defaultReceiptPrefix}${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim() && !pickedFile && !fileUri) {
      setErrorMsg('Please attach a file or capture a photo before submitting.');
      return;
    }
    setErrorMsg(null);
    setIsUploading(true);
    try {
      await submitDocument(
        selectedStageId,
        documentName,
        receiptNumber,
        paymentDate,
        documentType,
        fileUri,       // fallback data URI for camera captures
        remarks,
        pickedFile     // preferred: actual File object → uploaded to GitHub
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
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

      {/* Main Upload Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#E3E8F1] space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B1B1F] tracking-tight">
            Submit Clearance Credentials
          </h2>
          <p className="text-xs sm:text-sm text-[#44474F] mt-1 font-medium">
            Upload verified receipts, letters, or sign-off forms to the digital clearance ledger.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FFDAD6] text-[#410002] rounded-xl text-xs font-medium flex items-center gap-2 border border-[#BA1A1A]/30">
            <AlertCircle className="w-4 h-4 text-[#BA1A1A]" />
            <span>{errorMsg}</span>
          </div>
        )}

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

          {/* Department Guidelines Snippet */}
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

          {/* Upload Method: Snap Photo or Select File */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider">
              Document File / Photo
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="py-3 px-4 bg-[#005FB0] hover:bg-[#004F94] active:scale-98 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#97F0FF]" />
                <span>Camera Snap</span>
              </button>

              <label className="py-3 px-4 bg-[#F1F4FA] hover:bg-[#E3E8F1] active:scale-98 border border-[#C4C6D0] text-[#1B1B1F] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
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
          </div>

          {/* Document Preview Box */}
          {fileUri ? (
            <div className="p-3.5 bg-[#F7F9FF] border border-[#D5E3FF] rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {fileUri.startsWith('data:image') ? (
                  <img
                    src={fileUri}
                    alt="Receipt Preview"
                    className="w-12 h-12 object-cover rounded-xl border border-white shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#005FB0]/10 border border-[#005FB0]/30 flex items-center justify-center text-[#005FB0] shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="font-bold text-xs text-[#1B1B1F] truncate block">
                    {documentName}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#1B873F] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready for upload
                    </span>
                    {fileSizeKB > 0 && (
                      <span className="text-[10px] text-[#74777F] font-mono">
                        ({fileSizeKB} KB / 1024 KB max)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFileUri(null);
                  setDocumentName('');
                  setFileSizeKB(0);
                }}
                className="p-1.5 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded-lg transition-colors cursor-pointer"
                title="Remove attached file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                Document File Name
              </label>
              <input
                type="text"
                required
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. clearance_jamb_admission.pdf"
                className="w-full px-3.5 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs sm:text-sm font-medium text-[#1B1B1F] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
              />
            </div>
          )}

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
                  className="text-[10px] text-[#005FB0] font-bold hover:underline"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 px-4 bg-[#1B873F] hover:bg-[#157347] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to GitHub…</span>
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
