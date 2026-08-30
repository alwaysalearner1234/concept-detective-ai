"use client";

import React, { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { ApiError } from "../../lib/api";

type AuthTab = "login" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const { login, register, forgotPassword, resetPassword } = useAuth();

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Password reset specific state
  const [resetCode, setResetCode] = useState("");
  const [demoCodeMsg, setDemoCodeMsg] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form validation helper
  const validateForm = (type: AuthTab): boolean => {
    const newErrors: Record<string, string> = {};
    setGeneralError(null);
    setSuccessMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (type === "signup") {
      if (!name.trim()) newErrors.name = "Full Name is required";
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!termsAccepted) {
        newErrors.terms = "You must agree to the Terms & Conditions";
      }
    } else if (type === "login") {
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!password) {
        newErrors.password = "Password is required";
      }
    } else if (type === "forgot") {
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (type === "reset") {
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!resetCode.trim()) {
        newErrors.resetCode = "Reset code is required";
      }
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("login")) return;

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      // AuthProvider handles redirect
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("signup")) return;

    setLoading(true);
    try {
      await register(name, email, password);
      // AuthProvider handles redirect
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("forgot")) return;

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccessMsg("Reset code generated! Please see the alert box below to retrieve it.");
      if (res.demo_code) {
        setDemoCodeMsg(`[DEMO CODE GENERATED] Use: "${res.demo_code}" to reset your password.`);
      }
      setActiveTab("reset");
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : "Failed to generate reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("reset")) return;

    setLoading(true);
    try {
      await resetPassword(email, resetCode, password);
      setSuccessMsg("Your password has been successfully reset. Please log in.");
      setPassword("");
      setConfirmPassword("");
      setResetCode("");
      setDemoCodeMsg(null);
      setActiveTab("login");
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : "Failed to reset password. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    id: string,
    label: string,
    type: string,
    value: string,
    onChange: (val: string) => void,
    error?: string,
    placeholder?: string,
    icon?: React.ReactNode,
    rightElement?: React.ReactNode
  ) => {
    return (
      <div className="flex flex-col text-left mb-4">
        <label htmlFor={id} className="font-detective text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-slate-500">{icon}</div>}
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
            placeholder={placeholder}
            className={`w-full rounded-lg bg-noir-900 border ${
              error ? "border-crime-500 shadow-[0_0_10px_rgba(192,57,43,0.15)] focus:border-crime-500" : "border-noir-600 focus:border-amber-400"
            } py-2.5 ${icon ? "pl-10" : "px-3.5"} pr-10 text-sm text-slate-200 outline-none transition-all duration-150 placeholder-slate-600`}
          />
          {rightElement && <div className="absolute right-3 cursor-pointer select-none text-slate-500 hover:text-slate-300">{rightElement}</div>}
        </div>
        {error && <span className="text-xs text-crime-400 mt-1 font-semibold">&times; {error}</span>}
      </div>
    );
  };

  // SVGs for form inputs
  const EmailIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const LockIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const UserIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const KeyIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-9 5h.01M15 12h.01M19 12h.01M12 12h.01M8 12a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  );

  const EyeIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-spotlight" />

      <div className="relative w-full max-w-md text-center">
        {/* Logo/Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex items-center gap-2 chip border-amber-400/30 text-amber-400 animate-fade-in-up">
            <span>🕵️‍♂️</span> Headquarters Security Clearance
          </div>
          <h1 className="font-detective text-3xl leading-tight text-slate-50 animate-fade-in-up">
            CONCEPT <span className="text-amber-400 animate-flicker">DETECTIVE</span>
          </h1>
          <p className="mt-1.5 font-detective text-xs uppercase tracking-[0.2em] text-crime-400 animate-fade-in-up">
            Authenticate to log investigation case files
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="case-card p-6 sm:p-8 animate-fade-in-up shadow-glow">
          {/* Tabs for Login / Register */}
          {(activeTab === "login" || activeTab === "signup") && (
            <div className="flex border-b border-noir-600 mb-6 pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrors({});
                  setGeneralError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wider font-detective uppercase transition-colors duration-150 relative ${
                  activeTab === "login" ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Log In
                {activeTab === "login" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setErrors({});
                  setGeneralError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold tracking-wider font-detective uppercase transition-colors duration-150 relative ${
                  activeTab === "signup" ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign Up
                {activeTab === "signup" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />}
              </button>
            </div>
          )}

          {/* Back button for Forgot/Reset views */}
          {(activeTab === "forgot" || activeTab === "reset") && (
            <div className="flex items-center mb-6">
              <button
                onClick={() => {
                  setActiveTab("login");
                  setErrors({});
                  setGeneralError(null);
                  setDemoCodeMsg(null);
                }}
                className="inline-flex items-center text-xs font-detective text-slate-400 hover:text-amber-400 transition-colors"
              >
                &larr; Back to login
              </button>
            </div>
          )}

          {/* Success Notification */}
          {successMsg && (
            <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400 text-left flex items-start gap-2">
              <span className="mt-0.5 text-base">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Notification */}
          {generalError && (
            <div className="mb-5 rounded-lg border border-crime-500/20 bg-crime-500/10 p-3 text-sm text-crime-400 text-left flex items-start gap-2 animate-pulse shadow-[0_0_10px_rgba(192,57,43,0.1)]">
              <span className="mt-0.5 text-base">⚠️</span>
              <span>{generalError}</span>
            </div>
          )}

          {/* Demo Code Box (for developer ease) */}
          {demoCodeMsg && (
            <div className="mb-5 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-sm text-amber-400 text-left font-detective flex flex-col gap-1">
              <div className="font-bold text-xs uppercase tracking-wider text-amber-500">Demo Code Log:</div>
              <div>{demoCodeMsg}</div>
            </div>
          )}

          {/* Form Login */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} noValidate>
              {renderInputField("login-email", "Email Address", "email", email, setEmail, errors.email, "e.g. detective@concept.ai", EmailIcon)}
              {renderInputField(
                "login-password",
                "Password",
                showPassword ? "text" : "password",
                password,
                setPassword,
                errors.password,
                "••••••••",
                LockIcon,
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? EyeOffIcon : EyeIcon}
                </button>
              )}

              <div className="flex items-center justify-between mt-5 mb-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="accent-amber-400 rounded h-4 w-4 bg-noir-900 border-noir-600 focus:outline-none"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("forgot");
                    setErrors({});
                    setGeneralError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-detective text-xs text-amber-400/80 hover:text-amber-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 font-detective text-sm uppercase tracking-wider">
                {loading ? "Decrypting credentials..." : "Initialize Agent Login"}
              </button>

              <div className="mt-5 text-center text-xs text-slate-500">
                Default testing credentials: <code className="text-amber-400 font-detective">detective@concept.ai</code> / <code className="text-amber-400 font-detective">Password123!</code>
              </div>
            </form>
          )}

          {/* Form Sign Up */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} noValidate>
              {renderInputField("signup-name", "Full Name / Agent Alias", "text", name, setName, errors.name, "e.g. Sherlock Holmes", UserIcon)}
              {renderInputField("signup-email", "Email Address", "email", email, setEmail, errors.email, "e.g. detective@concept.ai", EmailIcon)}
              {renderInputField(
                "signup-password",
                "Password",
                showPassword ? "text" : "password",
                password,
                setPassword,
                errors.password,
                "••••••••",
                LockIcon,
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? EyeOffIcon : EyeIcon}
                </button>
              )}
              {renderInputField(
                "signup-confirm",
                "Confirm Password",
                showPassword ? "text" : "password",
                confirmPassword,
                setConfirmPassword,
                errors.confirmPassword,
                "••••••••",
                LockIcon
              )}

              <div className="flex flex-col text-left mt-4 mb-6">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    disabled={loading}
                    className="accent-amber-400 rounded h-4 w-4 bg-noir-900 border-noir-600 mt-0.5 focus:outline-none"
                  />
                  <span>
                    I agree to the Agent Terms of Service & Privacy Protocol. I understand that AI diagnostics will assess my misconception patterns.
                  </span>
                </label>
                {errors.terms && <span className="text-xs text-crime-400 mt-1 font-semibold">&times; {errors.terms}</span>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 font-detective text-sm uppercase tracking-wider">
                {loading ? "Assembling Dossier..." : "Register Investigator Account"}
              </button>
            </form>
          )}

          {/* Form Forgot Password */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotSubmit} noValidate>
              <div className="text-left mb-6 text-sm text-slate-400">
                Provide your registered investigator email below. The headquarters server will verify your record and output an recovery code on screen.
              </div>

              {renderInputField("forgot-email", "Email Address", "email", email, setEmail, errors.email, "e.g. detective@concept.ai", EmailIcon)}

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 font-detective text-sm uppercase tracking-wider mt-2">
                {loading ? "Scanning Database..." : "Request Reset Authorization"}
              </button>
            </form>
          )}

          {/* Form Reset Password */}
          {activeTab === "reset" && (
            <form onSubmit={handleResetSubmit} noValidate>
              <div className="text-left mb-5 text-sm text-slate-400">
                Authorization requested. Enter the recovery code alongside your new password to complete decryption and override database credentials.
              </div>

              {renderInputField("reset-email", "Email Address", "email", email, setEmail, errors.email, "Confirm your email", EmailIcon)}
              {renderInputField("reset-code", "Security Override Code", "text", resetCode, setResetCode, errors.resetCode, "e.g. CD-8844", KeyIcon)}
              {renderInputField(
                "reset-password",
                "New Password",
                showPassword ? "text" : "password",
                password,
                setPassword,
                errors.password,
                "•••••••• (min 6 chars)",
                LockIcon,
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? EyeOffIcon : EyeIcon}
                </button>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 font-detective text-sm uppercase tracking-wider mt-4">
                {loading ? "Overriding credentials..." : "Override Password Record"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
