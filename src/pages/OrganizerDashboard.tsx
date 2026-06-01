import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Users, Plus, Edit, Eye, MapPin, Clock, Trash2, ChevronDown, ChevronUp, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI } from '@google/genai';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  capacity: number;
  main_image: string | null | File;
  category: string;
  status: string;
  images?: string[];
}

interface Participant {
  id: number;
  name: string;
  email: string;
  registered_at: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<{ [key: number]: Participant[] }>({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imageInputs, setImageInputs] = useState<number[]>([0]);
  const [existingImagesToDelete, setExistingImagesToDelete] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'profile' | 'analytics'>('events');
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || 0,
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Organizer',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [schedulingSuggestion, setSchedulingSuggestion] = useState('');
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  interface AnalyticsEvent {
    id: number;
    title: string;
    date: string;
    category: string;
    status: string;
    capacity: number;
    registrations_count: number;
  }
  interface AnalyticsParticipant {
    name: string;
    email: string;
    event_title: string;
    registered_at: string;
  }
  interface AnalyticsData {
    events: AnalyticsEvent[];
    participants: AnalyticsParticipant[];
    total_registrations: number;
    total_capacity: number;
  }

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: '',
    category: '',
    main_image: null as File | null,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/organizer/${user?.id}`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'analytics' && user?.id && !analyticsData) {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
          const res = await axios.get(
            `http://localhost:5000/api/events/organizer/${user.id}/analytics`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setAnalyticsData(res.data);
        } catch (err) {
          console.error('Error fetching analytics:', err);
        } finally {
          setAnalyticsLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [activeTab, user?.id]);

  const fetchParticipants = async (eventId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/registrations/event/${eventId}`);
      setParticipants((prev) => ({ ...prev, [eventId]: response.data }));
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const generateDescription = async () => {
    if (!newEvent.title || !newEvent.category) {
      alert("Please fill in the Event Title and Category first to generate a description.");
      return;
    }
    
    setIsGeneratingDesc(true);
    try {
      const prompt = `Write a short, engaging description for an event titled "${newEvent.title}".
Category: ${newEvent.category}
Location: ${newEvent.location || 'TBD'}
Date: ${newEvent.date || 'TBD'}
Make it sound exciting and professional.`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert("Gemini API key is not configured.");
        setIsGeneratingDesc(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
      });
      
      const text = response.text;
      
      if (text) {
        setNewEvent({ ...newEvent, description: text });
      } else {
        console.error("Failed to generate description text from result:", response);
        alert("Failed to generate description. Please try again.");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Error generating description. Please try again.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const generateSchedulingAdvice = async () => {
    if (!newEvent.category) {
      alert("Please select a Category first to get scheduling advice.");
      return;
    }

    setIsGeneratingSchedule(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setSchedulingSuggestion("Gemini API key is not configured.");
        setIsGeneratingSchedule(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `As an expert event planner, what is the statistically best day of the week and time of day to host a ${newEvent.category} event to maximize attendance? Please provide a 1-2 sentence compelling suggestion. Be concise.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
      });

      if (response.text) {
        setSchedulingSuggestion(response.text);
      }
    } catch (error) {
      console.error("Error generating scheduling advice:", error);
      setSchedulingSuggestion("Failed to generate scheduling advice. Please try again.");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newEvent).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value as string | Blob);
      }
    });

    newImages.forEach((image) => {
      formData.append('images', image);
    });

    try {
      await axios.post('http://localhost:5000/api/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const response = await axios.get(`http://localhost:5000/api/events/organizer/${user?.id}`);
      setEvents(response.data);

      setShowCreateForm(false);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        capacity: '',
        category: '',
        main_image: null,
      });
      setNewImages([]);
      setImageInputs([0]);
      setSchedulingSuggestion('');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;

    const formData = new FormData();
    Object.entries(editEvent).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'images' && value !== null) {
        formData.append(key, value as string | Blob);
      }
    });

    newImages.forEach((image) => {
      formData.append('images', image);
    });

    existingImagesToDelete.forEach((imageUrl) => {
      formData.append('imagesToDelete', imageUrl);
    });

    try {
      await axios.put(`http://localhost:5000/api/events/${editEvent.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const response = await axios.get(`http://localhost:5000/api/events/organizer/${user?.id}`);
      setEvents(response.data);

      setShowEditForm(false);
      setEditEvent(null);
      setNewImages([]);
      setImageInputs([0]);
      setExistingImagesToDelete([]);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const response = await axios.get(`http://localhost:5000/api/events/organizer/${user?.id}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  setProfileError('');
  setProfileSuccess('');

  try {
    const response = await axios.put(
      `http://localhost:5000/api/users/${user?.id}`,
      {
        name: profile.name,
        email: profile.email,
        currentPassword,
        newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    console.log('Update response:', response.data); // Add this
    setProfileSuccess('Profile updated successfully');
    
    // Verify the returned data
    if (response.data.user) {
      setProfile(response.data.user);
    }

  } catch (error: any) {
    console.error('Update error details:', error.response?.data); // Enhanced logging
    setProfileError(error.response?.data?.message || 'Failed to update profile');
  }
};

  const openEditForm = (event: Event) => {
    setEditEvent(event);
    setShowEditForm(true);
    setNewImages([]);
    setImageInputs([0]);
    setExistingImagesToDelete([]);
  };

  const addImageInput = () => {
    setImageInputs((prev) => [...prev, prev.length]);
  };

  const removeImageInput = (index: number) => {
    setImageInputs((prev) => prev.filter((_, i) => i !== index));
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewImageChange = (index: number, file: File | null) => {
    setNewImages((prev) => {
      const updatedImages = [...prev];
      if (file) {
        updatedImages[index] = file;
      } else {
        updatedImages.splice(index, 1);
      }
      return updatedImages;
    });
  };

  const handleDeleteExistingImage = (imageUrl: string) => {
    setExistingImagesToDelete((prev) => [...prev, imageUrl]);
    if (editEvent) {
      setEditEvent({
        ...editEvent,
        images: editEvent.images?.filter((img) => img !== imageUrl),
      });
    }
  };

  // Handle main image change for edit event
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (editEvent) {
      setEditEvent({
        ...editEvent,
        main_image: file,
      });
    }
  };

  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter((event) => event.status === 'active').length,
    upcomingEvents: events.filter((event) => new Date(event.date) >= new Date()).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="p-4 text-white md:hidden bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Organizer Dashboard</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center w-full px-4 py-2 text-blue-600 bg-white rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center justify-center w-full px-4 py-2 text-blue-600 bg-white rounded-lg"
            >
              <User className="w-5 h-5 mr-2" />
              My Profile
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
              className="flex items-center justify-center w-full px-4 py-2 text-blue-600 bg-white rounded-lg"
            >
              <span className="mr-2 text-base">📊</span>
              Analytics
            </button>
          </div>
        )}
      </div>

      <div className="container px-4 py-6 mx-auto md:py-8 md:px-6 lg:px-8">
        {/* Desktop header */}
        <div className="hidden p-8 mb-8 text-white bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl md:block">
          <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Organizer Dashboard</h1>
              <p className="text-blue-100 md:text-lg">
                Manage your events and track participant engagement.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 font-semibold transition-colors rounded-lg md:px-6 md:py-3 ${
                  activeTab === 'events'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                My Events
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 font-semibold transition-colors rounded-lg md:px-6 md:py-3 ${
                  activeTab === 'profile'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 font-semibold transition-colors rounded-lg md:px-6 md:py-3 ${
                  activeTab === 'analytics'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                📊 Analytics
              </button>
              {activeTab === 'events' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center px-4 py-2 space-x-2 font-semibold text-blue-600 transition-colors bg-white rounded-lg hover:bg-gray-100 md:px-6 md:py-3"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Create Event</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards - Only shown on events tab */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-6 md:mb-8">
            <div className="p-4 bg-white rounded-lg shadow-md sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.totalEvents}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-600 sm:w-12 sm:h-12" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-md sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-green-600 sm:text-3xl">{stats.activeEvents}</p>
                </div>
                <Eye className="w-10 h-10 text-green-600 sm:w-12 sm:h-12" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-md sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-purple-600 sm:text-3xl">{stats.upcomingEvents}</p>
                </div>
                <Clock className="w-10 h-10 text-purple-600 sm:w-12 sm:h-12" />
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">Create New Event</h2>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Event Title</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={newEvent.category}
                          onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                        >
                          <option value="">Select a category</option>
                          <option value="Tech">Tech</option>
                          <option value="Music">Music</option>
                          <option value="Sports">Sports</option>
                          <option value="Business">Business</option>
                          <option value="Education">Education</option>
                          <option value="Art">Art</option>
                          <option value="Food">Food</option>
                          <option value="Health">Health</option>
                        </select>
                      </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Time</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Capacity</label>
                      <input
                        type="number"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                  </div>

                  {/* AI Scheduling Assistant */}
                  <div className="sm:col-span-2 mt-2 mb-4">
                    {schedulingSuggestion ? (
                      <div className="flex items-start px-4 py-3 space-x-3 text-sm text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg animate-fade-in">
                        <span className="text-xl">💡</span>
                        <div className="flex-1">
                           <p className="font-semibold mb-1">AI Scheduling Tip:</p>
                           <p>{schedulingSuggestion}</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={generateSchedulingAdvice}
                        disabled={isGeneratingSchedule || !newEvent.category}
                        className={`flex items-center text-sm font-medium transition-colors ${
                          !newEvent.category 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-indigo-600 hover:text-indigo-800'
                        }`}
                      >
                        {isGeneratingSchedule ? (
                          <span className="flex items-center animate-pulse">
                            <Clock className="w-4 h-4 mr-1" /> Analyzing best times...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> ✨ Get Scheduling Advice for this Category
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <button
                        type="button"
                        onClick={generateDescription}
                        disabled={isGeneratingDesc}
                        className="flex items-center space-x-1 text-sm font-medium text-purple-600 transition-colors hover:text-purple-800 disabled:opacity-50"
                      >
                        {isGeneratingDesc ? (
                          <span className="animate-pulse">✨ Generating...</span>
                        ) : (
                          <span>✨ Generate with AI</span>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewEvent({ ...newEvent, main_image: e.target.files?.[0] || null })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Additional Images</label>
                    {imageInputs.map((index) => (
                      <div key={index} className="flex items-center mb-2 space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleNewImageChange(index, e.target.files?.[0] || null)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageInput(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageInput}
                      className="px-3 py-1.5 mt-1 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 md:px-4 md:py-2"
                    >
                      Add Another Image
                    </button>
                  </div>

                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 md:px-6 md:py-3 md:text-base"
                    >
                      Create Event
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-gray-300 rounded-lg hover:bg-gray-400 md:px-6 md:py-3 md:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {showEditForm && editEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">Edit Event</h2>
                <form onSubmit={handleEditEvent} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Event Title</label>
                      <input
                        type="text"
                        value={editEvent.title}
                        onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={editEvent.category}
                          onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                        >
                          <option value="">Select a category</option>
                          <option value="Tech">Tech</option>
                          <option value="Music">Music</option>
                          <option value="Sports">Sports</option>
                          <option value="Business">Business</option>
                          <option value="Education">Education</option>
                          <option value="Art">Art</option>
                          <option value="Food">Food</option>
                          <option value="Health">Health</option>
                        </select>
                      </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        value={editEvent.date}
                        onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                        
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Time</label>
                      <input
                        type="time"
                        value={editEvent.time}
                        onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={editEvent.location}
                        onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Capacity</label>
                      <input
                        type="number"
                        value={editEvent.capacity}
                        onChange={(e) => setEditEvent({ ...editEvent, capacity: parseInt(e.target.value) })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editEvent.description}
                      onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                    />
                    {editEvent.main_image && (
                      <div className="flex items-center mt-2">
                        {typeof editEvent.main_image === 'object' && editEvent.main_image !== null && 'name' in editEvent.main_image ? (
                          <img
                            src={URL.createObjectURL(editEvent.main_image as File)}
                            alt="Main"
                            className="object-cover w-16 h-16 rounded sm:w-20 sm:h-20"
                          />
                        ) : (
                          <img
                            src={editEvent.main_image as string}
                            alt="Main"
                            className="object-cover w-16 h-16 rounded sm:w-20 sm:h-20"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setEditEvent({ ...editEvent, main_image: null })}
                          className="p-2 ml-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Additional Images</label>
                    {editEvent.images && editEvent.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
                        {editEvent.images.map((img, index) => (
                          !existingImagesToDelete.includes(img) && (
                            <div key={index} className="relative">
                              <img src={img} alt={`Event ${index}`} className="object-cover w-full h-16 rounded sm:h-20" />
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingImage(img)}
                                className="absolute top-0 right-0 p-1 text-white bg-red-600 rounded-full hover:bg-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                    {imageInputs.map((index) => (
                      <div key={index} className="flex items-center mt-2 mb-2 space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleNewImageChange(index, e.target.files?.[0] || null)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageInput(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageInput}
                      className="px-3 py-1.5 mt-1 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 md:px-4 md:py-2"
                    >
                      Add Another Image
                    </button>
                  </div>

                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 md:px-6 md:py-3 md:text-base"
                    >
                      Update Event
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-gray-300 rounded-lg hover:bg-gray-400 md:px-6 md:py-3 md:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-md">
          {activeTab === 'events' ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Your Events</h2>
              </div>

              {events.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <div key={event.id} className="p-4 sm:p-6">
                      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 sm:w-16 sm:h-16">
                                <Calendar className="w-6 h-6 text-white sm:w-8 sm:h-8" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{event.title}</h3>
                              <div className="flex flex-col mt-1 space-y-2 text-xs text-gray-600 sm:flex-row sm:space-y-0 sm:space-x-4 sm:text-sm">
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1 sm:w-4 sm:h-4" />
                                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1 sm:w-4 sm:h-4" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1 sm:w-4 sm:h-4" />
                                  <span>Capacity: {event.capacity}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium sm:px-3 sm:text-sm ${
                              event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {event.status}
                          </span>
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEvent(selectedEvent === event.id ? null : event.id);
                                if (selectedEvent !== event.id) {
                                  fetchParticipants(event.id);
                                }
                              }}
                              className="p-1.5 text-blue-600 transition-colors rounded-lg hover:bg-blue-100 sm:p-2"
                            >
                              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => openEditForm(event)}
                              className="p-1.5 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 sm:p-2"
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1.5 text-red-600 transition-colors rounded-lg hover:bg-red-100 sm:p-2"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Image Gallery */}
                      {event.images && event.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-3">
                          {event.images.map((img, index) => (
                            <img 
                              key={index} 
                              src={img} 
                              alt={`Event ${index}`} 
                              className="object-cover h-20 rounded w-50 sm:h-24" 
                            />
                          ))}
                        </div>
                      )}

                      {/* Participants List */}
                      {selectedEvent === event.id && participants[event.id] && (
                        <div className="pt-4 mt-4 border-t border-gray-200 sm:pt-6 sm:mt-6">
                          <h4 className="mb-3 text-sm font-semibold text-gray-900 sm:text-base sm:mb-4">
                            Participants ({participants[event.id].length})
                          </h4>
                          {participants[event.id].length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {participants[event.id].map((participant) => (
                                <div key={participant.id} className="p-3 text-sm rounded-lg bg-gray-50 sm:p-4">
                                  <p className="font-medium text-gray-900">{participant.name}</p>
                                  <p className="text-gray-600">{participant.email}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Registered: {new Date(participant.registered_at).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">No participants registered yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center sm:p-12">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400 sm:w-16 sm:h-16" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">No Events Yet</h3>
                  <p className="mb-6 text-sm text-gray-600 sm:text-base">
                    Start by creating your first event to engage with your audience.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 sm:px-6 sm:py-3 sm:text-base"
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </>
          ) : activeTab === 'profile' ? (
            /* Profile Tab */
            <div className="p-6">
  <h2 className="mb-6 text-xl font-semibold text-gray-900">Profile Settings</h2>
              
              {profileError && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {profileError}
                </div>
              )}
              
              {profileSuccess && (
                <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center mb-1 text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center mb-1 text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h3 className="flex items-center mb-4 text-sm font-medium text-gray-700">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password to change"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:px-4 md:py-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 md:px-6 md:py-3 md:text-base"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Analytics Tab */
            <div className="p-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">📊 Analytics Overview</h2>
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
                    <div className="p-5 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <p className="text-sm font-medium text-blue-600">Total Registrations</p>
                      <p className="mt-1 text-3xl font-bold text-blue-900">{analyticsData.total_registrations}</p>
                    </div>
                    <div className="p-5 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <p className="text-sm font-medium text-green-600">Capacity Utilization</p>
                      <p className="mt-1 text-3xl font-bold text-green-900">
                        {analyticsData.total_capacity > 0
                          ? Math.round((analyticsData.total_registrations / analyticsData.total_capacity) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div className="p-5 border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <p className="text-sm font-medium text-purple-600">Most Popular Event</p>
                      <p className="mt-1 text-base font-bold truncate text-purple-900">
                        {analyticsData.events.length > 0
                          ? [...analyticsData.events].sort((a, b) => b.registrations_count - a.registrations_count)[0]?.title || '—'
                          : '—'}
                      </p>
                    </div>
                    <div className="p-5 border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                      <p className="text-sm font-medium text-orange-600">Total Events</p>
                      <p className="mt-1 text-3xl font-bold text-orange-900">{analyticsData.events.length}</p>
                    </div>
                  </div>

                  {/* Event Performance Bar Chart */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-base font-semibold text-gray-800">Event Registration Fill Rate</h3>
                    <div className="p-4 space-y-5 rounded-xl bg-gray-50">
                      {analyticsData.events.length === 0 ? (
                        <p className="py-4 text-sm text-center text-gray-500">No events yet.</p>
                      ) : (
                        analyticsData.events.map((event) => {
                          const pct = event.capacity > 0
                            ? Math.min(Math.round((event.registrations_count / event.capacity) * 100), 100)
                            : 0;
                          return (
                            <div key={event.id}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="max-w-xs text-sm font-medium text-gray-700 truncate">{event.title}</span>
                                <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">
                                  {event.registrations_count} / {event.capacity} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full">
                                <div
                                  className={`h-3 rounded-full transition-all duration-700 ${
                                    pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>{event.status}</span>
                                <span className="text-xs text-gray-400">
                                  {event.category} • {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Participants Table */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-800">
                        All Participants ({analyticsData.participants.length})
                      </h3>
                      <button
                        onClick={() => {
                          if (analyticsData.participants.length === 0) return;
                          const headers = ['Name', 'Email', 'Event', 'Registered At'];
                          const rows = analyticsData.participants.map(p => [
                            p.name, p.email, p.event_title,
                            new Date(p.registered_at).toLocaleDateString()
                          ]);
                          const csv = [headers, ...rows]
                            .map(r => r.map(v => `"${v}"`).join(','))
                            .join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'participants.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        ⬇ Download CSV
                      </button>
                    </div>
                    {analyticsData.participants.length === 0 ? (
                      <div className="py-10 text-center text-gray-500 rounded-xl bg-gray-50">
                        No registrations yet across your events.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-left text-gray-600">Name</th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-600">Email</th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-600">Event</th>
                              <th className="px-4 py-3 font-semibold text-left text-gray-600">Registered</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {analyticsData.participants.map((p, i) => (
                              <tr key={i} className="transition-colors hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                                <td className="px-4 py-3 text-gray-600">{p.email}</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                    {p.event_title}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                  {new Date(p.registered_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  Could not load analytics. Please try again.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;