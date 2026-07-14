'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Testimonials = () => {
  return (
    <section id='testimonials' className='py-20 px-8'>
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className='text-3xl font-bold text-center mb-8'
      >
        Loved by Businesses Like Yours
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <Card>
          <CardHeader className='flex flex-row items-center gap-4'>
            <div className='relative w-12 h-12 rounded-full'>
              <Image
                src='https://picsum.photos/seed/sophia/50/50'
                alt='Sophia Carter'
                fill
                style={{ objectFit: 'cover' }}
                className='rounded-full'
              />
            </div>
            <div>
              <CardTitle>Sophia Carter</CardTitle>
              <p className='text-sm'>Coffee Shop Owner</p>
            </div>
          </CardHeader>
          <CardContent>
            <p>
              “Loyalty CardX has transformed our customer engagement. We’ve seen a
              significant increase in repeat business and customer satisfaction.”
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center gap-4'>
            <div className='relative w-12 h-12 rounded-full'>
              <Image
                src='https://picsum.photos/seed/ethan/50/50'
                alt='Ethan Bennett'
                fill
                style={{ objectFit: 'cover' }}
                className='rounded-full'
              />
            </div>
            <div>
              <CardTitle>Ethan Bennett</CardTitle>
              <p className='text-sm'>Boutique Owner</p>
            </div>
          </CardHeader>
          <CardContent>
            <p>
              “The platform is easy to use and the support team is fantastic.
              It’s been a great addition to our marketing strategy.”
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default Testimonials;