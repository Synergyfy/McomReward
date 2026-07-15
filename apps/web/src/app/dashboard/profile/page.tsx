'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Camera, Mail, Phone, MapPin, Building2, Link as LinkIcon } from 'lucide-react';
import TierBadge, { TierName } from "@/components/ui/tierBadge";
import Image from 'next/image';
import BrandingManager from '@/components/dashboard/profile/BrandingManager';
import { useGetBusinessProfile, useUpdateBusinessProfile, useGetSectors, useGetCategories, useGetSubcategories } from '@/services/business/hook';
import { useGetMySubscription } from '@/services/tiers/hook';
import { BusinessProfile, UpdateBusinessProfileDto } from '@/services/business/types';
import { useUploadToCloudinary } from '@/services/upload/hook';
import { toast } from 'sonner';
import { ImageCropper } from '@/components/ui/image-cropper';

export default function BusinessProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<BusinessProfile> & {
    businessName?: string;
    categoryName?: string;
    whatsapp?: string;
    instagram?: string;
    sectorId?: string;
    categoryId?: string;
    subCategoryId?: string;
  }>({});

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [activeCropField, setActiveCropField] = useState<'profileImage' | 'banner' | null>(null);

  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile } = useGetBusinessProfile();
  const { data: subscription, isLoading: isLoadingSubscription, isError: isErrorSubscription } = useGetMySubscription();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateBusinessProfile();
  const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();

  const { data: sectors } = useGetSectors();
  const { data: categories } = useGetCategories(form.sectorId || "");
  const { data: subcategories } = useGetSubcategories(form.categoryId || "");

  // Initialize form once
  useEffect(() => {
    if (profile && Object.keys(form).length === 0) {
      const instagram = profile.socialMedia?.find(s => s.name.toLowerCase() === 'instagram')?.link || '';
      const whatsapp = profile.socialMedia?.find(s => s.name.toLowerCase() === 'whatsapp')?.link || '';

      setForm({
        ...profile,
        businessName: profile.name,
        categoryName: profile.category?.name || 'N/A',
        instagram,
        whatsapp,
        sectorId: profile.sector?.id,
        categoryId: profile.category?.id,
        subCategoryId: profile.subCategory?.id,
      });
    }
  }, [profile]);

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSectorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      sectorId: value,
      categoryId: "",
      subCategoryId: ""
    }));
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      categoryId: value,
      subCategoryId: ""
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result as string);
      setActiveCropField(field);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!activeCropField) return;

    const fileName = activeCropField === 'profileImage' ? 'profile.jpg' : 'banner.jpg';
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
    const url = URL.createObjectURL(croppedBlob);

    if (activeCropField === 'profileImage') {
      setProfileImageFile(croppedFile);
      setForm(prev => ({ ...prev, profileImage: url }));
    } else {
      setBannerFile(croppedFile);
      setForm(prev => ({ ...prev, banner: url }));
    }

    setIsCropping(false);
    setCropImage(null);
    setActiveCropField(null);
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsUploading(true);
    try {
      const payload: UpdateBusinessProfileDto = {};

      if (form.businessName !== profile.name) payload.name = form.businessName;
      if (form.email !== profile.email) payload.email = form.email;
      if (form.phone !== profile.phone) payload.phone = form.phone;
      if (form.address !== profile.address) payload.address = form.address;
      if (form.description !== profile.description) payload.description = form.description;
      if (form.website !== profile.website) payload.website = form.website;

      if (profileImageFile) {
        const { secure_url } = await uploadToCloudinary({ file: profileImageFile, folder: 'business' });
        payload.profile_image = secure_url;
      }

      if (bannerFile) {
        const { secure_url } = await uploadToCloudinary({ file: bannerFile, folder: 'business' });
        payload.banner = secure_url;
      }

      // Fix: Only send UUID strings if they exist. Do not send objects or empty strings.
      if (form.sectorId !== profile.sector?.id && form.sectorId) {
        payload.sector = form.sectorId;
      }

      if (form.categoryId !== profile.category?.id && form.categoryId) {
        payload.category = form.categoryId;
      }

      if (form.subCategoryId !== profile.subCategory?.id && form.subCategoryId) {
        payload.subCategory = form.subCategoryId;
      }

      const originalInstagram = profile.socialMedia?.find(s => s.name.toLowerCase() === 'instagram')?.link || '';
      const originalWhatsapp = profile.socialMedia?.find(s => s.name.toLowerCase() === 'whatsapp')?.link || '';
      if (form.instagram !== originalInstagram || form.whatsapp !== originalWhatsapp) {
        const socialMedia = [];
        if (form.whatsapp) socialMedia.push({ name: 'whatsapp', link: form.whatsapp });
        if (form.instagram) socialMedia.push({ name: 'instagram', link: form.instagram });
        payload.socialMedia = socialMedia;
      }

      if (Object.keys(payload).length > 0) {
        updateProfile(payload, {
          onSuccess: () => {
            setEditing(false);
            setProfileImageFile(null);
            setBannerFile(null);
            toast.success('Profile updated successfully');
          },
          onError: (error: any) => {
            console.error('Failed to update profile:', error);
            // Enhanced error message handling for better debugging
            const errorMessage = error.response?.data?.message
              ? (Array.isArray(error.response.data.message)
                ? error.response.data.message.join(', ')
                : error.response.data.message)
              : 'Failed to update profile';
            toast.error(errorMessage);
          },
        });
      } else {
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProfile || isLoadingSubscription) return <div>Loading...</div>;
  if (isErrorProfile || isErrorSubscription) return <div>Error loading profile data.</div>;

  const plan = subscription?.tier?.name.toLowerCase() || 'starter';
  const tierName = subscription?.tier?.name as TierName | undefined;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm mt-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src={form.profileImage || 'https://via.placeholder.com/96'}
              alt="Business Logo"
              className="w-24 h-24 rounded-full object-cover border-4 border-orange-500 shadow-md"
              width={96}
              height={96}
            />
            {editing && (
              <>
                <input
                  type="file"
                  ref={profileImageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profileImage')}
                />
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-orange-500 text-white p-1.5 rounded-full hover:bg-orange-600 transition"
                  title="Change logo"
                >
                  <Camera size={16} />
                </button>
              </>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{form.businessName}</h1>
            <p className="text-gray-500">{form.categoryName}</p>
            <div className="mt-2">
              {tierName ? <TierBadge tier={tierName} /> :
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">N/A</span>}
            </div>
          </div>
        </div>
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={isUpdating || isUploading}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold transition ${editing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'} disabled:opacity-50`}
        >
          {isUploading ? 'Uploading...' : isUpdating ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {/* Banner */}
      <div className="mb-8 relative h-48 w-full rounded-lg overflow-hidden shadow-md">
        <Image
          src={form.banner || 'https://via.placeholder.com/800x200'}
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
              onChange={(e) => handleFileChange(e, 'banner')}
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

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
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

        {/* Sector */}
        {editing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Building2 size={14} className="inline mr-1 text-orange-500" />
                Sector
              </label>
              <select
                name="sectorId"
                value={form.sectorId || ''}
                onChange={handleSectorChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select a sector</option>
                {sectors?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Building2 size={14} className="inline mr-1 text-orange-500" />
                Category
              </label>
              <select
                name="categoryId"
                value={form.categoryId || ''}
                onChange={handleCategoryChange}
                disabled={!form.sectorId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
              >
                <option value="">Select a category</option>
                {categories?.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Building2 size={14} className="inline mr-1 text-orange-500" />
                Subcategory
              </label>
              <select
                name="subCategoryId"
                value={form.subCategoryId || ''}
                onChange={handleChange}
                disabled={!form.categoryId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
              >
                <option value="">Select a subcategory</option>
                {subcategories?.data?.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
          </>
        )}
        {!editing && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <Building2 size={14} className="inline mr-1 text-orange-500" />
              Category
            </label>
            <input type="text" name="categoryName" value={form.categoryName || ''} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50" />
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Mail size={14} className="inline mr-1 text-orange-500" />
            Email
          </label>
          <input type="email" name="email" value={form.email || ''} onChange={handleChange} disabled={!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50" />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Phone size={14} className="inline mr-1 text-orange-500" />
            Phone
          </label>
          <input type="text" name="phone" value={form.phone || ''} onChange={handleChange} disabled={!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50" />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <MapPin size={14} className="inline mr-1 text-orange-500" />
            Business Address
          </label>
          <input type="text" name="address" value={form.address || ''} onChange={handleChange} disabled={!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50" />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Building2 size={14} className="inline mr-1 text-orange-500" />
            About Your Business
          </label>
          <textarea name="description" value={form.description || ''} onChange={handleChange} disabled={!editing} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50 resize-none" />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <LinkIcon size={14} className="inline mr-1 text-orange-500" />
            Website
          </label>
          <input type="text" name="website" value={form.website || ''} onChange={handleChange} disabled={!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50" />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <Phone size={14} className="inline mr-1 text-orange-500" />
            WhatsApp
          </label>
          <input type="text" name="whatsapp" value={form.whatsapp || ''} onChange={handleChange} disabled={!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50" />
        </div>

        {/* Instagram */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            <LinkIcon size={14} className="inline mr-1 text-orange-500" />
            Instagram
          </label>
          <input type="text" name="instagram" value={form.instagram || ''} onChange={handleChange} disabled={!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50" />
        </div>
      </div>

      {/* Branding */}
      {(plan === 'co-branded' || plan === 'white-label') && <BrandingManager />}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
        <p>Account Type: <span className="text-orange-500 font-medium">{subscription?.tier?.name || 'N/A'}</span></p>
      </div>

      {isCropping && cropImage && (
        <ImageCropper
          image={cropImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropping(false);
            setCropImage(null);
            setActiveCropField(null);
          }}
          aspect={activeCropField === 'profileImage' ? 1 : 3}
          circularCrop={activeCropField === 'profileImage'}
        />
      )}
    </div>
  );
}
