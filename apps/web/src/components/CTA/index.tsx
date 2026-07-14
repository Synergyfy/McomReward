import { Button } from '@/components/ui/button';
import React from 'react';

const CTA = () => {
  return (
    <section className='py-20 px-8 bg-light-gray'>
      <div className='text-center'>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>
          Get Started with Beta Pricing
        </h2>
        <p className='mb-8 text-base md:text-lg'>
          Experience the power of digital loyalty. Contact us to learn about our
          special pricing for Beta participants.
        </p>
        <Button>Contact Us</Button>
      </div>
    </section>
  );
};

export default CTA;