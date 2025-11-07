'use client';

import React, { useState } from 'react';
import { Download, Link as LinkIcon, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

const qrPlaquesData = [
  { id: 'Plaque-001', partner: 'Coffee House', status: 'Active', scans: 120, redemptions: 30 },
  { id: 'Plaque-002', partner: 'Bookstore', status: 'Active', scans: 75, redemptions: 15 },
  { id: 'Plaque-003', partner: 'Unassigned', status: 'Inactive', scans: 0, redemptions: 0 },
  { id: 'Plaque-004', partner: 'Gym', status: 'For Sale', scans: 0, redemptions: 0 },
  { id: 'Plaque-005', partner: 'Coffee House', status: 'Active', scans: 200, redemptions: 50 },
];

const chartData = [
    { name: 'Mon', scans: 400, redemptions: 240 },
    { name: 'Tue', scans: 300, redemptions: 139 },
    { name: 'Wed', scans: 200, redemptions: 980 },
    { name: 'Thu', scans: 278, redemptions: 390 },
    { name: 'Fri', scans: 189, redemptions: 480 },
    { name: 'Sat', scans: 239, redemptions: 380 },
    { name: 'Sun', scans: 349, redemptions: 430 },
];

export default function QRPlaquesPage() {
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
