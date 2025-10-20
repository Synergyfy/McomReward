import Partners from '@/components/Partners';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Navbar from '@/components/Navbar';
import WhyJoinNow from '@/components/WhyJoinNow';
import Testimonials from '@/components/Testimonials';

export default function Home() {
  return (
    <div className='font-sans'>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <WhyJoinNow />
      <Testimonials />
      <Partners />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}