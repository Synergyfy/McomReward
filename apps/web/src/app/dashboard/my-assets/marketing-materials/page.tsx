'use client';

import React from 'react';
import { Download, Sparkles, Palette, UploadCloud, FileText, ImageIcon, Clapperboard, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const marketingMaterialsData = {
    downloadCenter: [
        { id: 'flyer-01', type: 'Flyer', title: 'Grand Opening Flyer', format: 'PDF', icon: FileText },
        { id: 'poster-01', type: 'Poster', title: 'Summer Sale Poster', format: 'PNG', icon: ImageIcon },
        { id: 'banner-01', type: 'Digital Banner', title: 'Website Header Banner', format: 'JPG', icon: Clapperboard },
        { id: 'email-01', type: 'Email Template', title: 'New Customer Welcome Email', format: 'HTML', icon: Mail },
    ],
};

export default function MarketingMaterialsPage() {
    return (
        <div className="space-y-8">
            {/* Download Center */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Download Center</h2>
                <p className="text-gray-600 mb-6">Access pre-designed promotional materials to help you spread the word.</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {marketingMaterialsData.downloadCenter.map((asset) => (
                        <div key={asset.id} className="bg-white p-4 rounded-lg shadow group text-center hover:shadow-lg transition-shadow">
                            <div className="bg-gray-100 rounded-md flex items-center justify-center h-32 mb-4">
                                 <asset.icon className="h-12 w-12 text-gray-400" />
                            </div>
                            <h4 className="font-semibold text-gray-800">{asset.title}</h4>
                            <p className="text-sm text-gray-500 mb-4">{asset.type} &bull; {asset.format}</p>
                            <Button variant="outline" className="w-full">
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Automated Content Pack */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Automated Content Pack</h2>
                <div className="bg-white p-6 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center"><Sparkles className="h-5 w-5 mr-2 text-orange-500" />AI-Generated Social Media Content</h3>
                        <p className="text-gray-600 mt-1">Get unique, ready-to-post content for your social media channels.</p>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">
                        <Sparkles className="mr-2 h-4 w-4" /> Generate Pack
                    </Button>
                </div>
            </div>

            {/* Custom Branding */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Custom Branding</h2>
                <div className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center"><Palette className="h-5 w-5 mr-2 text-orange-500" />Generate Branded Templates</h3>
                        <p className="text-gray-600 mb-4">Upload your logo to automatically create marketing materials with your branding.</p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-4 text-sm text-gray-600">Drag & drop your logo here</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG</p>
                            <Button variant="outline" className="mt-4">
                                <UploadCloud className="mr-2 h-4 w-4" /> Upload Logo
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">Branded Previews</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative aspect-video rounded-lg bg-gray-200 flex items-center justify-center border">
                                <p className="text-gray-500 text-sm">Flyer Preview</p>
                            </div>
                            <div className="relative aspect-video rounded-lg bg-gray-200 flex items-center justify-center border">
                                <p className="text-gray-500 text-sm">Poster Preview</p>
                            </div>
                            <div className="relative aspect-video rounded-lg bg-gray-200 flex items-center justify-center border">
                                <p className="text-gray-500 text-sm">Banner Preview</p>
                            </div>
                            <div className="relative aspect-video rounded-lg bg-gray-200 flex items-center justify-center border">
                                <p className="text-gray-500 text-sm">Email Preview</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
