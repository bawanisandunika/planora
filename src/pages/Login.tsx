import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Calendar, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4 font-sans transition-colors duration-500 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative transform transition-all hover:scale-[1.01] duration-500 max-h-[90vh]">
        
        {/* Left Side Decorative */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#8C5A3C] via-[#6a3f24] to-[#4B2E2B] p-8 flex-col justify-between relative overflow-hidden group">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C08552] rounded-full mix-blend-multiply opacity-50 filter blur-3xl group-hover:scale-125 transition-transform duration-1000 -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#8C5A3C] rounded-full mix-blend-multiply opacity-50 filter blur-3xl group-hover:scale-125 transition-transform duration-1000 translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 animate-fade-in-up">
            <Link to="/" className="inline-flex items-center space-x-2 text-[#FFF8F0] hover:text-[#C08552] transition-colors">
              <Calendar className="w-8 h-8" />
              <span className="text-2xl font-bold tracking-tight">Planora</span>
            </Link>
          </div>

          <div className="relative z-10 my-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-extrabold text-[#FFF8F0] leading-tight mb-4">
              Welcome back to <br/> extraordinary events.
            </h2>
            <p className="text-[#FFF8F0] opacity-80 text-base">
              Sign in to manage your events, connect with attendees, and create unforgettable experiences.
            </p>
          </div>
          
          <div className="relative z-10 flex space-x-4 opacity-70">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm animate-bounce">
              <PartyPopper className="w-6 h-6 text-[#C08552]" />
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 bg-white flex flex-col justify-center">
          <div className="md:hidden flex items-center justify-center space-x-2 mb-6 text-[#4B2E2B]">
            <Calendar className="w-8 h-8 text-[#8C5A3C]" />
            <span className="text-2xl font-bold tracking-tight">Planora</span>
          </div>

          <h3 className="text-3xl font-bold text-[#4B2E2B] mb-2 text-center md:text-left">Sign In</h3>
          <p className="text-[#8C5A3C] mb-8 text-center md:text-left text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#4B2E2B] hover:text-[#C08552] transition-colors underline decoration-[#C08552] underline-offset-4">
              Create one now
            </Link>
          </p>

          {error && (
            <div className="p-3 mb-4 text-sm text-[#4B2E2B] bg-[#FFF8F0] border-l-4 border-[#C08552] rounded-r-md animate-pulse shadow-sm">
              <p className="font-bold">Sign in failed</p>
              <p className="mt-1 font-medium text-[#8C5A3C]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-2xl focus:outline-none focus:ring-0 focus:border-[#C08552] sm:text-sm font-medium transition-all hover:bg-[#FFF8F0]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
                 <label htmlFor="password" className="block text-sm font-bold text-[#4B2E2B]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#8C5A3C] hover:text-[#C08552] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                  <Lock className="h-5 w-5 text-[#8C5A3C]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-11 pr-12 py-3 bg-[#FFF8F0]/50 text-[#4B2E2B] border-2 border-transparent rounded-2xl focus:outline-none focus:ring-0 focus:border-[#C08552] sm:text-sm font-medium transition-all hover:bg-[#FFF8F0]"
                  placeholder="••••••••"
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
              {loading ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1.5 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;