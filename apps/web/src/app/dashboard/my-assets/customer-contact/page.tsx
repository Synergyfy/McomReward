'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
    Search,
    Filter,
    Plus,
    Upload,
    Edit2,
    Trash2,
    Users,
    UserCheck,
    Clock,
    XCircle,
    ChevronDown,
    X,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
    Info,
} from 'lucide-react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetCustomers,
    useAddCustomer,
    useBulkImportCustomers,
} from '@/services/customer-contacts/hook';
import {
    Customer,
    CustomerStatus,
    CreateCustomerDto,
    LocationTag,
    RelationshipTag,
} from '@/services/customer-contacts/types';

type SortOption = 'newest' | 'oldest' | 'name';

// Status badge styling
const getStatusConfig = (status: CustomerStatus) => {
    switch (status) {
        case 'accepted':
            return {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                icon: CheckCircle2,
            };
        case 'pending':
            return {
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: Clock,
            };
        case 'rejected':
            return {
                bg: 'bg-rose-50',
                text: 'text-rose-700',
                border: 'border-rose-200',
                icon: XCircle,
            };
        default:
            return {
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                border: 'border-gray-200',
                icon: AlertCircle,
            };
    }
};

// Location tag info
const LOCATION_TAG_INFO = {
    nearby: 'Very close, neighbourhood radius.',
    hyperlocal: 'Wider local area but still nearby.',
    national: 'Anywhere within the country.',
};

// Relationship tag info
const RELATIONSHIP_TAG_INFO = {
    partner: 'Someone you collaborate with.',
    supplier: 'Someone who provides you items or services.',
    affiliate: 'Someone who refers customers to your business.',
};

export default function CustomerContactPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateCustomerDto>({
        fullName: '',
        businessName: '',
        email: '',
        phone: '',
        locationTag: 'nearby',
        relationshipTag: 'partner',
        hasPermission: false,
    });

    // CSV Import state
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<CreateCustomerDto[]>([]);
    const [bulkPermission, setBulkPermission] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Query params
    const queryParams = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: sortBy === 'name' ? 'fullName' as const : 'createdAt' as const,
        sortOrder: sortBy === 'oldest' ? 'ASC' as const : 'DESC' as const,
    };

    // Hooks
    const { data: customersData, isLoading } = useGetCustomers(queryParams);
    const addCustomer = useAddCustomer();
    const bulkImport = useBulkImportCustomers();

    // Stats calculation
    const totalCustomers = customersData?.meta.total || 0;
    const acceptedCount = customersData?.data.filter((c) => c.status === 'accepted').length || 0;
    const pendingCount = customersData?.data.filter((c) => c.status === 'pending').length || 0;

    // Handlers
    const handleAddCustomer = async () => {
        if (!formData.fullName || !formData.phone) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!formData.hasPermission) {
            toast.error('Permission confirmation is required');
            return;
        }

        try {
            await addCustomer.mutateAsync(formData);
            toast.success('Customer added successfully!');
            setIsAddModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to add customer');
            console.error(error);
        }
    };

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        setCsvFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter((line) => line.trim());
            const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

            const parsed: CreateCustomerDto[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map((v) => v.trim());
                if (values.length >= 2) {
                    const customer: CreateCustomerDto = {
                        fullName: values[headers.indexOf('fullname')] || values[headers.indexOf('name')] || values[0] || '',
                        businessName: values[headers.indexOf('businessname')] || values[headers.indexOf('business')] || '',
                        email: values[headers.indexOf('email')] || '',
                        phone: values[headers.indexOf('phone')] || values[1] || '',
                        locationTag: (values[headers.indexOf('locationtag')] as LocationTag) || 'nearby',
                        relationshipTag: (values[headers.indexOf('relationshiptag')] as RelationshipTag) || 'partner',
                        hasPermission: false,
                    };
                    if (customer.fullName && customer.phone) {
                        parsed.push(customer);
                    }
                }
            }
            setParsedData(parsed);
            toast.success(`Parsed ${parsed.length} customers from CSV`);
        };
        reader.readAsText(file);
    }, []);

    const handleBulkImport = async () => {
        if (parsedData.length === 0) {
            toast.error('No valid data to import');
            return;
        }

        if (!bulkPermission) {
            toast.error('Please confirm you have permission to import these contacts');
            return;
        }

        try {
            await bulkImport.mutateAsync({
                networks: parsedData,
                hasPermission: bulkPermission,
            });
            toast.success(`Successfully imported ${parsedData.length} customers!`);
            setIsImportModalOpen(false);
            setCsvFile(null);
            setParsedData([]);
            setBulkPermission(false);
        } catch (error) {
            toast.error('Failed to import customers');
            console.error(error);
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            businessName: '',
            email: '',
            phone: '',
            locationTag: 'nearby',
            relationshipTag: 'partner',
            hasPermission: false,
        });
    };

    const openViewModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsViewModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Premium Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-8 shadow-xl"
                >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                    Customer Contact
                                </h1>
                                <p className="text-orange-100 mt-2 text-lg">
                                    Manage your customer relationships and grow your network
                                </p>
                            </div>
                            <div className="flex flex-row gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm flex-1 sm:flex-initial"
                                    onClick={() => setIsImportModalOpen(true)}
                                >
                                    <Upload className="h-4 w-4 mr-2 shrink-0" />
                                    Import CSV
                                </Button>
                                <Button
                                    className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-initial"
                                    onClick={() => {
                                        resetForm();
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2 shrink-0" />
                                    Add Customer
                                </Button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 text-sm">Total Customers</p>
                                        <p className="text-2xl font-bold text-white">{totalCustomers}</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-400/30 rounded-lg">
                                        <UserCheck className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 text-sm">Active</p>
                                        <p className="text-2xl font-bold text-white">{acceptedCount}</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-400/30 rounded-lg">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 text-sm">Pending</p>
                                        <p className="text-2xl font-bold text-white">{pendingCount}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search customers by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value: CustomerStatus | 'all') => setStatusFilter(value)}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px] h-11">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={sortBy}
                                    onValueChange={(value: SortOption) => setSortBy(value)}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px] h-11">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                        <SelectItem value="name">Name A-Z</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                    </div>
                </motion.div>

                {/* Customers Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100"
                >
                    {isLoading ? (
                        <div className="p-16 text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
                            <p className="mt-4 text-gray-500">Loading customers...</p>
                        </div>
                    ) : customersData?.data.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="h-10 w-10 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Start building your customer network by adding your first customer or importing from a CSV file.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsImportModalOpen(true)}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import CSV
                                </Button>
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700"
                                    onClick={() => {
                                        resetForm();
                                        setIsAddModalOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Customer
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                                        <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Contact Info</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Location</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Relationship</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {customersData?.data.map((customer, index) => {
                                            const statusConfig = getStatusConfig(customer.status);
                                            const StatusIcon = statusConfig.icon;
                                            return (
                                                <motion.tr
                                                    key={customer.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="group hover:bg-orange-50/50 transition-colors border-b border-gray-100"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                                                <span className="text-orange-700 font-semibold text-sm">
                                                                    {customer.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{customer.fullName}</p>
                                                                {customer.businessName && (
                                                                    <p className="text-sm text-gray-500">{customer.businessName}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {customer.email && (
                                                                <p className="text-sm text-gray-600">{customer.email}</p>
                                                            )}
                                                            <p className="text-sm text-gray-500">{customer.phone}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize font-normal">
                                                            {customer.locationTag}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize font-normal">
                                                            {customer.relationshipTag}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} capitalize font-normal`}
                                                        >
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {customer.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openViewModal(customer)}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                            </div>

                            {/* Pagination */}
                            {customersData && customersData.meta.lastPage > 1 && (
                                <div className="border-t border-gray-100 px-4 md:px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                                    <p className="text-sm text-gray-500">
                                        Page {currentPage} of {customersData.meta.lastPage} • {customersData.meta.total} customers
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((p) => Math.min(customersData.meta.lastPage, p + 1))}
                                            disabled={currentPage === customersData.meta.lastPage}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>

            {/* Add Customer Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Add New Customer</DialogTitle>
                        <DialogDescription>
                            Add a customer to your network. Fields marked with * are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="col-span-1 sm:col-span-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Label htmlFor="fullName">
                                        Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs z-[10000]">
                                                <p className="text-sm">Enter the full name of the customer or business owner.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs z-[10000]">
                                                <p className="text-sm">The official name of the business or company this customer represents.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="businessName"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    placeholder="ABC Company Ltd"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs z-[10000]">
                                                <p className="text-sm">Primary email address for business communications and campaign invitations.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Label htmlFor="phone">
                                        Phone <span className="text-red-500">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs z-[10000]">
                                                <p className="text-sm">Contact phone number for direct communication and follow-ups.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+44 20 1234 5678"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Label htmlFor="locationTag">Location</Label>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs z-[10000]">
                                                <div className="text-sm space-y-1">
                                                    <p><strong>Nearby:</strong> {LOCATION_TAG_INFO.nearby}</p>
                                                    <p><strong>Hyperlocal:</strong> {LOCATION_TAG_INFO.hyperlocal}</p>
                                                    <p><strong>National:</strong> {LOCATION_TAG_INFO.national}</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select
                                    value={formData.locationTag}
                                    onValueChange={(value: LocationTag) =>
                                        setFormData({ ...formData, locationTag: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nearby">Nearby</SelectItem>
                                        <SelectItem value="hyperlocal">Hyperlocal</SelectItem>
                                        <SelectItem value="national">National</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Label htmlFor="relationshipTag">Relationship</Label>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={200}>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs z-[10000]">
                                                <div className="text-sm space-y-1">
                                                    <p><strong>Partner:</strong> {RELATIONSHIP_TAG_INFO.partner}</p>
                                                    <p><strong>Supplier:</strong> {RELATIONSHIP_TAG_INFO.supplier}</p>
                                                    <p><strong>Referral:</strong> {RELATIONSHIP_TAG_INFO.affiliate}</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select
                                    value={formData.relationshipTag}
                                    onValueChange={(value: RelationshipTag) =>
                                        setFormData({ ...formData, relationshipTag: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="partner">Partner</SelectItem>
                                        <SelectItem value="supplier">Supplier</SelectItem>
                                        <SelectItem value="affiliate">Referral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Permission Checkbox */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="permission"
                                    checked={formData.hasPermission}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, hasPermission: checked as boolean })
                                    }
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="permission" className="font-medium text-orange-900 cursor-pointer">
                                            Permission Confirmation <span className="text-red-500">*</span>
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip delayDuration={200}>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-orange-600 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-xs z-[10000]">
                                                    <p className="text-sm">You must confirm that you have explicit permission from this customer to store their information and contact them for business purposes. This is required for GDPR compliance.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <p className="text-sm text-orange-800 mt-1">
                                        I confirm that this customer has given permission to add their details and be contacted for business purposes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddCustomer}
                            disabled={addCustomer.isPending || !formData.fullName || !formData.phone || !formData.hasPermission}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {addCustomer.isPending ? 'Adding...' : 'Add Customer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CSV Import Modal */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Import Customers from CSV</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file with customer data. The file should have columns for: fullName, phone, email (optional), businessName (optional).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* File Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${csvFile
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50'
                                }
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            {csvFile ? (
                                <div className="flex flex-col items-center">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                                    <p className="font-medium text-green-700">{csvFile.name}</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        {parsedData.length} customers parsed successfully
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 text-gray-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCsvFile(null);
                                            setParsedData([]);
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Remove file
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-3" />
                                    <p className="font-medium text-gray-700">Click to upload CSV file</p>
                                    <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                                </div>
                            )}
                        </div>

                        {/* Preview Table */}
                        {parsedData.length > 0 && (
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b">
                                    <p className="font-medium text-sm text-gray-700">Preview (first 5 rows)</p>
                                </div>
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Business</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.slice(0, 5).map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{row.fullName}</TableCell>
                                                <TableCell>{row.businessName || '—'}</TableCell>
                                                <TableCell>{row.email || '—'}</TableCell>
                                                <TableCell>{row.phone}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </div>
                                {parsedData.length > 5 && (
                                    <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-500">
                                        ...and {parsedData.length - 5} more
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Permission Checkbox */}
                        {parsedData.length > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="bulkPermission"
                                        checked={bulkPermission}
                                        onCheckedChange={(checked) => setBulkPermission(checked as boolean)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <Label htmlFor="bulkPermission" className="font-medium text-orange-900 cursor-pointer">
                                            Permission Confirmation <span className="text-red-500">*</span>
                                        </Label>
                                        <p className="text-sm text-orange-800 mt-1">
                                            I confirm that all imported customers have given permission to be added and contacted for business purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsImportModalOpen(false);
                                setCsvFile(null);
                                setParsedData([]);
                                setBulkPermission(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkImport}
                            disabled={bulkImport.isPending || parsedData.length === 0 || !bulkPermission}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {bulkImport.isPending ? 'Importing...' : `Import ${parsedData.length} Customers`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Customer Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Customer Details</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                    <span className="text-orange-700 font-bold text-xl">
                                        {selectedCustomer.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{selectedCustomer.fullName}</h3>
                                    {selectedCustomer.businessName && (
                                        <p className="text-gray-500">{selectedCustomer.businessName}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3 border-t pt-4">
                                {selectedCustomer.email && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Email</span>
                                        <span className="text-gray-900">{selectedCustomer.email}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phone</span>
                                    <span className="text-gray-900">{selectedCustomer.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Location</span>
                                    <Badge variant="outline" className="capitalize">{selectedCustomer.locationTag}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Relationship</span>
                                    <Badge variant="outline" className="capitalize">{selectedCustomer.relationshipTag}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <Badge
                                        variant="outline"
                                        className={`${getStatusConfig(selectedCustomer.status).bg} ${getStatusConfig(selectedCustomer.status).text} ${getStatusConfig(selectedCustomer.status).border} capitalize`}
                                    >
                                        {selectedCustomer.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Added</span>
                                    <span className="text-gray-900">
                                        {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
