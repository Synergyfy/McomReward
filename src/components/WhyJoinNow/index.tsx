'use client';
import { Button } from '@/components/ui/button';
import React from 'react';
import { motion } from 'framer-motion';

const WhyJoinNow = () => {
  return (
    <section className='py-20 px-8'>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'
      >
        <div>
          <h2 className='text-3xl font-bold mb-4'>Why Join Now?</h2>
          <p className='mb-4'>
            Loyalty CardX is more than just a loyalty program; it’s a growth
            engine for your business. By joining our Beta program, you’ll gain
            early access to cutting-edge features, dedicated support, and a
            community of like-minded business owners. Plus, you’ll have the
            opportunity to shape the future of our platform and help us build
            the best loyalty solution for small businesses.
          </p>
          <Button>Claim Your Spot</Button>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='w-full h-48 bg-gray-300'></div>
          <div className='w-full h-48 bg-gray-300'></div>
          <div className='w-full h-48 bg-gray-300'></div>
          <div className='w-full h-48 bg-gray-300'></div>
        </div>
      </motion.div>
    </section>
  );
};

export default WhyJoinNow;