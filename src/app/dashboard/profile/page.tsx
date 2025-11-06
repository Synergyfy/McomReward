'use client';

import { useState, useRef } from 'react';
import { Camera, Mail, Phone, MapPin, Building2, Link as LinkIcon } from 'lucide-react';
import TierBadge from "@/components/ui/tierBadge";
import Image from 'next/image';
import BrandingManager from '@/components/dashboard/profile/BrandingManager';

// Mock user data for prototype
const mockUser = {
  plan: 'white-label', // 'starter', 'co-branded', 'white-label'
};

export default function BusinessProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: 'Bella’s Bakery',
    email: 'bella@bakery.com',
    phone: '+234 810 234 5678',
    address: '12 Marina Road, Lagos',
    category: 'Food & Drink',
    description: 'Delicious pastries and desserts made fresh daily!',
    logoUrl: 'https://images.unsplash.com/photo-1614289371518-722f2615943c?auto=format&fit=crop&w=200&q=80', // Placeholder logo
    bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // Placeholder banner
    website: '',
    whatsapp: '',
    instagram: '',
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setEditing(false);
    // TODO: Add save logic or API call
    console.log('Profile updated:', form);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm  mt-8 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6 mb-8">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <Image
              src={form.logoUrl}
              alt="Business Logo"
              className="w-24 h-24 rounded-full object-cover border-4 border-orange-500 shadow-md"
              width={96}
              height={96}
            />
            {editing && (
              <>
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logoUrl')}
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-orange-500 text-white p-1.5 rounded-full hover:bg-orange-600 transition"
                  title="Change logo"
                >
                  <Camera size={16} />
                </button>
              </>
            )}
          </div>

          {/* Business Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{form.businessName}</h1>
            <p className="text-gray-500">{form.category}</p>
            <div className="mt-2">
              <TierBadge tier="Gold" />
            </div>
          </div>
        </div>

        {/* Edit / Save Button */}
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold transition ${
            editing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {/* Banner Image */}
      <div className="mb-8 relative h-48 w-full rounded-lg overflow-hidden shadow-md">
        <Image
          src={form.bannerUrl}
          alt="Business Banner"
          layout="fill"
          objectFit="cover"
        />
        {editing && (
          <>
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'bannerUrl')}
            />
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-white text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition shadow-md flex items-center"
            >
              <Camera size={16} className="mr-2" />
              Change Banner
            </button>
          </>
        )}
      </div>

      {/* Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name (editable) */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Building2 size={14} className="inline mr-1 text-orange-500" />
            Business Name
          </label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>

        {/* Category (display only for now) */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Building2 size={14} className="inline mr-1 text-orange-500" />
            Category
          </label>
          <input
            type="text"
            name="category"
            value={form.category}
            disabled
            className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Mail size={14} className="inline mr-1 text-orange-500" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Phone size={14} className="inline mr-1 text-orange-500" />
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <MapPin size={14} className="inline mr-1 text-orange-500" />
            Business Address
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Building2 size={14} className="inline mr-1 text-orange-500" />
            About Your Business
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            disabled={!editing}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50 resize-none"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <LinkIcon size={14} className="inline mr-1 text-orange-500" />
            Website URL
          </label>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Phone size={14} className="inline mr-1 text-orange-500" />
            WhatsApp Link
          </label>
          <input
            type="text"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>

        {/* Instagram */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <LinkIcon size={14} className="inline mr-1 text-orange-500" />
            Instagram Profile URL
          </label>
          <input
            type="text"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Branding Pack Uploader - Conditionally rendered */}
      {(mockUser.plan === 'co-branded' || mockUser.plan === 'white-label') && <BrandingManager />}

      {/* Bottom Info */}
      <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>Joined: March 2024</p>
        <p>Account Type: <span className="text-orange-500 font-medium">Gold Partner</span></p>
      </div>
    </div>
  );
}
