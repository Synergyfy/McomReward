
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  return (
    <section id='features' className='py-20 px-8'>
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className='text-3xl font-bold text-center mb-8'
      >
        Why Choose Loyalty CardX?
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-3 gap-8'
      >
        <Card>
          <CardHeader>
            <CardTitle>Engage Your Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Connect with your customers on a personal level and keep them
              coming back.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reward Loyalty</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Offer exclusive rewards and incentives to your most loyal customers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Track Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Monitor your promotion&apos;s success and optimize for better results.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default Features;
