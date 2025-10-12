'use client';
import { Button } from '@/components/ui/button';
import React from 'react';
import { motion } from 'framer-motion';

const FinalCTA = () => {
  return (
    <section className='py-20 px-8'>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className='text-center'
      >
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>Ready to Grow Your Business?</h2>
        <p className='mb-8 text-base md:text-lg'>
          Join the Loyalty CardX Beta program today and start building stronger
          customer relationships.
        </p>
        <Button>Get Started Now</Button>
      </motion.div>
    </section>
  );
};

export default FinalCTA;