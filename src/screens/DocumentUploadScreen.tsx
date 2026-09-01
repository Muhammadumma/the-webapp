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
  Trash2
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
    studentProfile
  } = useClearance();

  const activeStageId = uploadScreenStageId || 1;
  const [selectedStageId, setSelectedStageId] = useState<number>(activeStageId);

  const stageReq = getRequirementForStage(selectedStageId);
  const currentStage = stages.find(s => s.id === selectedStageId) || stages[0];

  const [documentType, setDocumentType] = useState<string>(stageReq.primaryDocumentLabel);
  const [documentName, setDocumentName] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState<string>('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update defaults when selected stage changes
  useEffect(() => {
    const req = getRequirementForStage(selectedStageId);
    setDocumentType(req.primaryDocumentLabel);
    setDocumentName(`${studentProfile.matricNumber.replace(/\//g, '_')}_${req.primaryDocumentLabel.split(' ')[0]}.pdf`);
    setReceiptNumber(`${req.defaultReceiptPrefix}${Math.floor(100000 + Math.random() * 900000)}`);
  }, [selectedStageId, studentProfile]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFileUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageUri: string) => {
    setFileUri(imageUri);
    setDocumentName(`Camera_Receipt_${Date.now()}.jpg`);
  };

  const handleGenerateRandomReceipt = () => {
    setReceiptNumber(`${stageReq.defaultReceiptPrefix}${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim()) {
      setErrorMsg("Please specify document file or take a photo.");
      return;
    }

    submitDocument(
      selectedStageId,
      documentName,
      receiptNumber,
      paymentDate,
      documentType,
      fileUri,
      remarks
    );
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
              {stageReq.requiredDocuments.map((docItem) => (
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
            <div className="p-3 bg-[#F7F9FF] border border-[#D5E3FF] rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={fileUri}
                  alt="Receipt Preview"
                  className="w-12 h-12 object-cover rounded-xl border border-white shadow-xs"
                />
                <div className="min-w-0">
                  <span className="font-bold text-xs text-[#1B1B1F] truncate block">
                    {documentName}
                  </span>
                  <span className="text-[10px] text-[#1B873F] font-bold">Image Attached</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFileUri(null);
                  setDocumentName('');
                }}
                className="p-1.5 text-[#BA1A1A] hover:bg-[#FFDAD6] rounded-lg transition-colors"
                title="Remove photo"
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
            className="w-full py-3.5 px-4 bg-[#1B873F] hover:bg-[#157347] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4F5DC]" />
            <span>Submit for Institutional Audit</span>
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
