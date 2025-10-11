"use client";
import React, { useState } from 'react';
import { useBusinessSignUp } from '@/services/business/hook';
import { CreateBusinessDto } from '@/services/business/types';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
  const [step, setStep] = useState(1);
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const progress = (step / 2) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative flex flex-col w-full max-w-4xl m-6 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        {/* Left side */}
        <div className="flex flex-col justify-center w-full p-8 md:p-14">
          <div className="mb-8">
            <span className="mb-3 text-4xl font-bold">Create Your Account</span>
            <p className="font-light text-gray-500 mt-2">
              Let's get you started.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
            <div
              className="bg-orange-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div>
                <h3 className="mb-4 text-xl font-semibold">Account Details</h3>
                <div className="py-3">
                  <span className="mb-2 text-md">Business Name</span>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="py-3">
                  <span className="mb-2 text-md">Email Address</span>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="py-3">
                  <span className="mb-2 text-md">Password</span>
                  <input
                    type="password"
                    name="password"
                    className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-orange-600 text-white p-2 mt-4 rounded-lg hover:bg-orange-700"
                >
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="mb-4 text-xl font-semibold">Business Details</h3>
                <div className="py-3">
                  <span className="mb-2 text-md">Phone Number</span>
                  <input
                    type="text"
                    name="phone"
                    className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="py-3">
                  <span className="mb-2 text-md">Address</span>
                  <input
                    type="text"
                    name="address"
                    className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="py-3">
                  <span className="mb-2 text-md">Sector ID</span>
                  <input
                    type="text"
                    name="sectorId"
                    className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light"
                    value={formData.sectorId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-1/2 mr-2 bg-gray-300 text-black p-2 rounded-lg hover:bg-gray-400"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-1/2 ml-2 bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:bg-orange-300"
                  >
                    {isPending ? 'Signing Up...' : 'Sign Up'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center text-gray-400 mt-8">
            Already have an account?
            <a href="/signin" className="font-bold text-black ml-1"> Sign in</a>
          </div>
        </div>
        {/* Right side */}
        <div className="relative md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="img"
            className="w-full h-full hidden rounded-r-2xl md:block object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
