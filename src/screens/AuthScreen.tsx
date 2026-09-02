import React, { useState } from 'react';
import { JigawaPolyLogo } from '../components/JigawaPolyLogo';
import {
  Lock,
  Mail,
  User,
  Badge,
  School,
  GraduationCap,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { jigawaPolyDepartments, jigawaPolySchools } from '../data/departmentRequirements';
import { useClearance } from '../context/ClearanceContext';

export const AuthScreen: React.FC = () => {
  const { loginStudent, registerStudent, authLoading } = useClearance();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [fullName, setFullName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(jigawaPolyDepartments[0]);
  const [level, setLevel] = useState('ND I');
  const [session, setSession] = useState('2024/2025 Academic Session');
  const [registerPin, setRegisterPin] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await loginStudent(loginEmail, loginPassword);
    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await registerStudent(
      matricNumber,
      fullName,
      email,
      department,
      level,
      session,
      registerPin
    );

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0C2340] via-[#0F5132] to-[#08331E] flex items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Decorative Canvas Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#20C997]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#005FB0]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl text-[#1B1B1F] rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/40 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pb-6">
          <JigawaPolyLogo size={70} showBorder={true} className="mb-3 shadow-lg" />
          <h1 className="text-2xl font-black text-[#005FB0] tracking-wider font-['Space_Grotesk',sans-serif]">
            JSP DUTSE
          </h1>
          <p className="text-xs font-bold text-[#198754] uppercase tracking-widest mt-0.5">
            Student Clearance Portal
          </p>
          <p className="text-[11px] text-[#44474F] mt-1">
            Jigawa State Polytechnic Dutse, Nigeria
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F1F4FA] p-1 rounded-2xl mb-6 border border-[#E3E8F1]">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              !isSignUp
                ? 'bg-[#005FB0] text-white shadow-sm'
                : 'text-[#44474F] hover:text-[#005FB0]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              isSignUp
                ? 'bg-[#005FB0] text-white shadow-sm'
                : 'text-[#44474F] hover:text-[#005FB0]'
            }`}
          >
            Register Student
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-[#FFDAD6] text-[#410002] rounded-xl text-xs font-medium flex items-center gap-2 border border-[#BA1A1A]/30 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#BA1A1A]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-[#D4F5DC] text-[#003914] rounded-xl text-xs font-medium flex items-center gap-2 border border-[#1B873F]/30">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1B873F]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {!isSignUp ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777F]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. student@jigawapoly.edu.ng"
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-sm font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-sm font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#74777F] hover:text-[#1B1B1F]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 bg-[#005FB0] hover:bg-[#004F94] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Clearance Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777F]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Fatima Ali Bello"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-sm font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                Matriculation Number (e.g. ND/CTE/M/24/0001)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777F]">
                  <Badge className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="e.g. ND/CTE/M/24/0001 or ND/CTE/M/25/0001"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-sm font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777F]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. fatima.ali@jigawapoly.edu.ng"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-sm font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                Academic Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0]"
              >
                {jigawaPolyDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0]"
                >
                  <option value="ND I">ND I</option>
                  <option value="ND II">ND II</option>
                  <option value="HND I">HND I</option>
                  <option value="HND II">HND II</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                  Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-xs font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0]"
                >
                  <option value="2023/2024 Academic Session">2023/2024</option>
                  <option value="2024/2025 Academic Session">2024/2025</option>
                  <option value="2022/2023 Academic Session">2022/2023</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44474F] uppercase tracking-wider mb-1">
                Password / Security PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#74777F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={registerPin}
                  onChange={(e) => setRegisterPin(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F7F9FF] border border-[#C4C6D0] rounded-xl text-sm font-medium text-[#1B1B1F] focus:outline-hidden focus:ring-2 focus:ring-[#005FB0]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#74777F] hover:text-[#1B1B1F]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 bg-[#198754] hover:bg-[#157347] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#97F0FF]" />
                  <span>Create Clearance Dossier</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
