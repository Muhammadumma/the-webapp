import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  User,
  Badge,
  School,
  GraduationCap,
  Calendar,
  Key,
  QrCode,
  Scan,
  ShieldCheck,
  Award,
  RefreshCw,
  LogOut,
  Edit,
  CheckCircle2,
  XCircle,
  Maximize2,
  Lock,
  Layers
} from 'lucide-react';
import { useClearance } from '../context/ClearanceContext';
import { JigawaPolyLogo } from '../components/JigawaPolyLogo';
import { CertificateModal } from '../components/CertificateModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { jigawaPolyDepartments } from '../data/departmentRequirements';

export const ProfileScreen: React.FC = () => {
  const {
    studentProfile,
    stages,
    resetDemoData,
    logoutStudent,
    updateStudentProfile
  } = useClearance();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showEnlargeQr, setShowEnlargeQr] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Edit Profile Form state
  const [editName, setEditName] = useState(studentProfile.fullName);
  const [editDept, setEditDept] = useState(studentProfile.department);
  const [editLevel, setEditLevel] = useState(studentProfile.level);
  const [editSession, setEditSession] = useState(studentProfile.session);

  const completedCount = stages.filter(s => s.status === 'COMPLETED').length;
  const isFullyCleared = completedCount === stages.length && stages.length > 0;

  // Generate QR Code payload whenever stages or profile update
  useEffect(() => {
    const payload = JSON.stringify({
      institution: "Jigawa State Polytechnic Dutse",
      studentName: studentProfile.fullName,
      matricNumber: studentProfile.matricNumber,
      department: studentProfile.department,
      level: studentProfile.level,
      clearanceStatus: isFullyCleared ? "COMPLETED_APPROVED" : "IN_PROGRESS",
      completedStages: `${completedCount}/${stages.length}`,
      clearancePin: studentProfile.clearancePin,
      lastUpdated: new Date().toISOString()
    });

    QRCode.toDataURL(payload, { width: 300, margin: 1, color: { dark: '#005FB0', light: '#FFFFFF' } })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [studentProfile, stages, isFullyCleared, completedCount]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile({
      fullName: editName,
      department: editDept,
      level: editLevel,
      session: editSession
    });
    setShowEditProfile(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B1B1F] tracking-tight">
            Student Profile & Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#44474F] mt-0.5 font-medium">
            Personal identity credentials, digital clearance dossier & verification QR.
          </p>
        </div>

        <button
          onClick={() => {
            setEditName(studentProfile.fullName);
            setEditDept(studentProfile.department);
            setEditLevel(studentProfile.level);
            setEditSession(studentProfile.session);
            setShowEditProfile(true);
          }}
          className="p-2.5 bg-white border border-[#E3E8F1] hover:bg-[#F1F4FA] rounded-2xl text-xs font-bold text-[#005FB0] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">Edit Profile</span>
        </button>
      </div>

      {/* Main Student Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#E3E8F1] space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <JigawaPolyLogo size={80} showBorder={true} className="shadow-md" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1B873F] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#1B1B1F]">
                {studentProfile.fullName}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#D5E3FF] text-[#001B3C]">
                {studentProfile.role}
              </span>
            </div>

            <p className="text-xs font-mono font-bold text-[#005FB0]">
              {studentProfile.matricNumber}
            </p>
            <p className="text-xs text-[#74777F]">{studentProfile.email}</p>
          </div>

          <div className="p-3 bg-[#F1F4FA] rounded-2xl border border-[#E3E8F1] text-center min-w-[140px]">
            <span className="text-[10px] uppercase font-bold text-[#74777F] block">Clearance PIN</span>
            <span className="text-sm font-mono font-black text-[#1B873F] tracking-wider block mt-0.5">
              {studentProfile.clearancePin}
            </span>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#E3E8F1] text-xs">
          <div className="p-3.5 bg-[#F7F9FF] rounded-2xl border border-[#E3E8F1] space-y-1">
            <div className="flex items-center gap-1.5 text-[#005FB0] font-bold">
              <School className="w-4 h-4" />
              <span>Department</span>
            </div>
            <p className="font-semibold text-[#1B1B1F] truncate" title={studentProfile.department}>
              {studentProfile.department}
            </p>
          </div>

          <div className="p-3.5 bg-[#F7F9FF] rounded-2xl border border-[#E3E8F1] space-y-1">
            <div className="flex items-center gap-1.5 text-[#005FB0] font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>Academic Level</span>
            </div>
            <p className="font-semibold text-[#1B1B1F]">{studentProfile.level}</p>
          </div>

          <div className="p-3.5 bg-[#F7F9FF] rounded-2xl border border-[#E3E8F1] space-y-1">
            <div className="flex items-center gap-1.5 text-[#005FB0] font-bold">
              <Calendar className="w-4 h-4" />
              <span>Session</span>
            </div>
            <p className="font-semibold text-[#1B1B1F] truncate">{studentProfile.session}</p>
          </div>

          <div className="p-3.5 bg-[#F7F9FF] rounded-2xl border border-[#E3E8F1] space-y-1">
            <div className="flex items-center gap-1.5 text-[#005FB0] font-bold">
              <Layers className="w-4 h-4" />
              <span>Status</span>
            </div>
            <p className="font-bold text-[#1B873F]">{completedCount}/8 Cleared</p>
          </div>
        </div>
      </div>

      {/* QR Code & Official Clearance Dossier Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#E3E8F1] flex flex-col md:flex-row items-center justify-between gap-6">
        {/* QR Code preview */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div
            onClick={() => setShowEnlargeQr(true)}
            className="p-3 bg-white border-2 border-[#005FB0] rounded-2xl shadow-md cursor-pointer hover:scale-105 transition-transform group relative"
            title="Click to enlarge QR Code"
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Clearance QR" className="w-36 h-36 object-contain" />
            ) : (
              <div className="w-36 h-36 bg-slate-100 rounded-xl animate-pulse" />
            )}
            <div className="absolute inset-0 bg-[#005FB0]/10 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-6 h-6 text-[#005FB0]" />
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#005FB0] uppercase tracking-wider">
            Clearance Verification Seal
          </span>
        </div>

        {/* Dossier info & Action buttons */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="space-y-1">
            <h4 className="text-lg font-black text-[#1B1B1F]">
              JSP Digital Verification QR & Certificate
            </h4>
            <p className="text-xs text-[#44474F] leading-relaxed">
              This dynamic QR code encapsulates your authenticated clearance signature across all 8 polytechnic departments. Can be scanned by registry officials at convocation or NYSC desk.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="py-2.5 px-4 bg-[#005FB0] hover:bg-[#004F94] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#97F0FF]" />
              <span>View Official Certificate</span>
            </button>

            <button
              onClick={() => setShowScanner(true)}
              className="py-2.5 px-4 bg-[#EBF0F9] hover:bg-[#D5E3FF] text-[#001B3C] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Scan className="w-4 h-4 text-[#005FB0]" />
              <span>Verify / Scan QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scanned QR Inspection Result */}
      {scannedResult && (
        <div className="bg-[#D4F5DC]/40 border border-[#1B873F]/40 rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#003914]">
              <CheckCircle2 className="w-4 h-4 text-[#1B873F]" />
              <span>Scanned Registry Payload Verified</span>
            </div>
            <button
              onClick={() => setScannedResult(null)}
              className="text-xs text-[#74777F] hover:underline"
            >
              Dismiss
            </button>
          </div>
          <pre className="p-3 bg-white rounded-xl border border-[#1B873F]/20 text-[11px] font-mono overflow-x-auto text-[#1B1B1F]">
            {scannedResult}
          </pre>
        </div>
      )}

      {/* Account Actions (Reset / Logout) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={resetDemoData}
          className="py-2.5 px-4 bg-white border border-[#E3E8F1] hover:bg-[#F1F4FA] rounded-2xl text-xs font-bold text-[#44474F] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-4 h-4 text-[#005FB0]" />
          <span>Reset Clearance Ledger</span>
        </button>

        <button
          onClick={logoutStudent}
          className="py-2.5 px-4 bg-[#FFDAD6]/60 hover:bg-[#FFDAD6] border border-[#BA1A1A]/30 rounded-2xl text-xs font-bold text-[#BA1A1A] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>

      {/* Enlarged QR Modal */}
      {showEnlargeQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#E3E8F1]">
            <h3 className="font-black text-base text-[#1B1B1F]">Clearance QR Code</h3>
            <div className="p-4 bg-white border-2 border-[#005FB0] rounded-2xl inline-block shadow-inner">
              <img src={qrDataUrl} alt="Clearance QR Enlarge" className="w-56 h-56 object-contain" />
            </div>
            <p className="text-xs font-mono font-bold text-[#005FB0]">{studentProfile.matricNumber}</p>
            <button
              onClick={() => setShowEnlargeQr(false)}
              className="w-full py-2.5 bg-[#005FB0] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E3E8F1]">
            <h3 className="font-black text-base text-[#1B1B1F] mb-4">Edit Student Details</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#44474F] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#C4C6D0] rounded-xl text-sm text-[#1B1B1F] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#44474F] uppercase mb-1">Department</label>
                <select
                  value={editDept}
                  onChange={e => setEditDept(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#C4C6D0] rounded-xl text-xs text-[#1B1B1F] focus:ring-2 focus:ring-[#005FB0] focus:outline-hidden"
                >
                  {jigawaPolyDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#44474F] uppercase mb-1">Level</label>
                  <select
                    value={editLevel}
                    onChange={e => setEditLevel(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#C4C6D0] rounded-xl text-xs text-[#1B1B1F]"
                  >
                    <option value="ND I">ND I</option>
                    <option value="ND II">ND II</option>
                    <option value="HND I">HND I</option>
                    <option value="HND II">HND II</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474F] uppercase mb-1">Session</label>
                  <input
                    type="text"
                    value={editSession}
                    onChange={e => setEditSession(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#C4C6D0] rounded-xl text-xs text-[#1B1B1F]"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2.5 bg-[#F1F4FA] text-[#44474F] font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#005FB0] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanResult={(data) => setScannedResult(data)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        profile={studentProfile}
        stages={stages}
      />
    </div>
  );
};
