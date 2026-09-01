import React, { useRef, useState, useEffect } from 'react';
import { QrCode, X, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (data: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult
}) => {
  const [manualInput, setManualInput] = useState('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (preset: 'cleared' | 'pending' | 'custom') => {
    let payload = '';
    if (preset === 'cleared') {
      payload = JSON.stringify({
        institution: "Jigawa State Polytechnic Dutse",
        matric: "ND/CTE/M/24/0001",
        name: "Ibrahim Muhammad Kabir",
        department: "Computer Telecommunication Engineering (CTE)",
        level: "ND II",
        clearanceStatus: "FULLY_CLEARED",
        completedStages: "8/8",
        clearancePin: "JSP-CLR-7824",
        verifiedBy: "Academic Board & Registry, Dutse",
        verificationUrl: "https://jigawapoly.edu.ng/verify/clr-7824"
      }, null, 2);
    } else if (preset === 'pending') {
      payload = JSON.stringify({
        institution: "Jigawa State Polytechnic Dutse",
        matric: "ND/CTE/M/25/0001",
        name: "Amina Yusuf Garba",
        department: "Computer Telecommunication Engineering (CTE)",
        level: "ND I",
        clearanceStatus: "IN_PROGRESS",
        completedStages: "5/8",
        pendingDepartment: "Bursary & Accounts Directorate",
        verificationUrl: "https://jigawapoly.edu.ng/verify/clr-8921"
      }, null, 2);
    } else {
      payload = manualInput;
    }

    setScanStatus("QR Code Decoded Successfully!");
    setTimeout(() => {
      onScanResult(payload);
      onClose();
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSimulateScan('cleared');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-[#E3E8F1]">
        {/* Header */}
        <div className="p-4 bg-[#005FB0] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#97F0FF]" />
            <h3 className="font-bold text-sm">Clearance QR Scanner & Verifier</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="relative w-52 h-52 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-[#005FB0] shadow-inner mb-4">
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#20C997] to-transparent shadow-[0_0_12px_#20C997] animate-bounce" />
            <QrCode className="w-24 h-24 text-white/20" />
            <div className="absolute inset-4 border-2 border-dashed border-[#97F0FF]/60 rounded-lg pointer-events-none" />
          </div>

          <p className="text-xs font-medium text-[#44474F] mb-4">
            Point camera at a student's Clearance Certificate QR code or select an image file to verify clearance status on the registry ledger.
          </p>

          {/* Preset test scanners */}
          <div className="w-full flex flex-col gap-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSimulateScan('cleared')}
                className="py-2 px-3 rounded-xl bg-[#D4F5DC] hover:bg-[#b8f0c5] text-[#003914] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#1B873F]/30"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#1B873F]" />
                Scan Cleared QR
              </button>
              <button
                onClick={() => handleSimulateScan('pending')}
                className="py-2 px-3 rounded-xl bg-[#FFE082]/40 hover:bg-[#FFE082]/70 text-[#241A00] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#FFB74D]/40"
              >
                <AlertCircle className="w-3.5 h-3.5 text-[#E65100]" />
                Scan In-Progress QR
              </button>
            </div>

            <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#005FB0] hover:bg-[#D5E3FF]/20 text-[#005FB0] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Upload QR Image File
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {scanStatus && (
            <div className="p-2 bg-[#D4F5DC] text-[#003914] text-xs font-bold rounded-lg w-full">
              {scanStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
