'use client';
import React from 'react';
import { motion } from 'framer-motion';

const Partners = () => {
  return (
    <section className='py-20 px-8'>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className='flex flex-wrap justify-center items-center gap-4 md:gap-8'
      >
        <div className='w-32 h-16 bg-gray-300'></div>
        <div className='w-32 h-16 bg-gray-300'></div>
        <div className='w-32 h-16 bg-gray-300'></div>
        <div className='w-32 h-16 bg-gray-300'></div>
        <div className='w-32 h-16 bg-gray-300'></div>
      </motion.div>
    </section>
  );
};

export default Partners;