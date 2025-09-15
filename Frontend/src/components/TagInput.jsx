import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes } from 'react-icons/fa';

const TagInput = ({ tags, setTags, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    if (inputValue.trim() !== '' && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          placeholder={placeholder}
          className="flex-grow p-2 bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 focus:border-calm-blue outline-none rounded-t-lg"
        />
        <button type="button" onClick={handleAddTag} className="p-2 bg-calm-blue text-white rounded-md"><FaPlus /></button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <AnimatePresence>
          {tags.map(tag => (
            <motion.div
              key={tag}
              className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
            >
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}><FaTimes className="text-xs" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TagInput;