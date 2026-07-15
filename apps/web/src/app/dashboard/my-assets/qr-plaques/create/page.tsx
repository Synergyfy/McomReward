'use client';

import React, { useState, useRef } from 'react';
import { useCreateQrPlaque } from '@/services/qr-plaques/hook';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaquePreview } from '@/components/plaque/PlaquePreview';
import { ArrowLeft, Save, Printer, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MediaLibrary from '@/components/dashboard/media-library/MediaLibrary';
import { LibraryAsset } from '@/services/media-library/types';
import { ImageCropper } from '@/components/ui/image-cropper';

// Create QR Plaque Page - Allows creating custom plaques with QR codes from library or device
export default function CreatePlaquePage() {
    const router = useRouter();
    const { mutate: createPlaque, isPending } = useCreateQrPlaque();

    const [name, setName] = useState('');
    const [actionText, setActionText] = useState('SCAN HERE');
    const [description, setDescription] = useState('FOR PAYMENT');
    const [footerText, setFooterText] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const contentUrl = qrCodeUrl; // URL for the QR code image
    const previewQrCodeUrl = qrCodeUrl || '/placeholder-qr-code.png';
    const handleSelectAsset = (asset: LibraryAsset) => {
        setQrCodeUrl(asset.url);
        setIsLibraryOpen(false);
        toast.success(`Selected QR Code: ${asset.title}`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropImage(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        const url = URL.createObjectURL(croppedBlob);
        setQrCodeUrl(url);
        setIsCropping(false);
        setCropImage(null);
        toast.success("Image uploaded and cropped");
    };

    const handleSave = () => {
        if (!name) {
            toast.error("Please provide a name for your plaque.");
            return;
        }

        createPlaque({
            name,
            actionText,
            description,
            footerText,
            contentUrl
        }, {
            onSuccess: () => {
                router.push('/dashboard/my-assets/qr-plaques');
            }
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #plaque-preview-container, #plaque-preview-container * {
                        visibility: visible;
                    }
                    #plaque-preview-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: white;
                    }
                }
            `}</style>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/my-assets/qr-plaques">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create QR Plaque</h1>
                    <p className="text-muted-foreground">Design your custom plaque template.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Enter the information to display on your plaque.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 1. Name */}
                        <div className="space-y-2">
                            <Label htmlFor="plaqueName">Name of the QR Plaque <span className="text-red-500">*</span></Label>
                            <Input
                                id="plaqueName"
                                placeholder="e.g. Front Desk Display"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* 2. Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="FOR PAYMENT"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* 3. Action Text */}
                        <div className="space-y-2">
                            <Label htmlFor="actionText">Action Text</Label>
                            <Input
                                id="actionText"
                                placeholder="Scan here or Scan now"
                                value={actionText}
                                onChange={(e) => setActionText(e.target.value)}
                            />
                        </div>

                        {/* 4. Content URL (Linked Offer) */}
                        <div className="space-y-2">
                            <Label>QR Code Image</Label>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsLibraryOpen(true)}
                                    >
                                        <ImageIcon className="mr-2 h-4 w-4" /> Select from Library
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" /> Upload from Device
                                    </Button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {qrCodeUrl && <span className="text-sm text-green-600">Image selected</span>}
                            </div>
                        </div>

                        {/* 5. Footer (Footer Text) */}
                        <div className="space-y-2">
                            <Label htmlFor="footerText">Footer Text</Label>
                            <Input
                                id="footerText"
                                placeholder="e.g. Powered by Mcom"
                                value={footerText}
                                onChange={(e) => setFooterText(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button onClick={handleSave} className="flex-1" disabled={isPending}>
                                <Save className="mr-2 h-4 w-4" />
                                {isPending ? 'Saving...' : 'Save Template'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Preview */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Live Preview</h2>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Print / PDF
                        </Button>
                    </div>

                    <div className="border rounded-lg p-4 md:p-8 bg-gray-50 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                        <div id="plaque-preview-container">
                            <PlaquePreview
                                title={name}
                                actionText={actionText}
                                description={description}
                                extraInfo={footerText}
                                qrCodeUrl={previewQrCodeUrl}
                            />
                            <p className="text-xs text-gray-400 mt-2 text-center">QR Code will be generated upon saving.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Library Dialog */}
            <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle>Select from Media Library</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        <MediaLibrary
                            isModal
                            onSelect={handleSelectAsset}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {
                isCropping && cropImage && (
                    <ImageCropper
                        image={cropImage}
                        onCropComplete={handleCropComplete}
                        onCancel={() => {
                            setIsCropping(false);
                            setCropImage(null);
                        }}
                        aspect={1}
                    />
                )
            }
        </div >
    );
}
