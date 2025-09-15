import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import axios from 'axios';
import InputField from '../components/InputField';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import signupAnimation from '../animations/signup.json';
import ThoughtClouds from '../components/ThoughtClouds';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/login', {
        email: email,
        password: password,
      }, { withCredentials: true }); // Important for session cookies

      if (response.data.success) {
        // Call the login function from AuthContext to update the global state
        // Assuming the backend session sets user info, which check_session will pick up
        login({ email }); 
        
        // Redirect to the dashboard on successful login
        navigate('/aboutyou');
      }

    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'An unknown error occurred.');
      } else {
        setError('Could not connect to the server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gradient-to-br dark:from-[#0a192f] dark:via-[#112240] dark:to-[#1a3a69] p-4">
     
      <motion.div 
        className="relative z-10 w-full max-w-4xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-[-200px] -z-10 bg-gradient-to-br from-pink-500 via-blue-500 to-yellow-400 animate-spin-slow opacity-20" />

        <div className="relative hidden md:flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-black/20">
          <ThoughtClouds />
          <Lottie animationData={signupAnimation} loop={true} className="w-full relative z-10" />
          <p className="relative z-10 mt-4 text-center text-lg text-gray-600 dark:text-white/80">
            Welcome back. Your safe space awaits you.
          </p>
        </div>
        
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-heading font-bold text-dark-gray dark:text-gray-100 mb-4">
            Welcome Back
          </h2>

          {error && (
            <motion.div 
              className="p-3 mb-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg text-center text-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={formVariants}><InputField id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={FaEnvelope} /></motion.div>
            <motion.div variants={formVariants}><InputField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={FaLock} /></motion.div>
            
            <motion.div variants={formVariants} className="text-right">
              <a href="#" className="text-sm font-medium text-calm-blue hover:underline">Forgot Password?</a>
            </motion.div>
            
            <motion.div variants={formVariants}>
              <motion.button 
                type="submit"
                className="w-full bg-calm-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-calm-peach disabled:opacity-50"
                whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Logging In...' : 'Log In'}
              </motion.button>
            </motion.div>
          </motion.form>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account? <Link to="/signup" className="font-medium text-calm-blue hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;