import React, { useState, type FormEvent } from "react";
import { Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";

interface AuthSwitchProps {
  onLoginSuccess?: (user: any) => void;
  className?: string;
}

export default function AuthSwitch({ onLoginSuccess }: AuthSwitchProps) {
  // Sign In Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Handle Sign In Submit
  const onSignInSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, password })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        } else {
          setRemainingAttempts(null);
        }
        setErrorMessage(data.error || "Authentication failed. Invalid username or password.");
        return;
      }

      if (data.user) {
        localStorage.setItem("nya_session_id", data.sessionId || "");
        localStorage.setItem("nya_user", JSON.stringify(data.user));
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      setErrorMessage("Unable to connect to HR Central authentication server. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div 
      className="min-h-screen w-full bg-[#EEF2F8] bg-cover bg-center bg-fixed flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none text-black"
      style={{ backgroundImage: "url('/bg-glass-orbs.svg')" }}
    >
      {/* Dynamic 3D Spheres & Frosted Glass Elements matching user's uploaded wallpaper */}
      <div className="fixed top-[15%] right-[10%] w-48 h-48 rounded-full bg-gradient-to-br from-[#93C5FD] via-[#2563EB] to-[#1E3A8A] shadow-[0_0_50px_rgba(37,99,235,0.5)] pointer-events-none z-0" />
      <div className="fixed top-[45%] left-[2%] w-28 h-28 rounded-full bg-gradient-to-br from-[#93C5FD] via-[#2563EB] to-[#172554] shadow-[0_0_35px_rgba(37,99,235,0.45)] pointer-events-none z-0" />
      <div className="fixed bottom-[-6%] left-[5%] w-[380px] h-[380px] rounded-full border-2 border-white bg-gradient-to-br from-white/90 via-blue-50/50 to-blue-100/20 shadow-xl pointer-events-none z-0" />

      {/* Main Glassmorphic Container Card - Transparent Frosted Glass */}
      <div className="w-full max-w-[920px] glass-liquid-window rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 border border-white/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08),0_0_40px_rgba(59,130,246,0.10)]">
        {/* Left Side: Welcome to HR department */}
        <div className="relative p-8 lg:p-12 flex flex-col items-center justify-center text-center bg-white/[0.25] backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/50 overflow-hidden shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7738FF]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center max-w-sm mx-auto my-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/90 p-2.5 border border-white/95 shadow-md flex items-center justify-center mb-6">
              <img
                src="/logo.jpg"
                alt="National Youth Authority Ghana"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            <div className="font-extrabold text-[#7738FF] tracking-widest text-xs uppercase mb-2">
              HR Central
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight">
              Welcome to HR department
            </h1>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white/[0.15]">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-xl font-bold text-black tracking-tight">
              Staff Authentication
            </h2>
            <p className="text-xs text-black mt-1 mb-6">
              Enter your official staff credentials to begin session
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50/95 border border-rose-300 rounded-xl text-rose-700 font-semibold text-xs flex items-center gap-2 shadow-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {remainingAttempts !== null && remainingAttempts < 5 && (
              <div className="mb-4 p-2.5 bg-amber-50/95 border border-amber-300 rounded-xl text-amber-800 font-semibold text-xs">
                ⚠️ Security Notice: {remainingAttempts} attempt(s) remaining before account lockout.
              </div>
            )}

            <form onSubmit={onSignInSubmit} className="space-y-4">
              {/* Username or Email Input */}
              <div>
                <label className="block text-[11px] font-semibold text-black mb-1.5 uppercase tracking-wider">
                  Official Email or Staff Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7738FF]" />
                  <input
                    type="text"
                    placeholder="e.g. ekow.eshun@nya.gov.gh"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 text-black placeholder-[#A6B0C8]/50 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none focus:ring-2 focus:ring-[#7738FF]/30 transition-all shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-semibold text-black mb-1.5 uppercase tracking-wider">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7738FF]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white/70 text-black placeholder-[#A6B0C8]/50 text-xs rounded-xl border border-white/80 focus:border-[#7738FF] focus:outline-none focus:ring-2 focus:ring-[#7738FF]/30 transition-all shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 glass-liquid-cta rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Authenticating Session..." : "Sign In to HR Central"}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AuthSwitch };
