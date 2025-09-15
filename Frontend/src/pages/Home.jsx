import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Impact from '../components/Impact';
import Playground from '../components/Playground';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <main>
      <Hero />
      <Features />
      <Impact />
      <Playground />
      <Footer />
    </main>
  );
};

export default Home;