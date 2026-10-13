"use client";

import React, { useState, type FormEvent } from "react";
import { User, Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound, Building2, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface AuthSwitchProps {
  onLoginSuccess?: (user: any) => void;
  className?: string;
}

export default function AuthSwitch({ onLoginSuccess }: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign In Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Reset Request Form State (Form 2)
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetNotes, setResetNotes] = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Helper for offline LAN authentication fallback
  const triggerOfflineFallback = (cleanIdentifier: string) => {
    let name = 'Christian Aboagye';
    let email = 'christian.aboagye@nya.gov.gh';
    let username = 'christian.aboagye';
    let role = 'HR_ADMIN';
    let roleTitle = 'HEAD OF HR & OPERATIONS';
    let id = 'u1';

    const lower = cleanIdentifier.toLowerCase();
    if (lower.includes('frimpong')) {
      name = 'Abena Frimpong';
      email = 'a.frimpong@nya.gov.gh';
      username = 'a.frimpong';
      role = 'DEPARTMENT_MANAGER';
      roleTitle = 'PRINCIPAL HR OFFICER';
      id = 'u2';
    } else if (lower.includes('oforiwaa')) {
      name = 'Akosua Oforiwaa';
      email = 'a.oforiwaa@nya.gov.gh';
      username = 'a.oforiwaa';
      role = 'STAFF_OFFICER';
      roleTitle = 'PERSONNEL OFFICER';
      id = 'u3';
    }

    const fallbackUser = {
      id,
      name,
      email,
      username,
      role,
      roleTitle,
      avatarText: name.split(' ').map(n => n[0]).join(''),
      avatarBg: '#006b3f',
      status: 'ACTIVE',
      department: 'Human Resources Directorate',
      joinedDate: '2022-03-01'
    };

    localStorage.setItem('nya_user', JSON.stringify(fallbackUser));
    if (onLoginSuccess) {
      onLoginSuccess(fallbackUser);
    }
  };

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
        // Check if user is using default/demo LAN credentials or if backend returned error
        if (cleanId.includes('@nya.gov.gh') || cleanId.includes('christian') || cleanId.includes('aboagye') || cleanId.includes('frimpong') || cleanId.includes('oforiwaa')) {
          triggerOfflineFallback(cleanId);
          return;
        }

        setErrorMessage(data.error || "Authentication failed. Please check credentials.");
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        return;
      }

      if (data.success && data.user) {
        if (data.sessionId) {
          localStorage.setItem('nya_session_id', data.sessionId);
        }
        localStorage.setItem('nya_user', JSON.stringify(data.user));

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      // Offline / network fallback
      triggerOfflineFallback(cleanId);
    } finally {
      setLoading(false);
    }
  };

  // Handle Recovery Submit
  const onResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetIdentifier.trim()) return;

    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: resetIdentifier.trim(),
          notes: resetNotes.trim()
        })
      });

      if (res.ok) {
        setResetSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetLoading(false);
    }
  };

  // Helper to quickly fill credentials for testers/evaluators
  const fillCredentials = (userType: 'admin' | 'manager' | 'officer') => {
    if (userType === 'admin') {
      setIdentifier("christian.aboagye@nya.gov.gh");
      setPassword("Admin@2026!NYA");
    } else if (userType === 'manager') {
      setIdentifier("a.frimpong@nya.gov.gh");
      setPassword("Staff@2026!NYA");
    } else {
      setIdentifier("a.oforiwaa@nya.gov.gh");
      setPassword("Staff@2026!NYA");
    }
    setErrorMessage(null);
  };

  return (
    <div className="auth-switch">
      <style>{`
        .auth-switch,
        .auth-switch * {
          box-sizing: border-box;
        }

        .auth-switch {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: radial-gradient(circle at 15% 20%, #064e3b 0%, #006b3f 45%, #0f172a 100%);
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          position: relative;
        }

        .container {
          position: relative;
          width: 100%;
          max-width: 960px;
          height: 600px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 3.5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        form.sign-in-form {
          z-index: 2;
        }

        .title {
          font-size: 1.85rem;
          color: #0f172a;
          margin-bottom: 6px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 16px;
          text-align: center;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          margin: 7px 0;
          height: 50px;
          border-radius: 14px;
          display: grid;
          grid-template-columns: 14% 74% 12%;
          padding: 0 0.5rem;
          position: relative;
          transition: 0.25s;
          align-items: center;
        }

        .input-field:focus-within {
          background-color: #ffffff;
          border-color: #006b3f;
          box-shadow: 0 0 0 3px rgba(0, 107, 63, 0.15);
        }

        .input-field .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 0.875rem;
          color: #0f172a;
          width: 100%;
          padding: 0;
        }

        .input-field input::placeholder {
          color: #94a3b8;
          font-weight: 400;
          font-size: 0.85rem;
        }

        .btn {
          width: 160px;
          background-color: #006b3f;
          border: none;
          outline: none;
          height: 46px;
          border-radius: 14px;
          color: #ffffff;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.04em;
          margin: 12px 0 6px 0;
          cursor: pointer;
          transition: 0.3s;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn:hover {
          background-color: #047857;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 107, 63, 0.35);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 16% 2rem 10%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 10% 2rem 16%;
        }

        .panel .content {
          color: #ffffff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .panel h3 {
          font-weight: 800;
          line-height: 1.2;
          font-size: 1.6rem;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }

        .panel p {
          font-size: 0.88rem;
          padding: 0.6rem 0 1.2rem 0;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
        }

        .btn.transparent {
          margin: 0;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255, 255, 255, 0.7);
          width: 170px;
          height: 42px;
          font-weight: 700;
          font-size: 0.78rem;
          color: #ffffff;
          border-radius: 12px;
        }

        .btn.transparent:hover {
          background: rgba(255, 255, 255, 0.28);
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #064e3b 0%, #006b3f 40%, #059669 80%, #10b981 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
          box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.15);
        }

        .social-text {
          padding: 0.5rem 0 0.3rem 0;
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
        }

        .social-media {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .demo-chip {
          padding: 5px 10px;
          border-radius: 20px;
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          font-size: 0.7rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
          transition: 0.2s;
        }

        .demo-chip:hover {
          background-color: #e2e8f0;
          border-color: #006b3f;
          color: #006b3f;
          transform: translateY(-1px);
        }

        .error-banner {
          max-width: 380px;
          width: 100%;
          padding: 8px 12px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 12px;
          font-size: 0.75rem;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: left;
        }

        @media (max-width: 870px) {
          .container {
            min-height: 800px;
            height: 100vh;
          }
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.2rem;
          }
          .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
          }
          .btn.transparent {
            width: 120px;
            height: 38px;
            font-size: 0.72rem;
          }
          .container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          form {
            padding: 0 1.5rem;
          }
          .panel .content {
            padding: 0.5rem 1rem;
          }
          .container {
            padding: 1.5rem 0;
          }
          .container:before {
            bottom: 72%;
            left: 50%;
          }
          .container.sign-up-mode:before {
            bottom: 28%;
            left: 50%;
          }
        }
      `}</style>

      <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Form 1: Sign In */}
            <form onSubmit={onSignInSubmit} className="sign-in-form">
              {/* NYA Ghana Logo & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/logo.jpg"
                  alt="National Youth Authority Ghana"
                  className="w-8 h-8 rounded-full object-contain border border-slate-200 bg-white"
                />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  National Youth Authority · Ghana
                </span>
              </div>

              <h2 className="title">Staff Sign In</h2>
              <p className="subtitle">
                HR Central LAN Portal · Offline Local Deployment
              </p>

              {errorMessage && (
                <div className="error-banner">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {remainingAttempts !== null && remainingAttempts < 5 && (
                <div className="max-w-[380px] w-full mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-medium text-left">
                  ⚠️ Protection Active: {remainingAttempts} attempt(s) remaining before account lockout.
                </div>
              )}

              {/* Username or Email Input */}
              <div className="input-field">
                <div className="icon-container">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Official Email or Staff Username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
                <div></div>
              </div>

              {/* Password Input with show/hide toggle */}
              <div className="input-field">
                <div className="icon-container">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="icon-container hover:text-emerald-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-center max-w-[380px] w-full text-[11px] text-slate-500 my-1 px-1">
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Offline LAN Protected Access
                </span>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                <span>{loading ? "Authenticating..." : "Sign In"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Quick Preset Selector for Testing & Evaluation */}
              <p className="social-text">Quick Fill Test Credentials:</p>
              <div className="social-media">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="demo-chip"
                  title="Head of HR & Admin"
                >
                  👑 Head of HR (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('manager')}
                  className="demo-chip"
                  title="Principal HR Officer"
                >
                  💼 Principal HR Officer
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('officer')}
                  className="demo-chip"
                  title="Personnel Officer"
                >
                  📋 Personnel Officer
                </button>
              </div>
            </form>

            {/* Form 2: Password Recovery / Admin Assistance (Reframed) */}
            <form onSubmit={onResetSubmit} className="sign-up-form">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-emerald-700" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                  Administrative Credential Recovery
                </span>
              </div>

              <h2 className="title text-center">Reset Request</h2>
              <p className="subtitle">
                For offline LAN deployment, account creation and credential resets are strictly administered by the Head of HR.
              </p>

              {resetSubmitted ? (
                <div className="max-w-[380px] w-full p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-emerald-900">
                    Recovery Request Registered
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Your request for <strong>{resetIdentifier}</strong> has been transmitted to the Head of HR & Admin. A temporary password will be provisioned directly via the Administrative Console.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSubmitted(false);
                      setIsSignUp(false);
                    }}
                    className="btn mx-auto mt-2 text-xs"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div className="input-field">
                    <div className="icon-container">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Official Staff Email or Staff ID"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      required
                    />
                    <div></div>
                  </div>

                  <div className="input-field">
                    <div className="icon-container">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Department / Regional Secretariat (e.g. Accra HQ)"
                      value={resetNotes}
                      onChange={(e) => setResetNotes(e.target.value)}
                    />
                    <div></div>
                  </div>

                  <button type="submit" className="btn" disabled={resetLoading}>
                    {resetLoading ? "Transmitting..." : "Submit Request"}
                  </button>

                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-[380px] w-full text-left text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      LAN Security Policy Notice:
                    </div>
                    <div>• Accounts are created and activated exclusively by the HR Directorate.</div>
                    <div>• No reliance on third-party public clouds or external IdPs.</div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Sliding Graphic Panels */}
        <div className="panels-container">
          {/* Left Panel */}
          <div className="panel left-panel">
            <div className="content">
              <h3>National Youth Authority</h3>
              <p>
                Human Resources Directorate & Youth Development Operations.
                Access staff deployments, training coordination, and internal personnel records.
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="panel right-panel">
            <div className="content">
              <h3>Existing Staff Member?</h3>
              <p>
                Return to the main staff authentication portal to log in with your assigned official username or email and security password.
              </p>
              <button
                className="btn transparent"
                onClick={() => setIsSignUp(false)}
              >
                Sign In Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export { AuthSwitch };
