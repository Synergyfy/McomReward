"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetStaffById, useUpdateStaff } from '@/services/staff/hook';
import { UpdateStaffDto } from '@/services/staff/types';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';

const EditStaffPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) || '';

  const { data: staff, isLoading, isError, error } = useGetStaffById(id);
  const { mutate: updateStaff, isPending } = useUpdateStaff();

  const [formData, setFormData] = useState<Omit<UpdateStaffDto, 'avatar'>>({
    name: '',
    email: '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Partial<UpdateStaffDto>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email,
        password: '', // Password is optional on update
      });
      setCurrentAvatar(staff.avatar);
    }
  }, [staff]);

  const validate = (): boolean => {
    const newErrors: Partial<UpdateStaffDto> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUploading(true);

    try {
      let avatarUrl: string | undefined = currentAvatar;
      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', avatarFile);

        const response = await axios.post(`/api/upload/staff-avatars`, uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUrl = response.data.secure_url;
      }

      const updateData: UpdateStaffDto = { ...formData, avatar: avatarUrl };
      if (!updateData.password) {
        delete updateData.password; // Don't send empty password
      }

      updateStaff({ id, ...updateData }, {
        onSuccess: () => {
          alert('Staff member updated successfully');
          router.push('/dashboard/staff/all');
        },
        onError: (error) => {
          alert(`Error updating staff: ${error.message}`);
        },
      });
    } catch (error) {
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Staff</h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                  )}
                </div>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Avatar</label>
              <div className="mt-1 flex items-center">
                {currentAvatar && !avatarFile && (
                  <Image
                    src={currentAvatar}
                    alt="Current Avatar"
                    width={60}
                    height={60}
                    className="rounded-full mr-4"
                  />
                )}
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400"
            >
              {isPending || isUploading ? 'Updating Staff...' : 'Update Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffPage;
