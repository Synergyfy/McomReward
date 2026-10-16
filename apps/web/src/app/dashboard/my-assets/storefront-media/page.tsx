'use client';

import React from 'react';
import { PlusCircle, UploadCloud, Eye, Clock, Zap, FileVideo, ImageIcon, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetStorefrontMedia } from '@/services/storefront-media/hook';

export default function StorefrontMediaPage() {
    const { data, isLoading, isError } = useGetStorefrontMedia();
    const video = data?.storefrontVideo;
    const gallery = data?.gallery ?? [];

    if (isLoading) {
        return <p className="p-4 text-sm text-gray-500">Loading storefront media…</p>;
    }
    if (isError || !data || !video) {
        return <p className="p-4 text-sm text-red-600">Could not load storefront media. Please try again.</p>;
    }

    return (
        <div className="space-y-8">
            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Upload Storefront Video</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-sm text-gray-600">Drag & drop your video here, or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">MP4 up to 100MB</p>
                        <Button className="mt-4">
                            <PlusCircle className="mr-2 h-4 w-4" /> Upload Video
                        </Button>
                    </div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-orange-800">Script Helper</h3>
                    <ul className="space-y-2 text-sm text-orange-700 list-disc list-inside">
                        <li>Introduce yourself and your business.</li>
                        <li>Showcase your most popular products or services.</li>
                        <li>Give a quick tour of your shop.</li>
                        <li>Announce a special offer for viewers.</li>
                    </ul>
                </div>
            </div>

            {/* Media Gallery & Analytics */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Media Gallery & Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Video Player and Analytics */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <video controls poster={video.thumbnail} className="w-full h-full object-cover">
                                <source src={video.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center border-t pt-4">
                            <div className="flex flex-col items-center">
                                <Eye className="h-6 w-6 text-orange-500 mb-1" />
                                <p className="text-2xl font-bold">{video.analytics.views.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Views</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Clock className="h-6 w-6 text-orange-500 mb-1" />
                                <p className="text-2xl font-bold">{video.analytics.watchTime}</p>
                                <p className="text-sm text-gray-500">Avg. Watch Time</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <Zap className="h-6 w-6 text-orange-500 mb-1" />
                                <p className="text-2xl font-bold">{video.analytics.conversions}</p>
                                <p className="text-sm text-gray-500">Conversions</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Media Gallery */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700">Your Media</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {gallery.length === 0 ? (
                                <p className="text-sm text-gray-500">No media uploaded yet.</p>
                            ) : gallery.map((asset, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group shadow-md">
                                    <img src={asset.thumbnail} alt={asset.type} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {asset.type === 'video' && <FileVideo className="h-8 w-8 text-white" />}
                                        {asset.type === 'image' && <ImageIcon className="h-8 w-8 text-white" />}
                                        {asset.type === 'logo' && <Clapperboard className="h-8 w-8 text-white" />}
                                        <p className="font-semibold text-white capitalize mt-1 text-sm">{asset.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
