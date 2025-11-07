'use client';

import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { QrCode, Nfc, ScanLine, PoundSterling, Users, PlusCircle, Video, Megaphone, Download, Link as LinkIcon, Pencil, Trash2, MoreVertical, Power, Replace, Eye, BarChart2, UploadCloud, FileVideo, ImageIcon, Clapperboard, Clock, Zap, FileText, Mail, Sparkles, Palette, UserPlus, CircleDollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useRouter } from 'next/navigation';

// --- Mock Data ---

const assetOverviewData = {
  qrPlaques: { allocated: 1000, assigned: 750, sold: 200, active: 700 },
  nfcCards: { issued: 50, active: 45, pending: 5 },
  scansAndRedemptions: { totalScans: 12500, totalRedemptions: 3400 },
  resaleRevenue: 1500,
  groupSize: 15,
};

const qrPlaquesData = [
  { id: 'Plaque-001', partner: 'Coffee House', status: 'Active', scans: 120, redemptions: 30 },
  { id: 'Plaque-002', partner: 'Bookstore', status: 'Active', scans: 75, redemptions: 15 },
  { id: 'Plaque-003', partner: 'Unassigned', status: 'Inactive', scans: 0, redemptions: 0 },
  { id: 'Plaque-004', partner: 'Gym', status: 'For Sale', scans: 0, redemptions: 0 },
  { id: 'Plaque-005', partner: 'Coffee House', status: 'Active', scans: 200, redemptions: 50 },
];

const nfcCardsData = [
    { id: 'NFC-001', type: 'Business', status: 'Active', tapCount: 542, linkedPage: '/profile' },
    { id: 'NFC-002', type: 'Staff', status: 'Active', tapCount: 123, linkedPage: '/staff/john-doe' },
    { id: 'NFC-003', type: 'Premium', status: 'Inactive', tapCount: 0, linkedPage: null },
    { id: 'NFC-004', type: 'Business', status: 'Active', tapCount: 890, linkedPage: '/profile' },
  ];

const mediaAssetsData = {
    storefrontVideo: {
        url: 'https://videos.pexels.com/video-files/2792833/2792833-hd_1280_720_25fps.mp4', // Placeholder video
        thumbnail: 'https://images.pexels.com/videos/2792833/pictures/preview-0.jpg',
        analytics: {
            views: 12345,
            watchTime: '2m 30s',
            conversions: 45,
        }
    },
    gallery: [
        { type: 'video', url: 'https://videos.pexels.com/video-files/2792833/2792833-hd_1280_720_25fps.mp4', thumbnail: 'https://images.pexels.com/videos/2792833/pictures/preview-0.jpg' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
        { type: 'logo', url: 'https://images.unsplash.com/photo-1614289371518-722f2615943c?auto=format&fit=crop&w=200&q=80', thumbnail: 'https://images.unsplash.com/photo-1614289371518-722f2615943c?auto=format&fit=crop&w=200&q=80' },
    ]
};

const marketingMaterialsData = {
    downloadCenter: [
        { id: 'flyer-01', type: 'Flyer', title: 'Grand Opening Flyer', format: 'PDF', icon: FileText },
        { id: 'poster-01', type: 'Poster', title: 'Summer Sale Poster', format: 'PNG', icon: ImageIcon },
        { id: 'banner-01', type: 'Digital Banner', title: 'Website Header Banner', format: 'JPG', icon: Clapperboard },
        { id: 'email-01', type: 'Email Template', title: 'New Customer Welcome Email', format: 'HTML', icon: Mail },
    ],
};

const partnerNetworkData = {
    groupOverview: {
        name: 'Downtown Business Alliance',
        members: 15,
        totalScans: 25800,
        revenueSplit: '70/30',
    },
    partners: [
        { id: 'partner-01', name: 'The Coffee Spot', role: 'Member', status: 'Active', joined: '2023-01-15', commission: 5, scans: 1250, redemptions: 350, plaques: 3 },
        { id: 'partner-02', name: 'ReadMore Books', role: 'Member', status: 'Active', joined: '2023-02-20', commission: 5, scans: 850, redemptions: 120, plaques: 2 },
        { id: 'partner-03', name: 'FitLife Gym', role: 'Admin', status: 'Active', joined: '2022-11-01', commission: 10, scans: 3200, redemptions: 800, plaques: 5 },
        { id: 'partner-04', name: 'Gourmet Grocer', role: 'Pending', status: 'Invited', joined: null, commission: 5, scans: 0, redemptions: 0, plaques: 0 },
    ]
};

const revenueData = {
    overview: {
        plaqueSales: 4500,
        offerRedemptions: 1250,
        commissions: 850,
        pendingPayouts: 2300,
    },
    earningsChart: [
        { name: 'Jan', earnings: 1200 },
        { name: 'Feb', earnings: 1800 },
        { name: 'Mar', earnings: 1500 },
        { name: 'Apr', earnings: 2100 },
        { name: 'May', earnings: 1900 },
        { name: 'Jun', earnings: 2300 },
    ],
    transactions: [
        { id: 'txn-001', date: '2025-10-28', type: 'Plaque Sale', amount: 25.00, status: 'Completed' },
        { id: 'txn-002', date: '2025-10-27', type: 'Offer Redemption', amount: 5.50, status: 'Completed' },
        { id: 'txn-003', date: '2025-10-26', type: 'Commission', amount: 2.50, status: 'Completed' },
        { id: 'txn-004', date: '2025-10-25', type: 'Payout', amount: -500.00, status: 'Pending' },
        { id: 'txn-005', date: '2025-10-24', type: 'Plaque Sale', amount: 25.00, status: 'Completed' },
    ]
};

const chartData = [
    { name: 'Mon', scans: 400, redemptions: 240 },
    { name: 'Tue', scans: 300, redemptions: 139 },
    { name: 'Wed', scans: 200, redemptions: 980 },
    { name: 'Thu', scans: 278, redemptions: 390 },
    { name: 'Fri', scans: 189, redemptions: 480 },
    { name: 'Sat', scans: 239, redemptions: 380 },
    { name: 'Sun', scans: 349, redemptions: 430 },
];

// --- Reusable Components ---

const StatCard = ({ title, value, icon: Icon, details }: { title: string, value: string | number, icon: React.ElementType, details?: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {details && <p className="text-xs text-gray-400">{details}</p>}
      </div>
      <div className="bg-orange-100 text-orange-500 p-3 rounded-full">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ label, icon: Icon }: { label: string, icon: React.ElementType }) => (
    <Button className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-orange-600 transition-colors">
        <Icon className="h-5 w-5" />
        {label}
    </Button>
);

// --- Tab Components ---

const OverviewTab = () => (
    <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="QR Plaques" value={assetOverviewData.qrPlaques.active} icon={QrCode} details={`Allocated: ${assetOverviewData.qrPlaques.allocated} | Assigned: ${assetOverviewData.qrPlaques.assigned} | Sold: ${assetOverviewData.qrPlaques.sold}`} />
            <StatCard title="NFC Cards Issued" value={assetOverviewData.nfcCards.issued} icon={Nfc} details={`Active: ${assetOverviewData.nfcCards.active} | Pending: ${assetOverviewData.nfcCards.pending}`} />
            <StatCard title="Scans & Redemptions" value={assetOverviewData.scansAndRedemptions.totalScans.toLocaleString()} icon={ScanLine} details={`Redemptions: ${assetOverviewData.scansAndRedemptions.totalRedemptions.toLocaleString()}`} />
            <StatCard title="Total Resale Revenue" value={`£${assetOverviewData.resaleRevenue.toLocaleString()}`} icon={PoundSterling} />
            <StatCard title="Partner Group Size" value={assetOverviewData.groupSize} icon={Users} />
        </div>
        {/* Quick Actions */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton label="Assign QR Plaque" icon={PlusCircle} />
                <QuickActionButton label="Invite Partner" icon={Users} />
                <QuickActionButton label="Create Offer" icon={Megaphone} />
                <QuickActionButton label="Upload Storefront Video" icon={Video} />
            </div>
        </div>
    </div>
);

const QRPlaquesTab = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
      })
    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="for-sale">For Sale</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Partner" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Partners</SelectItem>
                        <SelectItem value="coffee-house">Coffee House</SelectItem>
                        <SelectItem value="bookstore">Bookstore</SelectItem>
                        <SelectItem value="gym">Gym</SelectItem>
                    </SelectContent>
                </Select>
                <DatePickerWithRange date={date} setDate={setDate} />
            </div>

            {/* Plaques Table */}
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full">
                    <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                        <tr>
                            <th className="p-4">Plaque ID</th>
                            <th className="p-4">Partner</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Scans</th>
                            <th className="p-4">Redemptions</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qrPlaquesData.map((plaque) => (
                            <tr key={plaque.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{plaque.id}</td>
                                <td className="p-4">{plaque.partner}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        plaque.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        plaque.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {plaque.status}
                                    </span>
                                </td>
                                <td className="p-4">{plaque.scans}</td>
                                <td className="p-4">{plaque.redemptions}</td>
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download Artwork</DropdownMenuItem>
                                            <DropdownMenuItem><LinkIcon className="mr-2 h-4 w-4" /> Assign to Partner</DropdownMenuItem>
                                            <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Mark for Sale</DropdownMenuItem>
                                            <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Metrics Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Scans & Redemptions</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="scans" fill="#fb923c" />
                        <Bar dataKey="redemptions" fill="#ea580c" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const NFCCardsTab = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
      })
    const router = useRouter();
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Order Extra Cards
                </Button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <table className="w-full">
                    <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                        <tr>
                            <th className="p-4">Card ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Tap Count</th>
                            <th className="p-4">Linked Page</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nfcCardsData.map((card) => (
                            <tr key={card.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{card.id}</td>
                                <td className="p-4">{card.type}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        card.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {card.status}
                                    </span>
                                </td>
                                <td className="p-4">{card.tapCount}</td>
                                <td className="p-4">
                                    {card.linkedPage ? <a href={card.linkedPage} className="text-orange-600 hover:underline">View Page</a> : 'N/A'}
                                </td>
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Power className="mr-2 h-4 w-4" /> Activate / Deactivate</DropdownMenuItem>
                                            <DropdownMenuItem><Replace className="mr-2 h-4 w-4" /> Request Replacement</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')}><Eye className="mr-2 h-4 w-4" /> View Linked Page</DropdownMenuItem>
                                            <DropdownMenuItem><BarChart2 className="mr-2 h-4 w-4" /> Track Scans/Taps</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StorefrontMediaTab = () => (
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
                        <video controls poster={mediaAssetsData.storefrontVideo.thumbnail} className="w-full h-full object-cover">
                            <source src={mediaAssetsData.storefrontVideo.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                        <div className="flex flex-col items-center">
                            <Eye className="h-6 w-6 text-orange-500 mb-1" />
                            <p className="text-2xl font-bold">{mediaAssetsData.storefrontVideo.analytics.views.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Views</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Clock className="h-6 w-6 text-orange-500 mb-1" />
                            <p className="text-2xl font-bold">{mediaAssetsData.storefrontVideo.analytics.watchTime}</p>
                            <p className="text-sm text-gray-500">Avg. Watch Time</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Zap className="h-6 w-6 text-orange-500 mb-1" />
                            <p className="text-2xl font-bold">{mediaAssetsData.storefrontVideo.analytics.conversions}</p>
                            <p className="text-sm text-gray-500">Conversions</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Media Gallery */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Your Media</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {mediaAssetsData.gallery.map((asset, index) => (
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

const MarketingMaterialsTab = () => (
    <div className="space-y-8">
        {/* Download Center */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Download Center</h2>
            <p className="text-gray-600 mb-6">Access pre-designed promotional materials to help you spread the word.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

const PartnerNetworkTab = () => (
    <div className="space-y-8">
        {/* Group Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Group Name" value={partnerNetworkData.groupOverview.name} icon={Users} />
            <StatCard title="Total Members" value={partnerNetworkData.groupOverview.members} icon={Users} />
            <StatCard title="Total Scans" value={partnerNetworkData.groupOverview.totalScans.toLocaleString()} icon={ScanLine} />
            <StatCard title="Revenue Split" value={partnerNetworkData.groupOverview.revenueSplit} icon={PoundSterling} />
        </div>

        {/* Actions */}
        <div className="flex justify-end">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <UserPlus className="mr-2 h-4 w-4" /> Invite Partner
            </Button>
        </div>

        {/* Partner List */}
        <div className="bg-white p-4 rounded-lg shadow">
            <table className="w-full">
                <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                    <tr>
                        <th className="p-4">Business Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4">Commission %</th>
                        <th className="p-4">Scans</th>
                        <th className="p-4">Redemptions</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {partnerNetworkData.partners.map((partner) => (
                        <tr key={partner.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{partner.name}</td>
                            <td className="p-4">{partner.role}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    partner.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    partner.status === 'Invited' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {partner.status}
                                </span>
                            </td>
                            <td className="p-4">{partner.joined ? new Date(partner.joined).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-4">{partner.commission}%</td>
                            <td className="p-4">{partner.scans.toLocaleString()}</td>
                            <td className="p-4">{partner.redemptions.toLocaleString()}</td>
                            <td className="p-4 text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Plaques ({partner.plaques})</DropdownMenuItem>
                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit Commission</DropdownMenuItem>
                                        <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Remove from Group</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const RevenueAnalyticsTab = () => (
    <div className="space-y-8">
        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Plaque Sales" value={`£${revenueData.overview.plaqueSales.toLocaleString()}`} icon={PoundSterling} />
            <StatCard title="Offer Redemptions" value={`£${revenueData.overview.offerRedemptions.toLocaleString()}`} icon={CircleDollarSign} />
            <StatCard title="Commissions Earned" value={`£${revenueData.overview.commissions.toLocaleString()}`} icon={Users} />
            <StatCard title="Pending Payouts" value={`£${revenueData.overview.pendingPayouts.toLocaleString()}`} icon={Clock} />
        </div>

        {/* Payout Action */}
        <div className="flex justify-end">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Request Payout
            </Button>
        </div>

        {/* Earnings Graph */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Earnings Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData.earningsChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `£${value}`} />
                    <Legend />
                    <Bar dataKey="earnings" fill="#fb923c" name="Monthly Earnings" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Transaction List */}
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold p-4">Transaction History</h3>
            <table className="w-full">
                <thead className="text-left text-sm font-semibold text-gray-600 border-b">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {revenueData.transactions.map((txn) => (
                        <tr key={txn.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{new Date(txn.date).toLocaleDateString()}</td>
                            <td className="p-4">{txn.type}</td>
                            <td className={`p-4 font-medium ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {txn.amount > 0 ? `+£${txn.amount.toFixed(2)}` : `-£${Math.abs(txn.amount).toFixed(2)}`}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    txn.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {txn.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


export default function MyAssetsPage() {
    return (
        <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">My Assets</h1>
            <Tabs.Root defaultValue="overview">
                <Tabs.List className="flex border-b">
                    <Tabs.Trigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-gray-500 px-4 py-2">
                        Overview
                    </Tabs.Trigger>
                    <Tabs.Trigger value="qr-plaques" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-gray-500 px-4 py-2">
                        QR Plaques
                    </Tabs.Trigger>
                    <Tabs.Trigger value="nfc-cards" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-gray-500 px-4 py-2">
                        NFC Cards
                    </Tabs.Trigger>
                    <Tabs.Trigger value="storefront-media" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-gray-500 px-4 py-2">
                        Storefront & Media
                    </Tabs.Trigger>
                    <Tabs.Trigger value="marketing-materials" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-gray-500 px-4 py-2">
                        Marketing Materials
                    </Tabs.Trigger>
                    <Tabs.Trigger value="partner-network" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-gray-500 px-4 py-2">
                        Partner Network
                    </Tabs.Trigger>
                    <Tabs.Trigger value="revenue-analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-gray-500 px-4 py-2">
                        Revenue & Analytics
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="overview" className="pt-6">
                    <OverviewTab />
                </Tabs.Content>
                <Tabs.Content value="qr-plaques" className="pt-6">
                    <QRPlaquesTab />
                </Tabs.Content>
                <Tabs.Content value="nfc-cards" className="pt-6">
                    <NFCCardsTab />
                </Tabs.Content>
                <Tabs.Content value="storefront-media" className="pt-6">
                    <StorefrontMediaTab />
                </Tabs.Content>
                <Tabs.Content value="marketing-materials" className="pt-6">
                    <MarketingMaterialsTab />
                </Tabs.Content>
                <Tabs.Content value="partner-network" className="pt-6">
                    <PartnerNetworkTab />
                </Tabs.Content>
                <Tabs.Content value="revenue-analytics" className="pt-6">
                    <RevenueAnalyticsTab />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}

