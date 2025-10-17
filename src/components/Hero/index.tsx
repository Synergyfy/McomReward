
'use client';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import LoginDialog from '@/components/LoginDialog';

const Hero = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  return (
    <section className='flex items-center justify-center py-20 px-8'>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className='flex flex-col md:flex-row items-center gap-16'
      >
        <div className='flex flex-col gap-4 text-center md:text-left'>
          <h1 className='text-4xl md:text-5xl font-bold'>
            Loyalty CardX: Boost Your Business with Digital Loyalty
          </h1>
          <p className='text-base md:text-lg'>
            Join our Beta program and create your first promotion in minutes.
            Engage customers, drive repeat business, and grow your revenue with
            our easy-to-use digital loyalty platform.
          </p>
          <div className='flex gap-4 justify-center md:justify-start'>
            <Button onClick={() => setIsLoginOpen(true)}>Join Beta</Button>
            <Button variant='outline'>Learn More</Button>
          </div>
        </div>
        <div className='relative w-full md:w-1/2 h-[300px] md:h-[400px]'>
          <Image
            src='https://picsum.photos/seed/hero/500/500'
            alt='Digital Loyalty Platform'
            fill
            style={{ objectFit: 'cover' }}
            className='rounded-lg'
          />
        </div>
      </motion.div>
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </section>
  );
};

export default Hero;
