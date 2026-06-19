"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Eye, EyeOff, Mail, Key, Shield, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import axios from "axios";

export default function ForgotPassword({ storeId }) {
  const [step, setStep] = useState('verify'); // verify, otp, reset, forgot
  const [mode, setMode] = useState('with_password'); // with_password, forgot
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Get email from localStorage
    const storeData = localStorage.getItem("storeData");
    if (storeData) {
      try {
        const parsed = JSON.parse(storeData);
        const userEmail = parsed.email || parsed.storeInfo?.email || parsed.contactEmail || parsed.ownerEmail;
        if (userEmail) {
          setEmail(userEmail);
        } else {
          const storedEmail = localStorage.getItem("userEmail");
          if (storedEmail) setEmail(storedEmail);
        }
      } catch (e) {
        console.error("Error parsing storeData:", e);
      }
    }
  }, []);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Password strength checker
  useEffect(() => {
    if (newPassword) {
      let strength = 0;
      if (newPassword.length >= 6) strength++;
      if (newPassword.length >= 8) strength++;
      if (/[A-Z]/.test(newPassword)) strength++;
      if (/[0-9]/.test(newPassword)) strength++;
      if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
      setPasswordStrength(Math.min(strength, 4));
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthText = () => {
    switch(passwordStrength) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const sendOtp = async () => {
    if (!email) {
      setError("Email not found. Please contact support.");
      return false;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
        storeId
      });

      if (response.data.success) {
        console.log("OTP sent successfully");
        return true;
      } else {
        setError(response.data.message || "Failed to send OTP");
        return false;
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');

    try {
      const otpSent = await sendOtp();
      if (otpSent) {
        setMode('forgot');
        setStep('otp');
        setResendTimer(60);
        setError('');
      }
    } catch (err) {
      console.error("Error in forgot password:", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-password`, {
        storeId,
        password: currentPassword
      });

      if (response.data.success) {
        const otpSent = await sendOtp();
        if (otpSent) {
          setMode('with_password');
          setStep('otp');
          setResendTimer(60);
          setError('');
        }
      } else {
        setError("Current password is incorrect");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      setError(err.response?.data?.message || "Failed to verify password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        storeId,
        otp
      });

      if (response.data.success) {
        setStep('reset');
        setError('');
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(err.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await sendOtp();
    setResendTimer(60);
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        storeId,
        newPassword,
        otp
      };

      // Only include currentPassword if we're in with_password mode
      if (mode === 'with_password') {
        payload.currentPassword = currentPassword;
      }

      const response = await axios.post(`${API_URL}/api/auth/change-password`, payload);

      if (response.data.success) {
        setSuccess("Password changed successfully!");
        setTimeout(() => {
          setStep('verify');
          setMode('with_password');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setOtp('');
          setSuccess('');
        }, 3000);
      } else {
        setError(response.data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.response?.data?.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetToVerify = () => {
    setStep('verify');
    setMode('with_password');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setError('');
    setSuccess('');
  };

  const getStepTitle = () => {
    if (step === 'otp') return 'Verify OTP';
    if (step === 'reset') return 'Reset Password';
    if (mode === 'forgot') return 'Forgot Password';
    return 'Change Password';
  };

  const getStepDescription = () => {
    if (step === 'otp') return `Enter the 6-digit code sent to ${email}`;
    if (step === 'reset') return 'Create a new secure password';
    if (mode === 'forgot') return 'Reset your password without current password';
    return 'Enter your current password to continue';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 flex items-center justify-center">
              <Key size={20} className="text-[#a3e635]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getStepTitle()}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{getStepDescription()}</p>
            </div>
          </div>
          
          {/* Forgot Password Button - Only show in verify step with password mode */}
          {step === 'verify' && mode === 'with_password' && (
            <button
              onClick={() => setMode('forgot')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#a3e635] hover:text-[#bef264] transition bg-[#a3e635]/10 rounded-lg"
            >
              <HelpCircle size={14} />
              Forgot Password?
            </button>
          )}
          
          {/* Back to normal mode button - Only show in forgot mode before reset */}
          {step === 'verify' && mode === 'forgot' && (
            <button
              onClick={() => setMode('with_password')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition bg-gray-100 rounded-lg"
            >
              ← Back to normal
            </button>
          )}
        </div>
      </div>

      {/* Stats / Info Cards */}
      {(step === 'verify' || step === 'otp') && (
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-100">
          <div className={`text-center transition-all ${step === 'verify' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 ${step === 'verify' ? 'bg-[#a3e635] text-gray-900' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <p className="text-xs font-medium text-gray-700">
              {mode === 'forgot' ? 'Request Reset' : 'Verify Password'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {mode === 'forgot' ? 'Send OTP to email' : 'Enter current password'}
            </p>
          </div>
          <div className={`text-center transition-all ${step === 'otp' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 ${step === 'otp' ? 'bg-[#a3e635] text-gray-900' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <p className="text-xs font-medium text-gray-700">Verify OTP</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Check your email</p>
          </div>
          <div className={`text-center transition-all ${step === 'reset' ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 ${step === 'reset' ? 'bg-[#a3e635] text-gray-900' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
            <p className="text-xs font-medium text-gray-700">Reset Password</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Create new password</p>
          </div>
        </div>
      )}

      {/* Reset step stats */}
      {step === 'reset' && (
        <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-[#a3e635] mx-auto flex items-center justify-center mb-2 text-gray-900 font-bold">
              ✓
            </div>
            <p className="text-xs font-medium text-gray-700">OTP Verified</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Identity confirmed</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-[#a3e635] mx-auto flex items-center justify-center mb-2 text-gray-900 font-bold">
              3
            </div>
            <p className="text-xs font-medium text-gray-700">Set New Password</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Create secure password</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Verify Current Password or Forgot Password */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Email Address</p>
                  <p className="text-sm text-blue-700 mt-1 font-mono">{email || "Loading..."}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    {mode === 'forgot' 
                      ? 'A 6-digit OTP will be sent to this email for verification'
                      : 'A 6-digit OTP will be sent to this email after password verification'}
                  </p>
                </div>
              </div>
            </div>

            {mode === 'with_password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a3e635] focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyCurrentPassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Forgot Password Mode</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      An OTP will be sent to your registered email address. 
                      You can reset your password without entering your current password.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={mode === 'forgot' ? handleForgotPassword : handleVerifyCurrentPassword}
              disabled={loading}
              className="w-full py-2.5 bg-[#a3e635] text-gray-900 rounded-lg font-medium hover:bg-[#bef264] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  {mode === 'forgot' ? 'Send Reset OTP' : 'Verify & Send OTP'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Verification Code Sent</p>
                  <p className="text-sm text-green-700 mt-1">We've sent a 6-digit code to:</p>
                  <p className="text-sm font-semibold text-green-800 mt-0.5 font-mono">{email}</p>
                  <p className="text-xs text-green-600 mt-2">
                    Please check your inbox and spam folder
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a3e635] focus:border-transparent text-center text-2xl tracking-widest font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className="text-sm text-[#a3e635] hover:text-[#bef264] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <RefreshCw size={12} />
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
              <button
                onClick={resetToVerify}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← Back
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 bg-[#a3e635] text-gray-900 rounded-lg font-medium hover:bg-[#bef264] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Password Requirements:</p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                <li>• Minimum 6 characters long</li>
                <li>• Should be different from your current password</li>
                <li>• Both password fields must match</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a3e635] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all ${
                          passwordStrength >= level ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    Password strength: <span className="font-medium">{getStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a3e635] focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-600" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('otp')}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="flex-1 py-2.5 bg-[#a3e635] text-gray-900 rounded-lg font-medium hover:bg-[#bef264] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}