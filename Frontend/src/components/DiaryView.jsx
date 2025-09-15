import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaBookOpen } from 'react-icons/fa';

// Sample initial entries
const initialEntries = [
  {
    id: 1,
    title: 'A Good Day',
    date: 'September 12, 2025',
    content: 'Today was a really good day. I felt calm and focused during my morning walk. The sun was out and it felt nice to just be present in the moment. I should do this more often.'
  },
  {
    id: 2,
    title: 'Feeling a Bit Overwhelmed',
    date: 'September 11, 2025',
    content: 'Work was stressful today. Too many meetings and not enough time to think. I tried the 10-minute breathing exercise in the app and it helped me find some quiet in the chaos.'
  }
];

const DiaryView = () => {
  const [entries, setEntries] = useState(initialEntries);
  const [selectedEntry, setSelectedEntry] = useState(entries[0]);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntryText, setNewEntryText] = useState('');

  const handleSaveEntry = () => {
    if (newEntryText.trim() === '') return;
    const newEntry = {
      id: Date.now(),
      title: `Entry for ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      content: newEntryText,
    };
    setEntries([newEntry, ...entries]);
    setNewEntryText('');
    setIsWriting(false);
    setSelectedEntry(newEntry);
  };

  return (
    <div className="h-full w-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 py-30">
      {/* Left Column: Entry List */}
      <div className="md:col-span-1 bg-gray-900/50 rounded-2xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Your Journal</h2>
          <motion.button 
            onClick={() => { setIsWriting(true); setSelectedEntry(null); }}
            className="p-2 bg-blue-500 rounded-full text-white"
            whileHover={{ scale: 1.1 }}
          >
            <FaPlus />
          </motion.button>
        </div>
        <div className="flex-grow overflow-y-auto space-y-2 pr-2">
          {entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => { setSelectedEntry(entry); setIsWriting(false); }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedEntry?.id === entry.id && !isWriting ? 'bg-blue-500/30' : 'hover:bg-white/10'}`}
            >
              <h3 className="font-semibold text-white truncate">{entry.title}</h3>
              <p className="text-sm text-white/60">{entry.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Content Display */}
      <div className="md:col-span-2 bg-gray-900/50 rounded-2xl p-6">
        <AnimatePresence mode="wait">
          {isWriting ? (
            <motion.div key="writing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-2xl font-bold text-white mb-4">New Entry</h2>
              <textarea
                value={newEntryText}
                onChange={(e) => setNewEntryText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-64 p-3 bg-gray-900/50 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 outline-none text-white/90 resize-none mb-4"
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setIsWriting(false)} className="text-white/70">Cancel</button>
                <button onClick={handleSaveEntry} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full">Save</button>
              </div>
            </motion.div>
          ) : selectedEntry ? (
            <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/90">
              <p className="text-sm text-white/60 mb-2 py-10">{selectedEntry.date}</p>
              <h2 className="text-3xl font-bold text-white mb-4">{selectedEntry.title}</h2>
              <p className="whitespace-pre-wrap leading-relaxed">{selectedEntry.content}</p>
            </motion.div>
          ) : (
             <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center text-white/50">
                <FaBookOpen size={48} className="mb-4"/>
                <h3 className="text-xl font-semibold">Your personal diary</h3>
                <p>Select an entry to read, or create a new one.</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiaryView;