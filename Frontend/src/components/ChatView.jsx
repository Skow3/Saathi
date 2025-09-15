import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const ChatView = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello there! I'm Saathi. How are you feeling today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    
    // 1. Add the user's message to the UI immediately for a responsive feel
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 2. Send the message to your Flask backend
      const response = await axios.post(
        'http://127.0.0.1:8000/text-chat',
        { query: userMessage.text }, // The payload must match what your backend expects
        { withCredentials: true }     // This is crucial for sending the session cookie
      );

      // 3. Create the AI reply object from the backend's response
      const aiReply = { 
        id: Date.now() + 1, 
        text: response.data.reply, 
        sender: 'ai' 
      };

      // 4. Add the AI's reply to the message list
      setMessages(prev => [...prev, aiReply]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorReply = {
        id: Date.now() + 1,
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Message Display Area */}
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-700 text-white/90 rounded-bl-none'}`}>
              <p>{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div 
            className="flex items-end gap-2 justify-start"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div className="p-3 rounded-2xl bg-gray-700 flex space-x-1">
              <motion.span className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
              <motion.span className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: 0.1, repeat: Infinity }} />
              <motion.span className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tell me anything..."
          className="flex-grow p-3 bg-gray-900/50 rounded-full border border-gray-600 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
        />
        <button type="submit" className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatView;