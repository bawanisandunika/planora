import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Calendar, Loader2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setMessage('OTP has been sent to your email.');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      
      setMessage('OTP verified. Please enter your new password.');
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4 font-sans transition-colors duration-500 overflow-hidden">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden relative transform transition-all hover:scale-[1.01] duration-500">
        
        {/* Decorative Top Banner */}
        <div className="h-32 bg-gradient-to-br from-[#8C5A3C] via-[#6a3f24] to-[#4B2E2B] p-6 relative overflow-hidden group flex items-center justify-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C08552] rounded-full mix-blend-multiply opacity-50 filter blur-3xl group-hover:scale-125 transition-transform duration-1000 -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex items-center space-x-2 text-[#FFF8F0]">
            <Calendar className="w-8 h-8" />
            <span className="text-3xl font-bold tracking-tight">Planora</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8 sm:p-10 bg-white">
          <h3 className="text-3xl font-bold text-[#4B2E2B] mb-2 text-center">Reset Password</h3>
          <p className="text-[#8C5A3C] mb-8 text-center text-sm font-medium">
            Remember your password?{' '}
            <Link to="/login" className="font-bold text-[#4B2E2B] hover:text-[#C08552] transition-colors underline decoration-[#C08552] underline-offset-4">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="p-3 mb-4 text-sm text-[#4B2E2B] bg-[#FFF8F0] border-l-4 border-[#C08552] rounded-r-md animate-pulse shadow-sm">
              <p className="mt-1 font-medium text-[#8C5A3C]">{error}</p>
            </div>
          )}

          {message && !error && (
            <div className="p-3 mb-4 text-sm text-[#3b5b2d] bg-[#eef7ea] border-l-4 border-[#4d8636] rounded-r-md shadow-sm">
              <p className="font-medium">{message}</p>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#4B2E2B] mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <Mail className="h-5 w-5 text-[#8C5A3C]" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-2xl focus:outline-none focus:ring-0 focus:border-[#C08552] sm:text-sm font-medium transition-all hover:bg-[#FFF8F0]"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex justify-center items-center py-3.5 px-4 rounded-2xl text-sm font-bold text-[#FFF8F0] bg-gradient-to-r from-[#8C5A3C] to-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3C] disabled:opacity-70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8C5A3C]/20 active:scale-95 group"
              >
                {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Sending...</> : 'Send OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-bold text-[#4B2E2B] mb-1.5 ml-1">
                  Enter OTP sent to your email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <KeyRound className="h-5 w-5 text-[#8C5A3C]" />
                  </div>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-2xl focus:outline-none focus:ring-0 focus:border-[#C08552] text-center tracking-[0.5em] text-xl font-bold transition-all hover:bg-[#FFF8F0]"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex justify-center items-center py-3.5 px-4 rounded-2xl text-sm font-bold text-[#FFF8F0] bg-gradient-to-r from-[#8C5A3C] to-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3C] disabled:opacity-70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8C5A3C]/20 active:scale-95 group"
              >
                {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Verifying...</> : 'Verify OTP'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={handleSendOTP} disabled={loading} className="text-[#8C5A3C] hover:text-[#C08552] text-sm font-bold">
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-[#4B2E2B] mb-1.5 ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <Lock className="h-5 w-5 text-[#8C5A3C]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="block w-full pl-11 pr-12 py-3 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-2xl focus:outline-none focus:ring-0 focus:border-[#C08552] sm:text-sm font-medium transition-all hover:bg-[#FFF8F0]"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8C5A3C] hover:text-[#C08552] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex justify-center items-center py-3.5 px-4 rounded-2xl text-sm font-bold text-[#FFF8F0] bg-gradient-to-r from-[#8C5A3C] to-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3C] disabled:opacity-70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8C5A3C]/20 active:scale-95 group"
              >
                {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Resetting...</> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
