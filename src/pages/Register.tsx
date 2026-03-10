import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Calendar, Shield, Users, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Participant'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      if (formData.role === 'Participant') {
        navigate('/predict-category', { state: { email: formData.email } });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-2 sm:p-4 font-sans transition-colors duration-500 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative transform transition-all hover:scale-[1.01] duration-500 max-h-[92vh]">
        
        {/* Left side - Banner/Image */}
        <div className="hidden md:flex md:w-5/12 relative bg-gradient-to-tr from-[#8C5A3C] to-[#4B2E2B] overflow-hidden group">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-48 h-48 bg-[#C08552] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="absolute bottom-5 left-5 w-48 h-48 bg-[#4B2E2B] rounded-full mix-blend-multiply filter blur-3xl opacity-30 transition-transform duration-1000 group-hover:translate-x-10"></div>
          
          <div className="relative z-10 flex flex-col justify-center h-full p-6 text-[#FFF8F0]">
            <div className="mb-6 animate-fade-in-up">
              <Calendar className="w-10 h-10 text-white mb-3" />
              <h1 className="text-2xl font-extrabold tracking-tight mb-2">
                Join Planora
              </h1>
              <p className="text-sm text-[#FFF8F0]/80 leading-snug">
                Create an account and connect with our vibrant community. Discover awesome events or start hosting your own.
              </p>
            </div>
            
            <div className="space-y-4 mt-2">
              <div className="flex items-center space-x-3 group/item cursor-default">
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner group-hover/item:bg-white/20 transition-colors">
                  <Users className="w-4 h-4 text-[#C08552]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Join the Community</h3>
                  <p className="text-[#FFF8F0]/70 text-[10px] font-medium">Connect with like-minded individuals.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group/item cursor-default">
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner group-hover/item:bg-white/20 transition-colors">
                  <Shield className="w-4 h-4 text-[#C08552]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Secure & Reliable</h3>
                  <p className="text-[#FFF8F0]/70 text-[10px] font-medium">Your data is safe with our advanced security.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 group/item cursor-default">
                <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner group-hover/item:bg-white/20 transition-colors">
                  <Sparkles className="w-4 h-4 text-[#C08552]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Intuitive Design</h3>
                  <p className="text-[#FFF8F0]/70 text-[10px] font-medium">A seamless experience from start to finish.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-7/12 p-4 sm:p-6 bg-white flex flex-col justify-center overflow-hidden">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center justify-center space-x-2 mb-4 text-[#4B2E2B]">
            <Calendar className="w-6 h-6 text-[#8C5A3C]" />
            <span className="text-xl font-bold tracking-tight">Planora</span>
          </div>

          <div className="mb-4 text-center md:text-left">
            <h2 className="text-xl font-extrabold tracking-tight text-[#4B2E2B]">Create an account</h2>
            <p className="text-xs font-medium text-[#8C5A3C]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#4B2E2B] hover:text-[#C08552] transition-colors underline decoration-[#C08552] underline-offset-4">
                Sign in here
              </Link>
            </p>
          </div>

          {error && (
            <div className="p-2 mb-3 text-xs text-[#4B2E2B] bg-[#FFF8F0] border-l-4 border-[#C08552] rounded-r-sm animate-pulse shadow-sm" role="alert">
              <p className="font-bold">Registration failed</p>
              <p className="mt-0.5 font-medium text-[#8C5A3C]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="name" className="block font-bold text-[#4B2E2B] mb-1 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <User className="h-3.5 w-3.5 text-[#8C5A3C]" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-8 pr-2 py-2 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-xl focus:outline-none focus:ring-0 focus:border-[#C08552] font-medium transition-all hover:bg-[#FFF8F0]"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block font-bold text-[#4B2E2B] mb-1 ml-1">
                  Account Type
                </label>
                <div className="relative group">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full pl-3 pr-6 py-2 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-xl focus:outline-none focus:ring-0 focus:border-[#C08552] font-medium transition-all hover:bg-[#FFF8F0] appearance-none cursor-pointer"
                  >
                    <option value="Participant">Participant</option>
                    <option value="Organizer">Organizer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8C5A3C]">
                    <svg className="h-3 w-3 fill-current transition-transform group-focus-within:-rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block font-bold text-[#4B2E2B] mb-1 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                  <Mail className="h-3.5 w-3.5 text-[#8C5A3C]" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-8 pr-2 py-2 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-xl focus:outline-none focus:ring-0 focus:border-[#C08552] font-medium transition-all hover:bg-[#FFF8F0]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block font-bold text-[#4B2E2B] mb-1 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <Lock className="h-3.5 w-3.5 text-[#8C5A3C]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-8 pr-8 py-2 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-xl focus:outline-none focus:ring-0 focus:border-[#C08552] font-medium transition-all hover:bg-[#FFF8F0]"
                    placeholder="Min 6 chars"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8C5A3C] hover:text-[#C08552] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block font-bold text-[#4B2E2B] mb-1 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <Lock className="h-3.5 w-3.5 text-[#8C5A3C]" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="block w-full pl-8 pr-2 py-2 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-xl focus:outline-none focus:ring-0 focus:border-[#C08552] font-medium transition-all hover:bg-[#FFF8F0]"
                    placeholder="Repeat"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-3 rounded-xl text-[13px] font-bold text-[#FFF8F0] bg-gradient-to-r from-[#8C5A3C] to-[#4B2E2B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3C] disabled:opacity-70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#8C5A3C]/20 active:scale-95 group"
              >
                {loading ? (
                  <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Creating Account...</>
                ) : (
                  <>Create Account <Sparkles className="ml-1.5 h-3.5 w-3.5 transform group-hover:scale-110 transition-transform" /></>
                )}
              </button>
            </div>
            
            <p className="text-[10px] text-center text-[#8C5A3C] mt-2 font-medium">
              By creating an account, you agree to our <a href="#" className="font-bold text-[#4B2E2B] hover:text-[#C08552] hover:underline decoration-[#C08552] underline-offset-2">Terms of Service</a> and <a href="#" className="font-bold text-[#4B2E2B] hover:text-[#C08552] hover:underline decoration-[#C08552] underline-offset-2">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;