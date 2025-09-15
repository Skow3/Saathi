// src/components/InputField.jsx

import React from 'react';
import { motion } from 'framer-motion';

const InputField = ({ id, label, type = 'text', value, onChange, icon: Icon }) => {
  const isFilled = value && value.length > 0;

  return (
    <div className="relative">
      {Icon && <Icon className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full pt-6 pb-2 px-3 ${Icon ? 'pl-10' : ''} bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 focus:border-calm-blue dark:focus:border-calm-peach outline-none transition-colors duration-300 rounded-t-lg`}
        placeholder=" " // The space is important for the CSS selector to work
      />
      <label
        htmlFor={id}
        className={`absolute left-3 ${Icon ? 'left-10' : ''} top-4 text-gray-500 dark:text-gray-400 transition-all duration-300 pointer-events-none
                   peer-placeholder-shown:top-4 peer-placeholder-shown:text-base 
                   peer-focus:top-1 peer-focus:text-xs peer-focus:text-calm-blue dark:peer-focus:text-calm-peach
                   ${isFilled ? 'top-1 text-xs' : ''}`}
      >
        {label}
      </label>
    </div>
  );
};

// Add a peer-placeholder-shown variant in your CSS if it doesn't work out of the box with your setup
// We'll use a little trick with state (`isFilled`) to make it robust.

export default InputField;