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
import { useCreateLibraryAsset, useGetLibraryAssets, useDeleteLibraryAsset, useUpdateLibraryAsset } from '@/services/media-library/hooks';
import { AssetType, AssetSource, UpdateLibraryAssetDto } from '@/services/media-library/types';
import { useGetSectors, useGetCategoriesBySector } from '@/services/sectors/hook';
import Image from 'next/image';

// --- Components ---

// --- Components ---

export default function AdminMediaLibraryPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreview, setPendingPreview] = useState<string | null>(null);

    // Form states for upload
    const [assetTitle, setAssetTitle] = useState('');
    const [assetDescription, setAssetDescription] = useState('');
    const [selectedSectorId, setSelectedSectorId] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const [page, setPage] = useState(1);
    const limit = 20;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();
    const { mutateAsync: createAsset } = useCreateLibraryAsset();
    const { mutateAsync: deleteAsset } = useDeleteLibraryAsset();
    const { mutateAsync: updateAsset } = useUpdateLibraryAsset();

    const { data: sectorsData } = useGetSectors();
    const { data: categoriesData } = useGetCategoriesBySector(selectedSectorId);

    const { data: libraryData, isLoading: isLoadingAssets } = useGetLibraryAssets({
        page,
        limit,
        search: searchQuery,
        type: filterType === 'all' ? undefined : filterType,
        source: AssetSource.ALL
    });

    const assets = libraryData?.data || [];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPendingFile(file);
        setAssetTitle(file.name.split('.')[0] || file.name); // Default title to filename
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPendingPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPendingPreview(null);
        }
    };

    const handleStartUpload = async () => {
        if (!pendingFile || !assetTitle) {
            toast.error('Please select a file and provide a title');
            return;
        }

        setIsUploading(true);
        try {
            const folder = 'admin-media-library';
            const cloudinaryResult = await uploadToCloudinary({ file: pendingFile, folder });

            const assetType = pendingFile.type.startsWith('image/') ? AssetType.IMAGE :
                pendingFile.type.startsWith('video/') ? AssetType.VIDEO :
                    pendingFile.type.includes('pdf') || pendingFile.type.includes('word') ? AssetType.DOCUMENT : AssetType.OTHER;

            await createAsset({
                url: cloudinaryResult.secure_url,
                title: assetTitle,
                description: assetDescription,
                type: assetType,
                sectorId: selectedSectorId || undefined,
                categoryId: selectedCategoryId || undefined,
            });

            toast.success('Asset created successfully!');
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
        setAssetTitle('');
        setAssetDescription('');
        setSelectedSectorId('');
        setSelectedCategoryId('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('URL copied to clipboard');
    };

    const handleDeleteAsset = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            await deleteAsset(id);
            if (selectedAsset?.id === id) setSelectedAsset(null);
            toast.success('Asset deleted');
        } catch (error) {
            toast.error('Failed to delete asset');
        }
    };

    const handleUpdateAsset = async (id: string, updates: UpdateLibraryAssetDto) => {
        try {
            await updateAsset({ id, data: updates });
            // Update the selected asset locally to reflect changes immediately
            setSelectedAsset((prev: any) => ({ ...prev, ...updates }));
            setIsEditMode(false);
        } catch (error) {
            // Toast handled in hook
        }
    };

    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editSectorId, setEditSectorId] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');

    // Reset edit state when an asset is selected
    React.useEffect(() => {
        if (selectedAsset) {
            setIsEditMode(false);
            setEditTitle(selectedAsset.title || '');
            setEditDescription(selectedAsset.description || '');
            setEditSectorId(selectedAsset.sectorId || '');
            setEditCategoryId(selectedAsset.categoryId || '');
        }
    }, [selectedAsset]);

    // Fetch categories for the edit form based on currently selected edit sector
    const { data: editCategoriesData } = useGetCategoriesBySector(editSectorId);

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
                            <SelectItem value={AssetType.IMAGE}>Images</SelectItem>
                            <SelectItem value={AssetType.VIDEO}>Videos</SelectItem>
                            <SelectItem value={AssetType.DOCUMENT}>Documents</SelectItem>
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

                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Title</label>
                                                    <Input
                                                        placeholder="Enter title..."
                                                        value={assetTitle}
                                                        onChange={(e) => setAssetTitle(e.target.value)}
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (Optional)</label>
                                                    <Input
                                                        placeholder="Enter description..."
                                                        value={assetDescription}
                                                        onChange={(e) => setAssetDescription(e.target.value)}
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sector</label>
                                                        <Select value={selectedSectorId} onValueChange={setSelectedSectorId}>
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder="Select Sector" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sectorsData?.map((sector: any) => (
                                                                    <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                                                        <Select
                                                            value={selectedCategoryId}
                                                            onValueChange={setSelectedCategoryId}
                                                            disabled={!selectedSectorId}
                                                        >
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder="Select Category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {categoriesData?.data?.map((cat: any) => (
                                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size</span>
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
                    {isLoadingAssets ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Loader2 size={40} className="animate-spin text-orange-600 mb-4" />
                            <p className="text-gray-500">Loading assets...</p>
                        </div>
                    ) : assets.length === 0 ? (
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
                                {assets.map((asset) => (
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
                                        {asset.type === AssetType.IMAGE ? (
                                            <Image
                                                src={asset.url}
                                                alt={asset.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2">
                                                {asset.type === AssetType.VIDEO ? <Video size={36} className="text-gray-400" /> : <FileText size={36} className="text-gray-400" />}
                                                <span className="text-[10px] font-semibold text-gray-500 uppercase px-2 py-0.5 bg-white rounded shadow-sm">
                                                    {asset.type}
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            <p className="text-white text-xs font-medium truncate">{asset.title}</p>
                                            <p className="text-gray-300 text-[10px]">{asset.size || 'N/A'}</p>
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
                                    {assets.map((asset) => (
                                        <tr
                                            key={asset.id}
                                            onClick={() => setSelectedAsset(asset)}
                                            className={`hover:bg-gray-50 cursor-pointer transition ${selectedAsset?.id === asset.id ? 'bg-orange-50' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden relative flex-shrink-0">
                                                        {asset.type === AssetType.IMAGE ? (
                                                            <Image src={asset.url} alt={asset.title} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                {asset.type === AssetType.VIDEO ? <Video size={16} className="text-gray-400" /> : <FileText size={16} className="text-gray-400" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{asset.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="capitalize font-normal text-xs">{asset.type}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{asset.size || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(asset.createdAt).toLocaleDateString()}
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
                                    {selectedAsset.type === AssetType.IMAGE ? (
                                        <Image src={selectedAsset.url} alt={selectedAsset.title} fill className="object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                            {selectedAsset.type === AssetType.VIDEO ? <Video size={48} className="text-gray-300" /> : <FileText size={48} className="text-gray-300" />}
                                            <span className="text-xl font-bold text-gray-400 uppercase">{selectedAsset.type}</span>
                                        </div>
                                    )}
                                </div>

                                {isEditMode ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                                            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                            <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sector</label>
                                            <Select value={editSectorId} onValueChange={setEditSectorId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Sector" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectorsData?.map((sector: any) => (
                                                        <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                                            <Select value={editCategoryId} onValueChange={setEditCategoryId} disabled={!editSectorId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {editCategoriesData?.data?.map((cat: any) => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" onClick={() => handleUpdateAsset(selectedAsset.id, {
                                                title: editTitle,
                                                description: editDescription,
                                                sectorId: editSectorId,
                                                categoryId: editCategoryId
                                            })} className="bg-orange-600 text-white flex-1">
                                                Save Changes
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setIsEditMode(false)} className="flex-1">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Title</h4>
                                                <p className="text-sm font-semibold text-zinc-700 break-all">{selectedAsset.title}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-6 text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 px-2" onClick={() => setIsEditMode(true)}>
                                                Edit
                                            </Button>
                                        </div>

                                        {selectedAsset.description && (
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                                                <p className="text-sm font-medium text-zinc-600 italic">"{selectedAsset.description}"</p>
                                            </div>
                                        )}

                                        {(selectedAsset.activeSectorId || selectedAsset.sectorId) && ( // Check for sectorId or a populated sector object if available
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sector & Category</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* In a real scenario, we might want to lookup the name from the ID if not populated, but for now we display IDs or assume backend populates names in a real response */}
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                                        {sectorsData?.find((s: any) => s.id === selectedAsset.sectorId)?.name || 'Unknown Sector'}
                                                    </Badge>
                                                    {selectedAsset.categoryId && (
                                                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100">
                                                            {/* We may not have all categories loaded to lookup name easily without fetching, so using ID or a placeholder if name isn't on asset */}
                                                            {/* Ideally asset response includes sectorName/categoryName */}
                                                            Category: {selectedAsset.categoryId.substring(0, 8)}...
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">File Type</h4>
                                                <p className="text-sm font-semibold text-zinc-700 capitalize">{selectedAsset.type}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">File Size</h4>
                                                <p className="text-sm font-semibold text-zinc-700">{selectedAsset.size || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uploaded On</h4>
                                                <p className="text-sm font-semibold text-zinc-700">{new Date(selectedAsset.createdAt).toLocaleDateString()}</p>
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
                                )}
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
