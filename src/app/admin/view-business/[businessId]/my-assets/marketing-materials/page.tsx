'use client';

import React from 'react';
import { Download, Sparkles, Palette, UploadCloud, FileText, ImageIcon, Clapperboard, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation'; // Import useParams
import { useGetMarketingMaterials } from '@/services/marketing-materials/hook'; // Import the new hook


const getIconForFormat = (format: string) => {
    switch (format) {
        case 'PDF': return FileText;
        case 'PNG': return ImageIcon;
        case 'JPG': return Clapperboard;
        case 'HTML': return Mail;
        default: return FileText;
    }
};

export default function MarketingMaterialsPage() {
    const params = useParams();
    const businessId = params.businessId as string;

    const { data: marketingMaterialsResponse, isLoading, isError } = useGetMarketingMaterials({ businessId });
    const downloadCenterData = marketingMaterialsResponse?.downloadCenter || [];

    // All actions should be effectively disabled in impersonation view
    const isImpersonating = true; // Hardcode to true for this context, or derive from admin state

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isError || !marketingMaterialsResponse) {
        return <div className="text-center text-red-500 py-10">Error loading marketing materials data.</div>;
    }

    return (
        <div className="space-y-8">
            {/* Download Center */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Download Center</h2>
                <p className="text-gray-600 mb-6">Access pre-designed promotional materials to help you spread the word.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {downloadCenterData.map((asset) => {
                        const Icon = getIconForFormat(asset.format);
                        return (
                            <div key={asset.id} className="bg-white p-4 rounded-lg shadow group text-center hover:shadow-lg transition-shadow">
                                <div className="bg-gray-100 rounded-md flex items-center justify-center h-32 mb-4">
                                     <Icon className="h-12 w-12 text-gray-400" />
                                </div>
                                <h4 className="font-semibold text-gray-800">{asset.title}</h4>
                                <p className="text-sm text-gray-500 mb-4">{asset.type} &bull; {asset.format}</p>
                                <Button variant="outline" className="w-full" disabled={isImpersonating}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </div>
                        );
                    })}
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
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto" disabled={isImpersonating}>
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
                            <Button variant="outline" className="mt-4" disabled={isImpersonating}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Upload Logo
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">Branded Previews</h4>
                        <div className="grid grid-cols-2 gap-4">
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
