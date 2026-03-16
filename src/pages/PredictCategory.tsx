// src/pages/PredictCategory.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Activity, 
  MonitorPlay, 
  Music, 
  Briefcase, 
  GraduationCap, 
  Utensils, 
  Dumbbell,
  Loader2
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Interests', icon: Heart },
  { id: 3, title: 'Preferences', icon: Sparkles },
];

const PredictCategory: React.FC = () => {
  const [formData, setFormData] = useState({
    age: 18,
    gender: 'Male',
    tech_spend: 3,
    music_freq: 3,
    sports_hours: 3,
    business_interest: 3,
    edu_freq: 3,
    food_interest: 3,
    health_priority: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const [suggestion, setSuggestion] = useState('');
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 10;
        return prev;
      });
    }, 200);

    try {
      const predictionResponse = await axios.post('http://localhost:5001/predict', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      const predictedCategory = predictionResponse.data.prediction;

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        setLoading(false);
        clearInterval(progressInterval);
        return;
      }

      await axios.patch(
        'http://localhost:5000/api/auth/update-preference',
        { email, preference: predictedCategory },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProgress(100);
      clearInterval(progressInterval);
      setResult(`Your vibe is: ${predictedCategory}`);

      setGeneratingSuggestion(true);
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const prompt = `The user's favorite event category is ${predictedCategory}. Suggest one other complementary event category they might enjoy (e.g., if Tech, suggest Music for relaxation; if Sports, suggest Art for creativity). Provide a single, friendly sentence explaining why it's a good complement for them. Be brief.`;
          
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          
          if (response.text) {
            setSuggestion(response.text);
          }
        } else {
             console.warn("Gemini API key not found. Skipping AI suggestion.");
        }
      } catch (aiError) {
        console.error("Failed to generate AI suggestion:", aiError);
      } finally {
        setGeneratingSuggestion(false);
      }

      setTimeout(() => navigate('/'), 8000);
    } catch (err: any) {
      console.error('Error:', err);
      clearInterval(progressInterval);
      if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check if the server is running.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update preference');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const RatingSelect = ({ name, label, icon: Icon, value }: { name: string, label: string, icon: any, value: number }) => (
    <div className="p-5 transition-all duration-300 border shadow-sm bg-white/50 backdrop-blur-md rounded-2xl border-white/40 hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 text-[#8C5A3C] rounded-lg bg-[#FFF8F0]">
          <Icon size={20} />
        </div>
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      </div>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleChange(name, num)}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              value === num 
                ? 'bg-[#8C5A3C] text-white shadow-lg shadow-[#8C5A3C]/30 scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-[#FFF8F0] hover:text-[#8C5A3C] hover:scale-105'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="p-6 transition-all border shadow-sm bg-white/50 backdrop-blur-md rounded-2xl border-white/40 hover:shadow-md">
              <label className="block mb-4 text-sm font-semibold text-gray-700">How old are you?</label>
              <div className="flex items-center gap-6">
                <input
                  type="range"
                  min="16"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  className="flex-1 h-3 rounded-lg appearance-none bg-gradient-to-r from-[#C08552]/40 to-[#8C5A3C]/40 accent-[#8C5A3C] cursor-grab active:cursor-grabbing"
                />
                <motion.div 
                  key={formData.age}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-[#4B2E2B] shadow-inner bg-[#FFF8F0] rounded-2xl"
                >
                  {formData.age}
                </motion.div>
              </div>
            </div>

            <div className="p-6 transition-all border shadow-sm bg-white/50 backdrop-blur-md rounded-2xl border-white/40 hover:shadow-md">
              <label className="block mb-4 text-sm font-semibold text-gray-700">How do you identify?</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleChange('gender', option)}
                    className={`py-3 px-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                      formData.gender === option 
                        ? 'bg-[#8C5A3C] text-white shadow-lg shadow-[#8C5A3C]/30 ring-2 ring-[#8C5A3C] ring-offset-2' 
                        : 'bg-gray-100 text-gray-600 hover:bg-[#FFF8F0] hover:text-[#8C5A3C]'
                    }`}
                  >
                    {option === 'Prefer not to say' ? 'Skip' : option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <RatingSelect name="tech_spend" label="Tech Spending Frequency" icon={MonitorPlay} value={formData.tech_spend} />
            <RatingSelect name="music_freq" label="Music Event Attendance" icon={Music} value={formData.music_freq} />
            <RatingSelect name="sports_hours" label="Active Sports Hours" icon={Dumbbell} value={formData.sports_hours} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <RatingSelect name="business_interest" label="Interest in Business Events" icon={Briefcase} value={formData.business_interest} />
            <RatingSelect name="edu_freq" label="Educational Workshops" icon={GraduationCap} value={formData.edu_freq} />
            <RatingSelect name="food_interest" label="Culinary Expressions" icon={Utensils} value={formData.food_interest} />
            <RatingSelect name="health_priority" label="Health & Wellness Priority" icon={Activity} value={formData.health_priority} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (result) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-[#FFF8F0] via-white to-[#FFF8F0]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg p-8 text-center bg-white/80 backdrop-blur-xl shadow-2xl border border-white/40 rounded-3xl"
        >
          <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
             className="inline-flex items-center justify-center w-24 h-24 mb-6 text-green-500 rounded-full shadow-lg bg-green-50"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <h2 className="mb-2 text-3xl font-bold text-gray-800">All Set!</h2>
          <div className="p-4 mb-6 border bg-gradient-to-r from-[#C08552] to-[#8C5A3C] rounded-2xl border-white/20">
             <p className="text-xl font-medium text-white">{result}</p>
          </div>

          <AnimatePresence>
            {(generatingSuggestion || suggestion) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 mb-8 text-left border shadow-md bg-[#FFF8F0]/80 rounded-2xl border-[#C08552]/20"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl animate-pulse">✨</span>
                  <div className="flex-1 text-sm font-medium text-[#4B2E2B] leading-relaxed">
                    {generatingSuggestion ? (
                        <span className="flex items-center gap-2 text-[#8C5A3C]">
                          <Loader2 size={16} className="animate-spin" />
                          Finding complementary events...
                        </span>
                    ) : (
                      suggestion
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
             onClick={() => navigate('/')}
             className="inline-flex items-center justify-center w-full px-6 py-4 text-sm font-bold tracking-wide text-white uppercase transition-all shadow-lg rounded-xl bg-[#4B2E2B] hover:bg-[#8C5A3C] hover:shadow-xl hover:-translate-y-0.5"
          >
             Go to Dashboard
             <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFF8F0] via-white to-[#FFF8F0] font-sans">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#8C5A3C] to-[#C08552]"
          >
            Personalize Your Experience
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-[#4B2E2B]"
          >
            Help us understand what excites you the most.
          </motion.p>
        </div>

        <div className="p-8 shadow-2xl bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem]">
          {/* Progress Steps */}
          <div className="relative mb-12">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#C08552] to-[#8C5A3C] -translate-y-1/2 rounded-full z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="relative z-10 flex justify-between">
              {steps.map((step) => {
                const StepIcon = step.icon;
                const isActive = currentStep >= step.id;
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2">
                    <motion.div 
                      className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#8C5A3C] text-white shadow-lg shadow-[#8C5A3C]/40' 
                          : 'bg-white text-gray-400 border border-gray-200'
                      } ${isCurrent ? 'scale-110 ring-4 ring-[#FFF8F0]' : ''}`}
                    >
                      <StepIcon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                    </motion.div>
                    <span className={`text-xs font-semibold ${isActive ? 'text-[#8C5A3C]' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl"
             >
               {error}
             </motion.div>
          )}

          {/* Form Content */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={prevStep}
              className={`flex items-center px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                currentStep === 1 
                  ? 'opacity-0 pointer-events-none' 
                  : 'text-gray-600 bg-gray-100 hover:bg-[#FFF8F0] hover:text-[#8C5A3C]'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
            
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className="flex items-center px-8 py-3 text-sm font-bold text-white transition-all shadow-xl bg-gradient-to-r from-[#C08552] to-[#8C5A3C] rounded-xl hover:shadow-[#8C5A3C]/30 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
                </>
              ) : currentStep === 3 ? (
                <>Submit <CheckCircle2 className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
              )}
            </button>
          </div>
          
          {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-[2rem]">
               <div className="w-48 h-2 mb-4 bg-gray-200 rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-[#8C5A3C]"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                 />
               </div>
               <p className="font-medium text-[#8C5A3C] animate-pulse">Analyzing your vibe...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictCategory;