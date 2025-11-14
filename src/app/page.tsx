"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import Footer from "@/components/Footer";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = [
    { name: "Toby’s Café", quote: "Repeat customers up 40% in 3 months — the QR rewards just work!" },
    { name: "Sunny Bakery", quote: "Simple setup, customers love scanning to earn points!" },
    { name: "City Bookstore", quote: "Our referral network grew like crazy with the affiliate system." },
  ];

  return (
    <>
        <Head>
        <title>Loyalty CardX – Reward Local Customers</title>
      </Head>

      {/* 🌟 Sticky Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <Link href="/">
            <span className={`text-2xl font-bold text-orange-500 ${scrolled ? "" : "text-white"}`}>
              Mcom Reward
            </span>
          </Link>
          <div className="hidden md:flex gap-8 text-white font-medium">
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/campaigns">Campaigns</Link>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/signin">
              <span className={`px-5 py-2 border border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition ${scrolled ? "" : "bg-white"}`}>
                Login
              </span>
            </Link>
            <Link href="/onboarding/choose-role">
              <span className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
                Get Started
              </span>
            </Link>
          </div>
          <button className="md:hidden text-orange-500" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t shadow-md px-6 py-4 flex flex-col gap-3 text-gray-700">
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/campaigns">Campaigns</Link>
            <div className="border-t my-3"></div>
            <Link href="/business/signup">
              <span className="text-orange-500 font-semibold">Get Started</span>
            </Link>
          </div>
        )}
      </nav>

      {/* 🟠 Hero */}
      <section className="relative pt-40 pb-32 text-center text-white bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 overflow-hidden lg:pt-48 lg:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h1 className="text-6xl font-extrabold leading-tight mb-6">
            Reward Loyalty. <br /> Grow Effortlessly.
          </h1>
          <p className="text-lg text-white/90 mb-10">
            Run QR-based reward programs, track performance, and delight customers — all in minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/business/signup">
              <span className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition">
                Get Started Free
              </span>
            </Link>
            <Link href="/features">
              <span className="border border-white text-white px-8 py-3 rounded-full hover:bg-white/10 transition">
                Learn More
              </span>
            </Link>
          </div>
        </motion.div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-white skew-y-[-4deg] origin-bottom"></div>
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
          <div className="relative w-[320px] h-[640px] lg:w-[360px] lg:h-[720px] rounded-[3rem] border-[14px] border-gray-900 overflow-hidden shadow-2xl bg-black">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 w-32 h-8 rounded-b-2xl z-20"></div>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source
                src="https://cdn.coverr.co/videos/coverr-girl-paying-with-a-smartphone-5152/1080p.mp4"
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none"></div>
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
            Loyalty CardX helps your business grow repeat customers effortlessly — from setup to reward in minutes.
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
                  <img
                    src={item.image}
                    alt={item.title}
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



   
      {/* 💬 Testimonials Continuous Carousel */}
      <section
        id="testimonials"
        className="py-28 bg-white text-center px-6 lg:px-10 overflow-hidden lg:min-h-[80vh]"
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-orange-500 mb-16">
          What Businesses Say
        </h2>

        <div className="relative  max-w-6xl mx-auto overflow-hidden  lg:min-h-[30vh] ">
          <motion.div
            className="flex gap-8 lg:min-h-[20vh]"
            animate={{ x: ["0%", "80%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30, // speed of movement
                ease: "linear",
              },
            }}
            onHoverStart={(e) => e.stopPropagation()}
          >
            {/* Duplicate testimonials array for seamless looping */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <motion.blockquote
                key={i}
                className="min-w-[300px] md:min-w-[400px] lg:min-w-[500px] lg:min-h-[20vh] bg-orange-50 border border-orange-100 rounded-3xl p-8 lg:p-12 text-lg lg:text-2xl italic text-gray-700 shadow-sm flex-shrink-0"
              >
                “{t.quote}”
                <footer className="mt-4 font-semibold text-orange-500 text-base lg:text-lg">
                  — {t.name}
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
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

            <Link href="/business/signup">
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
            <img
              src="https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=900&q=80"
              alt="Rewards Dashboard"
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
