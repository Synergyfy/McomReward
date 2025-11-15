// pages/about.js
import React from "react";
import { Rocket, Heart, Globe2 } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Discover the story behind Loyalty CardX — empowering local businesses with smart, simple loyalty programs.",
};

export default function About() {
  return (
    <>

      <main className="">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white py-24 text-center overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
              Empowering Local Loyalty 💎
            </h1>
            <p className="text-lg text-orange-50 max-w-2xl mx-auto">
              Mcom Reward helps businesses create rewarding customer
              experiences through easy-to-use campaigns, QR codes, and digital
              loyalty systems.
            </p>
          </div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">
          <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <Rocket className="text-orange-500 mx-auto mb-4" size={36} />
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Our Mission
            </h2>
            <p className="text-gray-700">
              To make customer retention simple, measurable, and fun for every
              business — no matter the size.
            </p>
          </div>

          <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <Globe2 className="text-orange-500 mx-auto mb-4" size={36} />
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Our Vision
            </h2>
            <p className="text-gray-700">
              Building a connected global network of local businesses rewarding
              loyal customers digitally.
            </p>
          </div>

          <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <Heart className="text-orange-500 mx-auto mb-4" size={36} />
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Our Values
            </h2>
            <p className="text-gray-700">
              Innovation, trust, and community. We grow by helping others grow.
            </p>
          </div>
        </section>

        {/* Our Journey Timeline */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-orange-500 mb-12">
              Our Journey
            </h2>

            <div className="relative border-l-4 border-orange-400 ml-4 space-y-10">
              {[
                {
                  year: "2023",
                  title: "Idea Sparked",
                  desc: "Mcom Reward began as a passion project to help small cafes in Accra retain their regular customers with QR-based points.",
                },
                {
                  year: "2024",
                  title: "Platform Launched",
                  desc: "We launched our first beta with 50 local businesses — adding templates, dashboards, and QR campaign tools.",
                },
                {
                  year: "2025",
                  title: "Growing Community",
                  desc: "Now serving 500+ businesses and over 50,000 customers, Mcom Reward continues to help communities thrive through digital loyalty.",
                },
              ].map((item, idx) => (
                <div key={idx} className="ml-6 relative">
                  <div className="absolute -left-4 top-2 w-6 h-6 bg-orange-500 rounded-full border-4 border-white"></div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                    <h3 className="font-semibold text-orange-500 text-lg">
                      {item.year} — {item.title}
                    </h3>
                    <p className="text-gray-700 mt-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-20 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-orange-500 mb-12">
            Meet the Team
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                name: "Ama Boateng",
                role: "Founder & CEO",
                image:
                  "https://randomuser.me/api/portraits/women/68.jpg",
              },
              {
                name: "Michael Tetteh",
                role: "CTO",
                image:
                  "https://randomuser.me/api/portraits/men/76.jpg",
              },
              {
                name: "Linda Ofori",
                role: "Head of Partnerships",
                image:
                  "https://randomuser.me/api/portraits/women/45.jpg",
              },
            ].map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  width={96}
                  height={96}
                />
                <h3 className="text-xl font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-orange-500 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-orange-50 to-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-orange-500 mb-4">
              Ready to Build Loyalty That Lasts?
            </h2>
            <p className="text-gray-700 mb-8">
              Join hundreds of growing businesses already rewarding their loyal
              customers with Loyalty CardX.
            </p>
            <a
              href="/signup"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Get Started
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
