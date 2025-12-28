'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
    Search,
    Grid,
    List,
    Upload,
    Filter,
    MoreVertical,
    Download,
    Trash2,
    Info,
    X,
    FileText,
    Image as ImageIcon,
    Video,
    File,
    Check,
    Plus,
    Loader2,
    Copy,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useUploadToCloudinary } from '@/services/upload/hook';
import Image from 'next/image';

// --- Types ---

type MediaType = 'image' | 'video' | 'document' | 'other';

interface MediaAsset {
    id: string;
    name: string;
    url: string;
    type: MediaType;
    size: string;
    dimensions?: string;
    uploadedAt: string;
    folder: string;
}

// --- Mock Data ---

const MOCK_ASSETS: MediaAsset[] = [
    {
        id: '1',
        name: 'summer-campaign-banner.jpg',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
        type: 'image',
        size: '1.2 MB',
        dimensions: '1920x1080',
        uploadedAt: '2023-11-20T10:00:00Z',
        folder: 'campaigns'
    },
    {
        id: '2',
        name: 'logo-transparent.png',
        url: 'https://images.unsplash.com/photo-1614850523296-e8c1d4704a96?auto=format&fit=crop&q=80&w=400',
        type: 'image',
        size: '245 KB',
        dimensions: '512x512',
        uploadedAt: '2023-11-18T14:30:00Z',
        folder: 'branding'
    },
    {
        id: '3',
        name: 'product-showcase.mp4',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
        type: 'video',
        size: '15.4 MB',
        uploadedAt: '2023-11-15T09:15:00Z',
        folder: 'products'
    },
    {
        id: '4',
        name: 'customer-rewards-guide.pdf',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400',
        type: 'document',
        size: '4.1 MB',
        uploadedAt: '2023-11-10T16:45:00Z',
        folder: 'guides'
    },
    {
        id: '5',
        name: 'lifestyle-promo-01.jpg',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        type: 'image',
        size: '890 KB',
        dimensions: '1200x800',
        uploadedAt: '2023-11-05T11:20:00Z',
        folder: 'campaigns'
    },
    {
        id: '6',
        name: 'winter-sale-ad.png',
        url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
        type: 'image',
        size: '2.1 MB',
        dimensions: '1080x1350',
        uploadedAt: '2023-12-01T08:00:00Z',
        folder: 'campaigns'
    }
];

// --- Components ---

export default function AdminMediaLibraryPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
    const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
    const [assets, setAssets] = useState<MediaAsset[]>(MOCK_ASSETS);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || asset.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [assets, searchQuery, filterType]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPendingFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPendingPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPendingPreview(null);
        }
    };

    const handleStartUpload = async () => {
        if (!pendingFile) return;

        setIsUploading(true);
        try {
            const folder = 'admin-media-library';
            const result = await uploadToCloudinary({ file: pendingFile, folder });

            const newAsset: MediaAsset = {
                id: Math.random().toString(36).substr(2, 9),
                name: pendingFile.name,
                url: result.secure_url,
                type: pendingFile.type.startsWith('image/') ? 'image' :
                    pendingFile.type.startsWith('video/') ? 'video' :
                        pendingFile.type.includes('pdf') || pendingFile.type.includes('word') ? 'document' : 'other',
                size: `${(pendingFile.size / (1024 * 1024)).toFixed(2)} MB`,
                uploadedAt: new Date().toISOString(),
                folder: folder
            };

            setAssets(prev => [newAsset, ...prev]);
            toast.success('File uploaded successfully!');
            handleCloseUploadModal();
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
        setPendingFile(null);
        setPendingPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('URL copied to clipboard');
    };

    const handleDeleteAsset = (id: string) => {
        setAssets(prev => prev.filter(a => a.id !== id));
        if (selectedAsset?.id === id) setSelectedAsset(null);
        toast.success('Asset deleted');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 m-6">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Media Library</h1>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Search media..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="video">Videos</SelectItem>
                            <SelectItem value="document">Documents</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                    >
                        <Upload size={18} />
                        Upload
                    </Button>

                    {/* Upload Modal */}
                    <Dialog open={isUploadModalOpen} onOpenChange={(open) => !open && handleCloseUploadModal()}>
                        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                            <DialogHeader className="p-6 bg-gray-50/80 border-b border-gray-100">
                                <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <Upload size={20} />
                                    </div>
                                    Upload Media
                                </DialogTitle>
                            </DialogHeader>

                            <div className="p-8">
                                {!pendingFile ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                            <Plus size={32} className="text-gray-400 group-hover:text-orange-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-700">Click to select a file</p>
                                            <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept="image/*,video/*,.pdf,.doc,.docx"
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="relative aspect-video rounded-2xl bg-gray-100 overflow-hidden shadow-inner border border-gray-200 flex items-center justify-center">
                                            {pendingPreview ? (
                                                <Image src={pendingPreview} alt="Preview" fill className="object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                                    {pendingFile.type.startsWith('video/') ? <Video size={64} /> : <FileText size={64} />}
                                                    <span className="text-lg font-bold uppercase">{pendingFile.name.split('.').pop()}</span>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setPendingFile(null);
                                                    setPendingPreview(null);
                                                }}
                                                className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition backdrop-blur-sm"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">File Name</span>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-semibold text-gray-700 truncate max-w-[250px]">{pendingFile.name}</p>
                                                <p className="text-sm font-semibold text-gray-700">{(pendingFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <DialogFooter className="p-6 bg-gray-50/80 border-t border-gray-100 sm:justify-between gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCloseUploadModal}
                                    className="rounded-xl px-6 border-gray-200 hover:bg-white transition-all order-2 sm:order-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleStartUpload}
                                    disabled={!pendingFile || isUploading}
                                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all font-bold gap-2 order-1 sm:order-2"
                                >
                                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                                    {isUploading ? 'Uploading...' : 'Start Upload'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${selectedAsset ? 'mr-[350px]' : ''}`}>
                    {filteredAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon size={32} />
                            </div>
                            <p className="text-lg font-medium">No media assets found</p>
                            <p className="text-sm">Try adjusting your filters or upload new files</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredAssets.map((asset) => (
                                    <motion.div
                                        key={asset.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => setSelectedAsset(asset)}
                                        className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedAsset?.id === asset.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent hover:border-gray-200 shadow-sm hover:shadow-md'
                                            }`}
                                    >
                                        {asset.type === 'image' ? (
                                            <Image
                                                src={asset.url}
                                                alt={asset.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2">
                                                {asset.type === 'video' ? <Video size={36} className="text-gray-400" /> : <FileText size={36} className="text-gray-400" />}
                                                <span className="text-[10px] font-semibold text-gray-500 uppercase px-2 py-0.5 bg-white rounded shadow-sm">
                                                    {asset.name.split('.').pop()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            <p className="text-white text-xs font-medium truncate">{asset.name}</p>
                                            <p className="text-gray-300 text-[10px]">{asset.size}</p>
                                        </div>

                                        {selectedAsset?.id === asset.id && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full shadow-lg">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">File</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Size</th>
                                        <th className="px-6 py-3">Uploaded</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredAssets.map((asset) => (
                                        <tr
                                            key={asset.id}
                                            onClick={() => setSelectedAsset(asset)}
                                            className={`hover:bg-gray-50 cursor-pointer transition ${selectedAsset?.id === asset.id ? 'bg-orange-50' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden relative flex-shrink-0">
                                                        {asset.type === 'image' ? (
                                                            <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                {asset.type === 'video' ? <Video size={16} className="text-gray-400" /> : <FileText size={16} className="text-gray-400" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{asset.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="capitalize font-normal text-xs">{asset.type}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{asset.size}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(asset.uploadedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition outline-none">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => copyToClipboard(asset.url)} className="gap-2 cursor-pointer">
                                                            <Copy size={14} />
                                                            Copy Link
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
                                                            <a href={asset.url} download target="_blank" rel="noopener noreferrer">
                                                                <Download size={14} />
                                                                Download
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteAsset(asset.id)} className="text-red-600 gap-2 cursor-pointer hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Side Panel - Details */}
                <AnimatePresence>
                    {selectedAsset && (
                        <motion.div
                            initial={{ x: 350 }}
                            animate={{ x: 0 }}
                            exit={{ x: 350 }}
                            className="absolute right-0 top-0 bottom-0 w-[350px] bg-white border-l border-gray-100 shadow-2xl z-10 flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Media Details</h3>
                                <button
                                    onClick={() => setSelectedAsset(null)}
                                    className="p-1 hover:bg-gray-200 rounded-full transition"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative shadow-inner">
                                    {selectedAsset.type === 'image' ? (
                                        <Image src={selectedAsset.url} alt={selectedAsset.name} fill className="object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                            {selectedAsset.type === 'video' ? <Video size={48} className="text-gray-300" /> : <FileText size={48} className="text-gray-300" />}
                                            <span className="text-xl font-bold text-gray-400 uppercase">{selectedAsset.name.split('.').pop()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">File Name</h4>
                                        <p className="text-sm font-semibold text-zinc-700 break-all">{selectedAsset.name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">File Type</h4>
                                            <p className="text-sm font-semibold text-zinc-700 capitalize">{selectedAsset.type}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">File Size</h4>
                                            <p className="text-sm font-semibold text-zinc-700">{selectedAsset.size}</p>
                                        </div>
                                        {selectedAsset.dimensions && (
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dimensions</h4>
                                                <p className="text-sm font-semibold text-zinc-700">{selectedAsset.dimensions}</p>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uploaded On</h4>
                                            <p className="text-sm font-semibold text-zinc-700">{new Date(selectedAsset.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Internal Link</h4>
                                        <div className="flex gap-2">
                                            <Input value={selectedAsset.url} readOnly className="text-xs h-8 bg-gray-50" />
                                            <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => copyToClipboard(selectedAsset.url)}>
                                                <Copy size={14} />
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-8 px-2" asChild>
                                                <a href={selectedAsset.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 gap-2"
                                    onClick={() => handleDeleteAsset(selectedAsset.id)}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </Button>
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2">
                                    <Download size={16} />
                                    Download
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
