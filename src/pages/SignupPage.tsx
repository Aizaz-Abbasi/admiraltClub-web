import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
  Loader2Icon,
} from "lucide-react";
import { AuthPayload } from "../auth";
import { forgotPasswordApi } from "../api/auth";
import { getApiErrorMessage } from "../api/client";

interface SignupPageProps {
  onAuth: (payload: AuthPayload) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string;
}

export function SignupPage({
  onAuth,
  isSubmitting,
  submitError,
}: SignupPageProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleForgotSubmit = async () => {
    if (!forgotEmail) {
      setForgotError("Please enter your email.");
      return;
    }
    setForgotStatus("sending");
    setForgotError(null);
    try {
      await forgotPasswordApi(forgotEmail);
      setForgotStatus("sent");
    } catch (err) {
      setForgotError(getApiErrorMessage(err));
      setForgotStatus("idle");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!isLogin) {
      if (!formData.name) newErrors.name = "Full name is required";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onAuth({
      mode: isLogin ? "login" : "signup",
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md bg-navy-800 rounded-3xl shadow-2xl border border-navy-700 overflow-hidden relative z-10"
      >
        <div className="bg-navy-900 p-8 text-center relative overflow-hidden border-b border-navy-700">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-500 shadow-[0_0_10px_rgba(201,168,76,0.8)]"></div>
          <img
            src="/logo.png"
            alt="The Admiralty Club"
            className="mx-auto mb-4 h-20 w-auto drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]"
          />

          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            The Admiralty Club
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Premium Indoor Golf Experience
          </p>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-8 bg-navy-900 p-1 rounded-xl border border-navy-700 shadow-inner">
            <button
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? "bg-navy-800 text-white shadow-sm border border-navy-600" : "text-slate-500 hover:text-slate-300"}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? "bg-navy-800 text-white shadow-sm border border-navy-600" : "text-slate-500 hover:text-slate-300"}`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError ? (
              <p className="rounded-lg border border-red-600/50 bg-red-950/40 p-3 text-sm text-red-300">
                {submitError}
              </p>
            ) : null}

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="space-y-1"
                >
                  <label className="text-sm font-medium text-slate-300 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? "border-red-500 focus:ring-red-500" : "border-navy-600 focus:ring-gold-500 focus:border-gold-500"} rounded-xl text-sm transition-colors bg-navy-900 text-white placeholder-slate-500 outline-none shadow-inner`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? "border-red-500 focus:ring-red-500" : "border-navy-600 focus:ring-gold-500 focus:border-gold-500"} rounded-xl text-sm transition-colors bg-navy-900 text-white placeholder-slate-500 outline-none shadow-inner`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? "border-red-500 focus:ring-red-500" : "border-navy-600 focus:ring-gold-500 focus:border-gold-500"} rounded-xl text-sm transition-colors bg-navy-900 text-white placeholder-slate-500 outline-none shadow-inner`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="confirm-password-field"
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="space-y-1"
                >
                  <label className="text-sm font-medium text-slate-300 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-navy-600 focus:ring-gold-500 focus:border-gold-500"} rounded-xl text-sm transition-colors bg-navy-900 text-white placeholder-slate-500 outline-none shadow-inner`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot((v) => !v);
                    setForgotError(null);
                    setForgotStatus("idle");
                    setForgotEmail("");
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-gold-500 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <AnimatePresence>
              {isLogin && showForgot && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {forgotStatus === "sent" ? (
                    <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/50 p-4 text-sm text-emerald-300">
                      Check your inbox — we sent a reset link to{" "}
                      <strong>{forgotEmail}</strong>.
                    </div>
                  ) : (
                    <div className="rounded-xl bg-navy-900 border border-navy-600 p-4 space-y-3">
                      <p className="text-xs text-slate-400">
                        Enter your email and we'll send you a link to reset your
                        password.
                      </p>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MailIcon className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            setForgotError(null);
                          }}
                          placeholder="you@example.com"
                          className="block w-full pl-9 pr-3 py-2.5 border border-navy-600 focus:border-gold-500/60 rounded-lg text-sm bg-navy-800 text-white placeholder-slate-500 outline-none transition-colors"
                        />
                      </div>
                      {forgotError && (
                        <p className="text-xs text-red-400">{forgotError}</p>
                      )}
                      <button
                        type="button"
                        disabled={forgotStatus === "sending"}
                        onClick={() => void handleForgotSubmit()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50"
                      >
                        {forgotStatus === "sending" ? (
                          <>
                            <Loader2Icon className="w-3.5 h-3.5 animate-spin" />{" "}
                            Sending…
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(201,168,76,0.2)] text-sm font-bold text-navy-900 bg-gold-500 hover:bg-gold-400 hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-gold-500 transition-all"
            >
              {isSubmitting
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
