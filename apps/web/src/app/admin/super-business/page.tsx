'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Loader2,
    ShieldCheck,
    Mail,
    Lock,
    User,
    Ticket,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateSuperBusiness } from '@/services/admin/hook';
import { toast } from 'react-hot-toast';

const superBusinessSchema = z.object({
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
    referralCode: z.string().min(1, 'Referral code is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SuperBusinessFormValues = z.infer<typeof superBusinessSchema>;

export default function CreateSuperBusinessPage() {
    const router = useRouter();
    const { mutate: createSuperBusiness, isPending } = useCreateSuperBusiness();
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<SuperBusinessFormValues>({
        resolver: zodResolver(superBusinessSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            referralCode: '',
        }
    });

    const onSubmit = (data: SuperBusinessFormValues) => {
        createSuperBusiness(data, {
            onSuccess: () => {
                setIsSuccess(true);
                toast.success('Super Business account created successfully!');
                setTimeout(() => {
                    router.push('/admin/users/business');
                }, 3000);
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || 'Failed to create Super Business account');
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                    <CheckCircle2 className="h-24 w-24 text-blue-600 relative z-10" />
                </div>
                <h2 className="text-3xl font-bold mt-8 text-gray-900">Account Created!</h2>
                <p className="text-gray-600 mt-2 text-center max-w-md">
                    The Super Business account has been successfully established. Redirecting you to the business management page...
                </p>
                <Button
                    variant="outline"
                    className="mt-8"
                    onClick={() => router.push('/admin/users/business')}
                >
                    Go Now
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Gem className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Super Business</h1>
                            <p className="text-gray-500">Provision a high-tier enterprise account with exclusive privileges.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Helper Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 h-full">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            Account Benefits
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Unlimited campaign capacity",
                                "Priority placement in discovery",
                                "Advanced analytics dashboard",
                                "White-label loyalty branding",
                                "Dedicated account manager"
                            ].map((benefit, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Super Business accounts are manually verified. Ensure all contact details are accurate for enterprise communication.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Business Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        Business Name
                                    </label>
                                    <div className="relative group">
                                        <Input
                                            {...register('name')}
                                            placeholder="e.g. The Gourmet Kitchen"
                                            className={`pl-4 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500' : ''}`}
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-500" />
                                        Email Address
                                    </label>
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="contact@gourmetkitchen.com"
                                        className={`pl-4 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Referral Code */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Ticket className="h-4 w-4 text-blue-500" />
                                        Referral Code
                                    </label>
                                    <Input
                                        {...register('referralCode')}
                                        placeholder="a1b2c3d4e"
                                        className={`pl-4 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-blue-500 transition-all ${errors.referralCode ? 'border-red-500' : ''}`}
                                    />
                                    {errors.referralCode && (
                                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.referralCode.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-blue-500" />
                                            Password
                                        </label>
                                        <Input
                                            {...register('password')}
                                            type="password"
                                            placeholder="••••••••"
                                            className={`pl-4 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-blue-500 transition-all ${errors.password ? 'border-red-500' : ''}`}
                                        />
                                        {errors.password && (
                                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-blue-500" />
                                            Confirm Password
                                        </label>
                                        <Input
                                            {...register('confirmPassword')}
                                            type="password"
                                            placeholder="••••••••"
                                            className={`pl-4 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-blue-500 transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {isPending ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Gem className="mr-2 h-5 w-5" /> Create Super Business Account</>
                                    )}
                                </Button>
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    By creating this account, you confirm it meets the criteria for Super Business status.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
