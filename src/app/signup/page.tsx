"use client";
import React, { useState } from 'react';
import { useBusinessSignUp } from '@/services/business/hook';
import { CreateBusinessDto } from '@/services/business/types';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const [formData, setFormData] = useState<CreateBusinessDto>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    sectorId: '',
  });
  const router = useRouter();

  const { mutate, isPending } = useBusinessSignUp({
    onSuccess: () => {
      router.push('/signin');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        {/* Left side */}
        <div className="flex flex-col justify-center p-8 md:p-14">
          <span className="mb-3 text-4xl font-bold">Welcome!</span>
          <span className="font-light text-gray-400 mb-8">
            Please enter your details to create an account
          </span>
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              <span className="mb-2 text-md">Name</span>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="py-4">
              <span className="mb-2 text-md">Email</span>
              <input
                type="email"
                name="email"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="py-4">
              <span className="mb-2 text-md">Password</span>
              <input
                type="password"
                name="password"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="py-4">
              <span className="mb-2 text-md">Phone</span>
              <input
                type="text"
                name="phone"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="py-4">
              <span className="mb-2 text-md">Address</span>
              <input
                type="text"
                name="address"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="py-4">
              <span className="mb-2 text-md">Sector ID</span>
              <input
                type="text"
                name="sectorId"
                className="w-full p-2 border border-ray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                value={formData.sectorId}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-600 text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300"
            >
              {isPending ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          <div className="text-center text-gray-400">
            Already have an account?
            <a href="/signin" className="font-bold text-black"> Sign in</a>
          </div>
        </div>
        {/* Right side */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="img"
            className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
