"use client";

import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import Footer from "@/components/Footer";
import FrontPageNavbar from "@/components/frontPageNavbar";
import Image from "next/image";

export default function Landing() {
      const controls = useAnimation();
      const ref = useRef<HTMLDivElement | null>(null);
      const inView = useInView(ref, { amount: 0.4 }); // 👀 detects section visibility
      useEffect(() => {
      if (inView) {
      controls.start({
      x: 0,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeOut" },
      });
      } else {
      controls.start({
      x: "100%",
      opacity: 0,
      transition: { duration: 1, ease: "easeInOut" },
      });
      }
      }, [inView, controls]);

      const testimonials = [
      {
      name: "Toby’s Café",
      role: "Local Coffee Shop Owner",
      quote:
      "Repeat customers up 40% in 3 months — the QR rewards just work!",
      image: "https://randomuser.me/api/portraits/men/11.jpg",
      },
      {
      name: "Sunny Bakery",
      role: "Bakery Owner",
      quote: "Simple setup, customers love scanning to earn points!",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      },
      {
      name: "City Bookstore",
      role: "Retail Manager",
      quote:
      "Our referral network grew like crazy with the affiliate system.",
      image: "https://randomuser.me/api/portraits/men/44.jpg",
      },
      ];

      const [current, setCurrent] = useState(0);

      // Auto-slide
      useEffect(() => {
      const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(timer);
      }, [testimonials.length]);

      const prev = (current - 1 + testimonials.length) % testimonials.length;
      const next = (current + 1) % testimonials.length;

      const [heroCurrent, setHeroCurrent] = useState(0);
      useEffect(() => {
      const timer = setInterval(() => {
      setHeroCurrent((prev) => (prev + 1) % 3);
      }, 6000);
      return () => clearInterval(timer);
      }, []);
  return (
    <>
      <Head>
        <title>MCOM REWARD – Reward Local Customers</title>
      </Head>
      <FrontPageNavbar />
      {/* 🟠 Hero Slider Section */}
      <section className="relative overflow-hidden text-white">
        <motion.div
          className="relative w-full h-[90vh] flex transition-transform duration-700 ease-in-out"
          animate={{ x: `-${current * 100}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {[
            {
              title: "Reward Loyalty. Grow Effortlessly.",
              subtitle:
                "Run QR-based reward programs, track performance, and delight customers — all in minutes.",
              image: "/hero.jpg", // you can use your uploaded image
              cta1: "Get Started Free",
              cta1Path: "/signup",
              cta2: "Learn More",
              cta2Path: "/features",
            },
            {
              title: "Boost Engagement. Retain Customers.",
              subtitle:
                "Create campaigns that customers love — personalized rewards and gamified experiences.",
              image:
                "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1600&q=80",
              cta1: "View Features",
              cta1Path: "/features",
              cta2: "Try Demo",
              cta2Path: "/demo",
            },
            {
              title: "Your Brand. Your Loyalty System.",
              subtitle:
                "Fully customizable loyalty experiences designed for cafes, gyms, salons, and stores.",
              image:
                "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1600&q=80",
              cta1: "Start Now",
              cta1Path: "/signup",
              cta2: "See Pricing",
              cta2Path: "/pricing",
            },
          ].map((slide, i) => (
            <div
              key={i}
              className="min-w-full h-[90vh] flex flex-col items-center justify-center text-center relative"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                width={1600}
                height={900}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 via-orange-500/70 to-yellow-400/70"></div>
              <div className="relative z-10 max-w-3xl mx-auto px-6">
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg text-white/90 mb-10">{slide.subtitle}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={slide.cta1Path}>
                    <span className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition">
                      {slide.cta1}
                    </span>
                  </Link>
                  <Link href={slide.cta2Path}>
                    <span className="border border-white text-white px-8 py-3 rounded-full hover:bg-white/10 transition">
                      {slide.cta2}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* 🔘 Slider Indicators */}
        <div className="absolute bottom-8 w-full flex justify-center gap-3 z-20">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                current === i ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>
      {/* 🎬 How It Works */}
      <section
        ref={ref}
        id="how-it-works"
        className="py-32 bg-white max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20 overflow-hidden"
      >
        {/* iPhone mockup with scroll-based animation */}
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={controls}
          className="relative w-full lg:w-1/2 flex justify-center"
        >


        <div className="w-[260px] sm:w-[320px] md:w-[380px] aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ"
            title="YouTube Video Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </motion.div>



        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false }}
          className="w-full lg:w-1/2 text-center lg:text-left"
        >
          <h2 className="text-5xl lg:text-6xl font-extrabold text-orange-500 mb-8 leading-tight">
            How It Works
          </h2>
          <p className="text-gray-700 text-xl lg:text-2xl mb-10">
             MCOM REWARD helps your business grow repeat customers effortlessly — from setup to reward in minutes.
          </p>
          <ul className="space-y-6 text-gray-800 text-lg lg:text-xl leading-relaxed">
            <li><b>Create</b> — Build your reward campaign in minutes.</li>
            <li> <b>Share</b> — Print QR posters or share links instantly.</li>
            <li><b>Reward</b> — Customers scan, earn, and redeem points.</li>
            <li><b>Track</b> — Get real-time insights and ROI data.</li>
          </ul>
        </motion.div>
      </section>
      {/* 🎡 Rewards & Loyalty Programs Carousel */}
      <section id="rewards" className="py-28 bg-gray-50 text-center overflow-hidden relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold text-orange-500 mb-16"
        >
          Rewards & Loyalty Programs
        </motion.h2>

        <div className="relative max-w-7xl mx-auto px-6 overflow-hidden">
          <motion.div
            className="flex gap-8 overflow-hidden snap-x snap-mandatory pb-6 hide-scrollbar"
            initial={{ x: 0 }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            }}
            style={{ width: "max-content" }}
          >
            {[
              {
                title: "Points-Based Rewards",
                desc: "Earn points for every purchase and redeem them for gifts or discounts.",
                image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=80",
              },
              {
                title: "Stamp & Visit Programs",
                desc: "Encourage repeat visits — collect digital stamps to unlock free rewards.",
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
              },
              {
                title: "Tiered Loyalty Levels",
                desc: "Silver, Gold, Platinum — reward loyal customers with exclusive perks and status.",
                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80",
              },
              {
                title: "Referral Programs",
                desc: "Turn customers into advocates — they earn when friends join and purchase.",
                image: "https://images.unsplash.com/photo-1581093588401-22d8f23f3d1a?auto=format&fit=crop&w=900&q=80",
              },
              {
                title: "Gift & Store Credit",
                desc: "Offer reloadable gift cards and wallet credits to boost return purchases.",
                image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="snap-center flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden shadow-lg border border-orange-100"
              >
                <div className="h-52 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={320}
                    height={208}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-left">
                  <h3 className="text-2xl font-bold text-orange-500 mb-3">{item.title}</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{item.desc}</p>
                  <Link
                    href="/features"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition"
                  >
                    Read More
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-16">
          <Link
            href="/features"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold px-10 py-4 rounded-full transition"
          >
            Explore All Rewards
          </Link>
        </div>
      </section>
       {/* 💬 Testimonials Section (Tony Robbins-style) */}
      <section
            id="testimonials"
            className="py-28 bg-white text-center px-6 lg:px-10 overflow-hidden relative"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-orange-500 mb-16">
              What Businesses Say
            </h2>

            <div className="relative max-w-7xl mx-auto flex items-center justify-center">
              {/* Left card */}
              <motion.div
                key={prev}
                initial={{ opacity: 0, x: -100, scale: 0.8, rotateY: 25 }}
                animate={{ opacity: 0.6, x: -180, scale: 0.8, rotateY: 25 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.8 }}
                className="absolute hidden md:block bg-orange-50 shadow-md rounded-2xl p-8 max-w-sm border border-orange-100"
                style={{ perspective: 1000 }}
              >
                <p className="italic text-gray-600">
                  “{testimonials[prev].quote}”
                </p>
                <footer className="mt-4 text-orange-500 font-semibold">
                  — {testimonials[prev].name}
                </footer>
              </motion.div>

              {/* Center card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -30 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="relative bg-white shadow-2xl rounded-3xl p-10 md:p-16 max-w-3xl border border-orange-100 z-10"
                >
                  <div className="flex flex-col items-center text-center">
                    <Image
                      src={testimonials[current].image}
                      alt={testimonials[current].name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-4 border-orange-200 mb-6"
                    />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {testimonials[current].name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      {testimonials[current].role}
                    </p>
                    <blockquote className="text-gray-700 text-lg md:text-xl italic leading-relaxed">
                      “{testimonials[current].quote}”
                    </blockquote>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Right card */}
              <motion.div
                key={next}
                initial={{ opacity: 0, x: 100, scale: 0.8, rotateY: -25 }}
                animate={{ opacity: 0.6, x: 180, scale: 0.8, rotateY: -25 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.8 }}
                className="absolute hidden md:block bg-orange-50 shadow-md rounded-2xl p-8 max-w-sm border border-orange-100"
                style={{ perspective: 1000 }}
              >
                <p className="italic text-gray-600">
                  “{testimonials[next].quote}”
                </p>
                <footer className="mt-4 text-orange-500 font-semibold">
                  — {testimonials[next].name}
                </footer>
              </motion.div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-3 mt-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === current ? "bg-orange-500 w-5" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
      </section>
      {/* 🚀 CTA */}
      <section className="relative py-28 lg:py-36 bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-400 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left: Text & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 drop-shadow-md">
              Ready to <span className="text-white/90">Launch Your</span> <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                Loyalty Program?
              </span>
            </h2>

            <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-xl mx-auto lg:mx-0">
              Join <span className="font-semibold text-white">1,000+ businesses</span> already rewarding
              their customers with <span className="font-semibold text-white">Loyalty CardX</span>.
            </p>

            <Link href="/signup">
              <span className="inline-block bg-white text-orange-600 font-extrabold text-lg md:text-xl px-12 py-5 rounded-full hover:bg-orange-50 hover:scale-105 transition-transform duration-300 shadow-lg animate-float">
                Start Trial
              </span>
            </Link>
          </motion.div>

          {/* Right: Visual / Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <Image
              src="https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=900&q=80"
              alt="Rewards Dashboard"
              width={480}
              height={320}
              className="w-[300px] md:w-[400px] lg:w-[480px] rounded-3xl shadow-2xl border border-white/30 hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>
      {/* 🧡 Footer */}
      <Footer />
    </>
  );
}
