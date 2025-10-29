"use client";
import React, { useState } from 'react';
import { useBusinessSignIn } from '@/services/business/hook';
import { BusinessLoginDto } from '@/services/business/types';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<BusinessLoginDto>({
    email: '',
    password: '',
  });

  const { mutate, isPending } = useBusinessSignIn();

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
        <div className="flex flex-col justify-center p-8 md:p-14 w-full max-w-lg">
          <span className="mb-3 text-4xl font-bold">Welcome Back!</span>
          <span className="font-light text-gray-400 mb-8">
            Please enter your details to sign in
          </span>
          <form onSubmit={handleSubmit}>
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between w-full py-4">
              <div className="mr-24">
                <input type="checkbox" name="ch" id="ch" className="mr-2" />
                <span className="text-md">Remember for 30 days</span>
              </div>
              <span className="font-bold text-md">Forgot password</span>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-600 text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="text-center text-gray-400">
            Don&apos;t have an account?
            <a href="/signup" className="font-bold text-black"> Sign up for free</a>
          </div>
        </div>
        {/* Right side */}
        <div className="relative">
          <Image
            src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="img"
            className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
            width={400}
            height={600}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
