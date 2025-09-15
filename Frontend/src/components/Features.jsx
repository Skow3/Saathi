// src/components/Features.jsx
import React from 'react';
import Tilt from 'react-parallax-tilt';
import { FaBookOpen, FaMusic, FaPaintBrush, FaGlassWhiskey } from 'react-icons/fa';

const featuresData = [
  { icon: <FaBookOpen />, title: "Mood Journal", description: "Track your daily feelings and thoughts in your private Diary Corner." },
  { icon: <FaMusic />, title: "Personalized Comfort", description: "Saathi suggests uplifting music or movies based on your mood." },
  { icon: <FaPaintBrush />, title: "Creative Outlets", description: "Express yourself on the Drawing Board or through guided yoga." },
  { icon: <FaGlassWhiskey />, title: "Gentle Reminders", description: "Get friendly nudges to stay hydrated and take care of yourself." },
];

const FeatureCard = ({ icon, title, description }) => (
  <Tilt glareEnable={true} glareMaxOpacity={0.1} scale={1.02}>
    {/* Changed for dark mode: Card background and text colors */}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-full text-center">
      <div className="text-calm-blue text-5xl mb-4 inline-block">{icon}</div>
      <h3 className="text-xl font-heading font-bold mb-2 text-dark-gray dark:text-gray-100">{title}</h3>
      <p className="text-dark-gray/80 dark:text-gray-300">{description}</p>
    </div>
  </Tilt>
);

const Features = () => {
  return (
    // Changed for dark mode: Section background and title color
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-heading font-bold text-center mb-12 text-dark-gray dark:text-gray-100">
          A Friend to Support Your Every Mood
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map(feature => <FeatureCard key={feature.title} {...feature} />)}
        </div>
      </div>
    </section>
  );
};

export default Features;