
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
        <div className='relative w-32 h-16'>
          <Image
            src='https://picsum.photos/seed/partner1/128/64'
            alt='Partner 1'
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className='relative w-32 h-16'>
          <Image
            src='https://picsum.photos/seed/partner2/128/64'
            alt='Partner 2'
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className='relative w-32 h-16'>
          <Image
            src='https://picsum.photos/seed/partner3/128/64'
            alt='Partner 3'
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className='relative w-32 h-16'>
          <Image
            src='https://picsum.photos/seed/partner4/128/64'
            alt='Partner 4'
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className='relative w-32 h-16'>
          <Image
            src='https://picsum.photos/seed/partner5/128/64'
            alt='Partner 5'
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Partners;
