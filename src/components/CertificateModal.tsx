import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { JigawaPolyLogo } from './JigawaPolyLogo';
import { StudentProfile, ClearanceStage } from '../types/clearance';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  stages: ClearanceStage[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  profile,
  stages
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const certificateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const payload = JSON.stringify({
        institution: "JIGAWA STATE POLYTECHNIC DUTSE",
        document: "OFFICIAL STUDENT CLEARANCE CERTIFICATE",
        matricNumber: profile.matricNumber || "ND/CTE/M/24/0001",
        studentName: profile.fullName || "Ibrahim Muhammad Kabir",
        department: profile.department || "Computer Telecommunication Engineering (CTE)",
        faculty: profile.faculty || "School of Technology & Applied Sciences",
        level: profile.level || "ND II",
        clearancePin: profile.clearancePin || "JSP-CLR-7824",
        status: "CLEARED AND CERTIFIED",
        issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        verifiedBy: "Academic Board & Registry",
        verificationUrl: `https://jigawapoly.edu.ng/verify/${profile.matricNumber?.replace(/\//g, '-')}`
      });

      QRCode.toDataURL(payload, { width: 220, margin: 1 })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [isOpen, profile]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col border border-[#E3E8F1] my-auto">
        {/* Modal Controls Bar */}
        <div className="p-3.5 bg-[#005FB0] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#97F0FF]" />
            <h3 className="font-bold text-sm">Official JSP Digital Clearance Certificate</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Canvas */}
        <div
          ref={certificateRef}
          className="p-6 sm:p-10 bg-[#FFFEFA] text-[#1B1B1F] relative border-8 border-double border-[#005FB0]/30 m-4 rounded-xl shadow-xs print:m-0 print:border-4"
        >
          {/* Security Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none select-none">
            <div className="text-center font-black text-6xl text-[#005FB0] transform -rotate-25 tracking-widest uppercase">
              JIGAWA STATE POLYTECHNIC
            </div>
          </div>

          {/* Certificate Header */}
          <div className="flex flex-col items-center text-center pb-6 border-b-2 border-[#005FB0]/40 relative">
            <JigawaPolyLogo size={76} showBorder={true} className="mb-2 shadow-md" />
            <h1 className="text-xl sm:text-2xl font-black text-[#005FB0] tracking-wider uppercase font-['Space_Grotesk',sans-serif]">
              Jigawa State Polytechnic Dutse
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#44474F] tracking-wide mt-0.5">
              P.M.B 7040, Kiyawa Road, Dutse, Jigawa State, Nigeria
            </p>
            <p className="text-[11px] font-semibold text-[#006874] uppercase tracking-widest mt-1">
              Directorate of Examinations, Records & Academic Board
            </p>

            <div className="mt-4 px-4 py-1.5 bg-[#005FB0] text-white text-xs sm:text-sm font-black tracking-widest uppercase rounded-full shadow-xs">
              Final Student Clearance Certificate
            </div>
          </div>

          {/* Body Content */}
          <div className="py-6 space-y-4 text-xs sm:text-sm leading-relaxed text-[#1B1B1F]">
            <p className="text-justify">
              This is to officially certify that the student named below has satisfactorily completed all academic, financial, departmental, library, and administrative clearance requirements of <strong className="text-[#005FB0]">Jigawa State Polytechnic Dutse</strong>.
            </p>

            {/* Student Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F1F4FA] rounded-xl border border-[#E3E8F1] font-mono text-xs">
              <div>
                <span className="block text-[10px] text-[#74777F] uppercase font-sans font-bold">Full Name</span>
                <strong className="text-sm font-bold text-[#1B1B1F]">{profile.fullName || "Ibrahim Muhammad Kabir"}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-[#74777F] uppercase font-sans font-bold">Matriculation No.</span>
                <strong className="text-sm font-bold text-[#005FB0]">{profile.matricNumber || "JSP/ND/CS/22/0149"}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-[#74777F] uppercase font-sans font-bold">Clearance PIN</span>
                <strong className="text-sm font-bold text-[#1B873F]">{profile.clearancePin || "JSP-CLR-7824"}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-[#74777F] uppercase font-sans font-bold">Department</span>
                <span className="font-semibold">{profile.department || "Computer Science"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#74777F] uppercase font-sans font-bold">School / Faculty</span>
                <span className="font-semibold">{profile.faculty || "School of Technology & Applied Sciences"}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#74777F] uppercase font-sans font-bold">Level & Session</span>
                <span className="font-semibold">{profile.level} ({profile.session})</span>
              </div>
            </div>

            {/* Completed Stages Seals Grid */}
            <div className="mt-4">
              <span className="block text-[11px] font-black uppercase text-[#005FB0] tracking-wider mb-2">
                Certified Departmental Endorsements (8/8 Verified)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stages.map(stage => (
                  <div key={stage.id} className="p-2 bg-white rounded-lg border border-[#D4F5DC] flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B873F] shrink-0" />
                    <span className="text-[10px] font-bold text-[#1B1B1F] truncate" title={stage.title}>
                      {stage.stageNumber}. {stage.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with QR Code, Seals, & Signatures */}
          <div className="pt-6 border-t-2 border-[#005FB0]/40 grid grid-cols-3 items-end gap-4 text-center">
            {/* HOD Endorsement */}
            <div className="flex flex-col items-center">
              <div className="h-10 flex items-end">
                <span className="font-['Dancing_Script',cursive] text-lg font-bold text-[#005FB0]">
                  Engr. A. M. Dutse
                </span>
              </div>
              <div className="w-full border-t border-[#74777F] pt-1 mt-1">
                <p className="text-[11px] font-bold text-[#1B1B1F]">Head of Department</p>
                <p className="text-[9px] text-[#74777F]">{profile.department}</p>
              </div>
            </div>

            {/* Central Official Digital QR Verification Seal */}
            <div className="flex flex-col items-center justify-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Clearance QR Code" className="w-20 h-20 border-2 border-[#005FB0] p-1 rounded-lg bg-white shadow-sm" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-lg animate-pulse" />
              )}
              <span className="text-[8px] font-mono font-bold text-[#005FB0] mt-1 uppercase">
                Digital Senate Seal
              </span>
            </div>

            {/* Registrar Signature */}
            <div className="flex flex-col items-center">
              <div className="h-10 flex items-end">
                <span className="font-['Dancing_Script',cursive] text-lg font-bold text-[#0F5132]">
                  Dr. Umar S. Birnin Kudu
                </span>
              </div>
              <div className="w-full border-t border-[#74777F] pt-1 mt-1">
                <p className="text-[11px] font-bold text-[#1B1B1F]">Polytechnic Registrar</p>
                <p className="text-[9px] text-[#74777F]">Jigawa State Polytechnic</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 text-center text-[9px] text-[#74777F] border-t border-dashed border-[#E3E8F1]">
            Document Generated from Jigawa State Polytechnic Online Clearance Ledger • Verify at portal.jigawapoly.edu.ng/verify
          </div>
        </div>
      </div>
    </div>
  );
};
