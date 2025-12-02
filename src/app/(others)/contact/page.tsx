// pages/contact.js
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Loyalty CardX for support, partnership, or press inquiries.",
};

export default function Contact() {
  return (
    <>

      <main className="min-h-screen bg-white text-gray-800 flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white py-24 text-center overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
              Lets Connect ✉️
            </h1>
            <p className="text-lg text-orange-50 max-w-2xl mx-auto">
              Whether you&apos;re a business looking to partner, a customer needing help, or just curious — we&apos;d love to hear from you.
            </p>
          </div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 px-6">
            {/* Left: Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold text-orange-500 mb-6">
                Send us a message
              </h2>
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Your full name"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="How can we help you?"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </div>

            {/* Right: Info Cards */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <Mail className="text-orange-500" size={26} />
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:support@mcomrewards.com" className="text-orange-500 hover:underline">
                      support@mcomrewards.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <Phone className="text-orange-500" size={26} />
                <div>
                  <h3 className="font-semibold text-gray-800">Phone</h3>
                  <p className="text-gray-600">
                    <a href="tel:+1234567890" className="text-orange-500 hover:underline">
                      +1 (234) 567-890
                    </a>
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <MapPin className="text-orange-500" size={26} />
                <div>
                  <h3 className="font-semibold text-gray-800">Address</h3>
                  <p className="text-gray-600">123 Loyalty Street, Accra, Ghana</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map / CTA Section */}
        <section className="relative bg-gray-100 py-16 text-center">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">
            Find Us on the Map
          </h2>
          <p className="text-gray-600 mb-8">
            Visit our office or connect with us online for personalized assistance.
          </p>
          <iframe
            title="Loyalty CardX Location"
            className="w-full max-w-4xl mx-auto h-72 rounded-xl shadow-lg border border-gray-200"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.845509518093!2d-0.1969!3d5.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzYnMTMuMyJOIDDCsDExJzUyLjkiVw!5e0!3m2!1sen!2sgh!4v1615391992345!5m2!1sen!2sgh"
            loading="lazy"
          ></iframe>
        </section>

        {/* Floating Chat Button */}
        <a
          href="#"
          className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition"
        >
          <MessageCircle size={24} />
        </a>

      </main>
    </>
  );
}
