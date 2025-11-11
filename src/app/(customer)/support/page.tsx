"use client";

import { useState } from "react";
import { Send, Mail, MessageSquare, HelpCircle, CheckCircle2, Video } from "lucide-react";

export default function SupportPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to API or email service
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 md:pt-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Support & Help</h1>
      <p className="text-gray-600 mb-10">
        Need help? You can find answers to common questions below, or contact our support team.
      </p>

      {/* ✅ Contact Form */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-10 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Mail className="text-orange-500" /> Contact Support
        </h2>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="text-green-500 w-10 h-10 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Message Sent Successfully!</h3>
            <p className="text-gray-500 text-sm mt-1">
              Our support team will get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
                placeholder="Describe your issue or question"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              <Send size={18} /> Send Message
            </button>
          </form>
        )}
      </div>

      {/* 🧠 FAQ Section
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HelpCircle className="text-orange-500" /> Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <details className="group border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-800 cursor-pointer flex justify-between items-center">
              How can I redeem my rewards?
              <span className="text-orange-500 group-open:rotate-180 transition-transform">⌃</span>
            </summary>
            <p className="text-gray-600 mt-2">
              Go to the <strong>Reward Redemption</strong> section, choose a reward, and click
              <em> Redeem</em>. Points will be deducted automatically.
            </p>
          </details>

          <details className="group border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-800 cursor-pointer flex justify-between items-center">
              Where can I see my tier level?
              <span className="text-orange-500 group-open:rotate-180 transition-transform">⌃</span>
            </summary>
            <p className="text-gray-600 mt-2">
              You can view your tier and benefits in the <strong>Badge Level</strong> section of
              your dashboard.
            </p>
          </details>

          <details className="group border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-800 cursor-pointer flex justify-between items-center">
              How do I contact support directly?
              <span className="text-orange-500 group-open:rotate-180 transition-transform">⌃</span>
            </summary>
            <p className="text-gray-600 mt-2">
              Use the contact form above or email us at{" "}
              <a href="mailto:support@loyaltycardx.com" className="text-orange-600 font-medium">
                support@loyaltycardx.com
              </a>.
            </p>
          </details>
        </div>
      </div> */}

      {/* ⚡ Quick Links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/help-center"
          className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 hover:bg-orange-100 transition"
        >
          <MessageSquare className="text-orange-600" />
          <div>
            <h3 className="font-semibold text-gray-800">Help Center</h3>
            <p className="text-sm text-gray-500">Find guides and resources</p>
          </div>
        </a>

        <a
          href="/customer-faq"
          className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 hover:bg-orange-100 transition"
        >
          <HelpCircle className="text-orange-600" />
          <div>
            <h3 className="font-semibold text-gray-800">FAQ</h3>
            <p className="text-sm text-gray-500">Common questions & answers</p>
          </div>
        </a>

        <a
          href="/help-center/tutorials"
          className="flex items-center gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 hover:bg-orange-100 transition"
        >
          <Video className="text-orange-600" /> 
          <div>
            <h3 className="font-semibold text-gray-800">Video Tutorials</h3>
            <p className="text-sm text-gray-500">Watch quick tutorials to learn how to use Loyalty CardX effectively.</p>
          </div>
        </a>
      </div>
    </div>
  );
}
