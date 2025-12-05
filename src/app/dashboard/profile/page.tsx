'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Building2, Link as LinkIcon } from 'lucide-react';
import TierBadge, { TierName } from "@/components/ui/tierBadge";
import Image from 'next/image';
import BrandingManager from '@/components/dashboard/profile/BrandingManager';
import { useGetBusinessProfile, useUpdateBusinessProfile } from '@/services/business/hook';
import { useGetMySubscription } from '@/services/tiers/hook';
import { BusinessProfile, UpdateBusinessProfileDto } from '@/services/business/types';
import { toast } from 'sonner';

export default function BusinessProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<BusinessProfile> & {
    businessName?: string;
    categoryName?: string;
    whatsapp?: string;
    instagram?: string;
  }>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile } = useGetBusinessProfile();
  const { data: subscription, isLoading: isLoadingSubscription, isError: isErrorSubscription } = useGetMySubscription();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateBusinessProfile();


  useEffect(() => {
    if (profile) {
      const instagram = profile.socialMedia?.find(s => s.name.toLowerCase() === 'instagram')?.link || '';
      const whatsapp = profile.socialMedia?.find(s => s.name.toLowerCase() === 'whatsapp')?.link || '';

      setForm({
        ...profile,
        businessName: profile.name,
        categoryName: profile.category?.name || 'N/A',
        instagram,
        whatsapp,
      });
    }
  }, [profile]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'logoUrl') {
        setLogoFile(file);
      } else {
        setBannerFile(file);
      }

      // Create local preview
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, [field]: previewUrl }));
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      const paramsToSign = {
        timestamp: Math.round((new Date).getTime() / 1000),
      };

      const signatureResponse = await fetch('/api/sign-cloudinary-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign }),
      });
      const { signature } = await signatureResponse.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('timestamp', paramsToSign.timestamp.toString());
      formData.append('signature', signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Cloudinary upload failed.');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsUploading(true);

    try {
      let finalLogoUrl = form.logoUrl;
      let finalBannerUrl = form.bannerUrl;

      // Upload images if new files were selected
      if (logoFile) {
        finalLogoUrl = await uploadImageToCloudinary(logoFile);
      }
      if (bannerFile) {
        finalBannerUrl = await uploadImageToCloudinary(bannerFile);
      }

      const payload: UpdateBusinessProfileDto = {};

      if (form.businessName !== profile.name) payload.name = form.businessName;
      if (form.email !== profile.email) payload.email = form.email;
      if (form.phone !== profile.phone) payload.phone = form.phone;
      if (form.address !== profile.address) payload.address = form.address;
      if (form.description !== profile.description) payload.description = form.description;
      if (form.website !== profile.website) payload.website = form.website;

      // Use the potentially new URLs (or existing ones if not changed)
      // Only include if they differ from original profile to avoid unnecessary updates
      // BUT if we just uploaded a new file, we must send it even if the URL string *was* updated locally (which shouldn't happen with objectURLs, but good to be safe)
      if (logoFile || form.logoUrl !== profile.logoUrl) payload.logoUrl = finalLogoUrl;
      if (bannerFile || form.bannerUrl !== profile.bannerUrl) payload.bannerUrl = finalBannerUrl;

      const originalInstagram = profile.socialMedia?.find(s => s.name.toLowerCase() === 'instagram')?.link || '';
      const originalWhatsapp = profile.socialMedia?.find(s => s.name.toLowerCase() === 'whatsapp')?.link || '';
      const hasSocialChanged = form.instagram !== originalInstagram || form.whatsapp !== originalWhatsapp;

      if (hasSocialChanged) {
        const socialMedia = [];
        if (form.whatsapp) socialMedia.push({ name: 'whatsapp', link: form.whatsapp });
        if (form.instagram) socialMedia.push({ name: 'instagram', link: form.instagram });
        payload.socialMedia = socialMedia;
      }

      if (Object.keys(payload).length > 0) {
        updateProfile(payload, {
          onSuccess: () => {
            setEditing(false);
            setLogoFile(null);
            setBannerFile(null);
            toast.success("Profile updated successfully");
          },
          onError: (error: any) => {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Failed to update profile');
          },
        });
      } else {
        setEditing(false);
      }
    } catch (error) {
      console.error('Error during save:', error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProfile || isLoadingSubscription) {
    return <div>Loading...</div>;
  }

  if (isErrorProfile || isErrorSubscription) {
    return <div>Error loading profile data.</div>;
  }

  const tierName = subscription?.tier?.name as TierName | undefined;
  const plan = subscription?.tier?.name.toLowerCase() || 'starter';

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm  mt-8 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6 mb-8">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <Image
              src={form.logoUrl || 'https://via.placeholder.com/96'}
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
            <p className="text-gray-500">{form.categoryName}</p>
            <div className="mt-2">
              <TierBadge tier={tierName} />
            </div>
          </div>
        </div>

        {/* Edit / Save Button */}
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={isUpdating || isUploading}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold transition ${
            editing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          } disabled:opacity-50`}
        >
          {isUploading ? 'Uploading...' : isUpdating ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {/* Banner Image */}
      <div className="mb-8 relative h-48 w-full rounded-lg overflow-hidden shadow-md">
        <Image
          src={form.bannerUrl || 'https://via.placeholder.com/800x200'}
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
            value={form.businessName || ''}
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
            name="categoryName"
            value={form.categoryName || ''}
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
            value={form.email || ''}
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
            value={form.phone || ''}
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
            value={form.address || ''}
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
            value={form.description || ''}
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
            value={form.website || ''}
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
            value={form.whatsapp || ''}
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
            value={form.instagram || ''}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Branding Pack Uploader - Conditionally rendered */}
      {(plan === 'co-branded' || plan === 'white-label') && <BrandingManager />}

      {/* Bottom Info */}
      <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
        <p>Account Type: <span className="text-orange-500 font-medium">{subscription?.tier?.name || 'N/A'}</span></p>
      </div>
    </div>
  );
}
