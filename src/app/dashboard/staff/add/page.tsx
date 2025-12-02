"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateStaff } from '@/services/staff/hook';
import { CreateStaffDto } from '@/services/staff/types';
import { Eye, EyeOff, ArrowLeft, Upload, Loader2, User, Mail, Lock } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TierLimitModal from '@/components/dashboard/campaigns/TierLimitModal';

const AddStaffPage = () => {
  const router = useRouter();
  const { mutate: createStaff, isPending } = useCreateStaff();
  const [formData, setFormData] = useState<Omit<CreateStaffDto, 'avatar'>>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<CreateStaffDto>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTierLimitModalOpen, setIsTierLimitModalOpen] = useState(false);
  const [tierLimitMessage, setTierLimitMessage] = useState('');

  const validate = (): boolean => {
    const newErrors: Partial<CreateStaffDto> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof CreateStaffDto]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setIsUploading(true);

    try {
      let avatarUrl: string | undefined = undefined;
      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', avatarFile);

        const response = await axios.post(`/api/upload/staff-avatars`, uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUrl = response.data.secure_url;
      }

      const finalStaffData: CreateStaffDto = { ...formData, avatar: avatarUrl };

      createStaff(finalStaffData, {
        onSuccess: () => {
          toast.success('Staff member created successfully');
          router.push('/dashboard/staff');
        },
        onError: (error: Error | AxiosError<unknown>) => {
          // Check for the specific tier limit error message
          const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || (error as Error)?.message || 'Unknown error';
          if (errorMessage && errorMessage.includes('You have reached your limit of')) {
            setTierLimitMessage(errorMessage);
            setIsTierLimitModalOpen(true);
          } else {
            toast.error(`Error creating staff: ${errorMessage}`);
          }
        },
      });
    } catch (error) {
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <TierLimitModal
        isOpen={isTierLimitModalOpen}
        onClose={() => setIsTierLimitModalOpen(false)}
        message={tierLimitMessage}
      />
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 hover:bg-transparent hover:text-orange-600 p-0 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Staff List
      </Button>

      <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-900">Add New Staff Member</CardTitle>
          <CardDescription>
            Create a new account for your staff member. They will receive an email with their login details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-200 transition-colors">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-md ring-4 ring-white">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar Preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-orange-700 transition-all transform hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                <p className="text-xs text-gray-500">Click the upload icon to add a photo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isPending || isUploading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11 text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isPending || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading Avatar...' : 'Creating Staff Member...'}
                  </>
                ) : (
                  'Create Staff Member'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStaffPage;
