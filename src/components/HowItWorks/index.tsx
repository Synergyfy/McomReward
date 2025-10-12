
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  return (
    <section id='how-it-works' className='py-20 px-8'>
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className='text-3xl font-bold text-center mb-8'
      >
        How It Works
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <Card>
          <CardHeader>
            <div className='w-full h-48 bg-gray-300'></div>
          </CardHeader>
          <CardContent>
            <h3 className='font-bold'>Step 1: Create Your Promotion</h3>
            <p>
              Design your loyalty program with our intuitive interface. Choose
              rewards, set rules, and customize the look and feel.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className='w-full h-48 bg-gray-300'></div>
          </CardHeader>
          <CardContent>
            <h3 className='font-bold'>Step 2: Share with Customers</h3>
            <p>
              Share your promotion via email, social media, or in-store QR
              codes. Make it easy for customers to join.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className='w-full h-48 bg-gray-300'></div>
          </CardHeader>
          <CardContent>
            <h3 className='font-bold'>Step 3: Watch Your Business Grow</h3>
            <p>
              Track customer engagement, reward redemption, and overall impact on
              your business. Make data-driven decisions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default HowItWorks;
