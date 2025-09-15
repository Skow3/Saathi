import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../components/InputField';
import TagInput from '../components/TagInput';
import { FaUser, FaHeart, FaLightbulb, FaPalette, FaRocket, FaInfoCircle, FaMagic, FaPlus, FaTimes } from 'react-icons/fa';

const sections = [
  { id: 'personal', title: 'Personal Details', icon: <FaUser size={24} /> },
  { id: 'circle', title: 'Your Circle', icon: <FaHeart size={24} /> },
  { id: 'passions', title: 'Your Passions', icon: <FaLightbulb size={24} /> },
  { id: 'tastes', title: 'Your Tastes', icon: <FaPalette size={24} /> },
  { id: 'goals', title: 'Your Goals', icon: <FaRocket size={24} /> },
];

const AboutYou = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', age: '', phone: '', nickname: '',
    connections: [{ id: 1, name: '', relation: '', isClose: false }],
    hobbies: [], skills: [],
    musicTastes: '', movieTastes: '',
    goals: ''
  });
  
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile', {
          withCredentials: true,
        });
        
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            ...response.data,
            connections: response.data.connections?.length > 0 ? response.data.connections : prev.connections,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError("Could not load your profile data.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleFinish = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/profile',
        formData,
        { withCredentials: true }
      );
      
      console.log(response.data.message);
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.error || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => setStep(s => Math.min(sections.length - 1, s + 1));
  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const handleConnectionChange = (index, field, value) => {
    const updatedConnections = [...formData.connections];
    updatedConnections[index] = { ...updatedConnections[index], [field]: value };
    setFormData(prev => ({ ...prev, connections: updatedConnections }));
  };

  const handleAddConnection = () => {
    setFormData(prev => ({
      ...prev,
      connections: [...prev.connections, { id: Date.now(), name: '', relation: '', isClose: false }]
    }));
  };
  
  const handleRemoveConnection = (id) => {
    setFormData(prev => ({
      ...prev,
      connections: prev.connections.filter(c => c.id !== id)
    }));
  };

  const handleTagChange = (field) => (tags) => setFormData(prev => ({ ...prev, [field]: tags }));
  const handleInputChange = (e) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };
  const generatePreferences = () => setFormData(prev => ({ ...prev, musicTastes: 'Calm lo-fi beats, ambient soundscapes.', movieTastes: 'Comforting comedies, nature documentaries.' }));
  
  const progress = ((step + 1) / sections.length) * 100;
  
  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-[#0a192f] dark:via-[#112240] dark:to-[#1a3a69] p-4 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center gap-2 group justify-center mb-4">
          <h1 className="text-4xl font-bold text-dark-gray dark:text-white font-heading">Tell Us About You</h1>
          <div className="relative">
            <FaInfoCircle className="text-gray-400" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <h4 className="font-bold">Why are we asking for this?</h4>
              <p>These details help Saathi provide a more personalized and supportive experience for you.</p>
              <p className="mt-2 text-gray-400">Please note: Your data is private and is never used for training purposes.</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <motion.div 
            className="bg-gradient-to-r from-pink-500 to-yellow-400 h-2.5 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl h-[500px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="absolute inset-0 p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl grid grid-rows-[auto_1fr_auto] relative overflow-hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) handleNext();
              else if (swipe > 10000) handleBack();
            }}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="absolute inset-[-200px] -z-10 bg-gradient-to-br from-pink-500 via-blue-500 to-yellow-400 animate-spin-slow opacity-20" />

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 dark:bg-black/20 rounded-lg">{sections[step].icon}</div>
              <h2 className="text-2xl font-bold text-dark-gray dark:text-white">{sections[step].title}</h2>
            </div>
            
            {error && <div className="text-red-400 text-sm text-center my-2">{error}</div>}

            <div className="space-y-4 overflow-y-auto pr-2 mt-6 mb-6">
              {sections[step].id === 'personal' && (
                <>
                  <InputField id="name" label="Full Name" value={formData.name} onChange={handleInputChange} />
                  <InputField id="nickname" label="Comfort Nickname" value={formData.nickname} onChange={handleInputChange} />
                  <InputField id="age" label="Age" type="number" value={formData.age} onChange={handleInputChange} />
                </>
              )}
              {sections[step].id === 'circle' && (
                <div className="space-y-4">
                  {formData.connections.map((connection, index) => (
                    <motion.div 
                      key={connection.id || index} 
                      className="p-4 bg-black/10 dark:bg-black/20 rounded-lg space-y-3 relative"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <InputField id={`name-${index}`} label="Name" value={connection.name} onChange={(e) => handleConnectionChange(index, 'name', e.target.value)} />
                      <InputField id={`relation-${index}`} label="Relation (e.g., Mom, Best Friend)" value={connection.relation} onChange={(e) => handleConnectionChange(index, 'relation', e.target.value)} />
                      <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id={`isClose-${index}`} checked={!!connection.isClose} onChange={(e) => handleConnectionChange(index, 'isClose', e.target.checked)} className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-600"/>
                        <label htmlFor={`isClose-${index}`} className="text-sm text-dark-gray dark:text-gray-300">Is this person close to you?</label>
                      </div>
                      {formData.connections.length > 1 && (<button type="button" onClick={() => handleRemoveConnection(connection.id)} className="absolute top-2 right-2 text-gray-400 hover:text-white"><FaTimes /></button>)}
                    </motion.div>
                  ))}
                  <button type="button" onClick={handleAddConnection} className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-black/20">
                    <FaPlus /> Add Another Connection
                  </button>
                </div>
              )}
              {sections[step].id === 'passions' && (
                <>
                  <TagInput tags={formData.hobbies} setTags={handleTagChange('hobbies')} placeholder="Add a hobby..." />
                  <TagInput tags={formData.skills} setTags={handleTagChange('skills')} placeholder="Add a skill..." />
                </>
              )}
              {sections[step].id === 'tastes' && (
                <div className="relative">
                  <textarea id="musicTastes" value={formData.musicTastes} onChange={handleInputChange} placeholder="Describe your music taste..." className="w-full h-24 p-2 bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 rounded-t-lg outline-none"/>
                  <textarea id="movieTastes" value={formData.movieTastes} onChange={handleInputChange} placeholder="Describe your movie taste..." className="mt-4 w-full h-24 p-2 bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 rounded-t-lg outline-none"/>
                  <button type="button" onClick={generatePreferences} className="absolute top-0 right-0 mt-1 mr-1 flex items-center gap-2 text-sm bg-pink-500 text-white px-3 py-1 rounded-full">
                    <FaMagic /> Generate with AI
                  </button>
                </div>
              )}
               {sections[step].id === 'goals' && (
                <>
                  <textarea id="goals" value={formData.goals} onChange={handleInputChange} placeholder="What do you hope to achieve with Saathi? (e.g., manage anxiety, build self-esteem...)" className="w-full h-full p-2 bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 rounded-t-lg outline-none resize-none"/>
                </>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} disabled={step === 0} className="py-2 px-6 rounded-lg text-dark-gray dark:text-white disabled:opacity-50">Back</button>
              {step < sections.length - 1 ? (
                <button onClick={handleNext} className="py-2 px-6 bg-calm-blue text-white font-bold rounded-lg">Next</button>
              ) : (
                <button onClick={handleFinish} disabled={isLoading} className="py-2 px-6 bg-pink-500 text-white font-bold rounded-lg disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Finish'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AboutYou;