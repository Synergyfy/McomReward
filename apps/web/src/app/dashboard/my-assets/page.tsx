'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Upload,
  Edit2,
  Trash2,
  UserPlus,
  Info,
  ChevronDown,
  X,
  ArrowLeft,
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
import { useGetReferralStats } from '@/services/business/hook';
import {
  useGetNetworkContacts,
  useUpdateContact,
  useDeleteContact,
} from '@/services/network-contacts/hook';
import {
  NetworkContact,
  LocationTag,
  RelationshipTag,
  SourceTag,
  ContactStatus,
  CreateContactDto,
  UpdateContactDto,
} from '@/services/network-contacts/types';
import AddContactForm from '@/components/dashboard/my-assets/shared/AddContactForm';

type SortBy = 'name' | 'newest' | 'oldest' | 'active';

// Tooltip content for tags
const LOCATION_TAG_INFO = {
  nearby: 'Very close, neighbourhood radius.',
  hyperlocal: 'Wider local area but still nearby.',
  national: 'Anywhere within the country.',
};

const RELATIONSHIP_TAG_INFO = {
  partner: 'Someone you collaborate with.',
  supplier: 'Someone who provides you items or services.',
  affiliate: 'Someone who refers customers to your business.',
};

const SOURCE_TAG_INFO = {
  'User-submitted': 'Manually added by the business owner.',
  Platform: 'Contact automatically provided by MCOM.',
  Plaque: 'Contact generated when someone scans their plaque.',
  Affiliate: 'Contact created by referral sign-ups.',
};

// Badge color mapping
const getStatusColor = (status: ContactStatus) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSourceColor = (source: SourceTag) => {
  switch (source) {
    case 'User-submitted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Platform':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Plaque':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Affiliate':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function FormContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<LocationTag | 'all'>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipTag | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceTag | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'oldest' | 'active'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<NetworkContact | null>(null);


  // Form state
  const [formData, setFormData] = useState<CreateContactDto>({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    locationTag: 'nearby',
    relationshipTag: 'partner',
    hasPermission: false,
  });

  // Query params
  const queryParams = {
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    locationTag: locationFilter !== 'all' ? locationFilter : undefined,
    relationshipTag: relationshipFilter !== 'all' ? relationshipFilter : undefined,
    sourceTag: sourceFilter !== 'all' ? sourceFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy,
  };

  // Hooks
  const { data: referralStats } = useGetReferralStats();
  const { data: contactsData, isLoading } = useGetNetworkContacts(queryParams);
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  // Handlers
  const handleEditContact = async () => {
    if (!selectedContact) return;

    const updateData: UpdateContactDto = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      businessName: formData.businessName || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      locationTag: formData.locationTag,
      relationshipTag: formData.relationshipTag,
      hasPermission: formData.hasPermission,
    };

    try {
      await updateContact.mutateAsync({ id: selectedContact.id, contactData: updateData });
      toast.success('Contact updated successfully!');
      setIsEditModalOpen(false);
      setSelectedContact(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update contact');
      console.error(error);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      await deleteContact.mutateAsync(selectedContact.id);
      toast.success('Contact deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      toast.error('Failed to delete contact');
      console.error(error);
    }
  };

  const openEditModal = (contact: NetworkContact) => {
    setSelectedContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      businessName: contact.businessName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      locationTag: contact.locationTag,
      relationshipTag: contact.relationshipTag,
      hasPermission: contact.hasSharingPermission,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (contact: NetworkContact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      businessName: '',
      email: '',
      phone: '',
      locationTag: 'nearby',
      relationshipTag: 'partner',
      hasPermission: false,
    });
  };

  const clearFilters = () => {
    setLocationFilter('all');
    setRelationshipFilter('all');
    setSourceFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const activeFiltersCount = [
    locationFilter !== 'all',
    relationshipFilter !== 'all',
    sourceFilter !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;

  if (isAddModalOpen) {
    return (
      <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 -ml-2 h-9 px-2.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium">Back to Contacts</span>
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
          <div className="border-b border-gray-100 pb-3.5 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Add New Contact</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Add a new contact to your network. Fields marked with * are required.
            </p>
          </div>

          <AddContactForm
            onSuccess={() => {
              toast.success('Contact added successfully!');
              setIsAddModalOpen(false);
              resetForm();
            }}
            onCancel={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
          />
        </div>
      </div>
    );
  }

  if (isEditModalOpen && selectedContact) {
    return (
      <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedContact(null);
              resetForm();
            }}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 -ml-2 h-9 px-2.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium">Back to Contacts</span>
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
          <div className="border-b border-gray-100 pb-3.5 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Edit Contact</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Update information for <span className="font-semibold text-gray-800">{selectedContact.fullName}</span>.
            </p>
          </div>

          <div className="space-y-4 py-2 sm:py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Name Fields */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="edit-firstName" className="text-xs sm:text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="edit-lastName" className="text-xs sm:text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Business Name */}
              <div className="col-span-1 sm:col-span-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="edit-businessName" className="text-xs sm:text-sm font-medium">Business Name</Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="center" className="max-w-xs z-[10000]">
                        <p className="text-xs">The official name of the business or company this contact represents.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="edit-businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="ABC Company Ltd"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="edit-email" className="text-xs sm:text-sm font-medium">Email</Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="start" className="max-w-xs z-[10000]">
                        <p className="text-xs">Primary email address for business communications and campaign invitations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="edit-phone" className="text-xs sm:text-sm font-medium">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="end" className="max-w-xs z-[10000]">
                        <p className="text-xs">Contact phone number for direct communication and follow-ups.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 20 1234 5678"
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Location Tag */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="edit-locationTag" className="text-xs sm:text-sm font-medium">
                    Location Tag <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="start" className="max-w-xs z-[10000]">
                        <div className="text-xs space-y-1">
                          <p><strong>Nearby:</strong> Very close, neighbourhood radius</p>
                          <p><strong>Hyperlocal:</strong> Wider local area but still nearby</p>
                          <p><strong>National:</strong> Anywhere within the country</p>
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
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="nearby" textValue="Nearby">
                      <div className="flex flex-col items-start text-left py-0.5">
                        <span className="font-medium text-xs sm:text-sm">Nearby</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {LOCATION_TAG_INFO.nearby}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hyperlocal" textValue="Hyperlocal">
                      <div className="flex flex-col items-start text-left py-0.5">
                        <span className="font-medium text-xs sm:text-sm">Hyperlocal</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {LOCATION_TAG_INFO.hyperlocal}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="national" textValue="National">
                      <div className="flex flex-col items-start text-left py-0.5">
                        <span className="font-medium text-xs sm:text-sm">National</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {LOCATION_TAG_INFO.national}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Relationship Tag */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label htmlFor="edit-relationshipTag" className="text-xs sm:text-sm font-medium">
                    Relationship Tag <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="end" className="max-w-xs z-[10000]">
                        <div className="text-xs space-y-1">
                          <p><strong>Partner:</strong> Someone you collaborate with</p>
                          <p><strong>Supplier:</strong> Provides you items or services</p>
                          <p><strong>Referral:</strong> Promotes your business</p>
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
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="partner" textValue="Partner">
                      <div className="flex flex-col items-start text-left py-0.5">
                        <span className="font-medium text-xs sm:text-sm">Partner</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {RELATIONSHIP_TAG_INFO.partner}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="supplier" textValue="Supplier">
                      <div className="flex flex-col items-start text-left py-0.5">
                        <span className="font-medium text-xs sm:text-sm">Supplier</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {RELATIONSHIP_TAG_INFO.supplier}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="affiliate" textValue="Referral">
                      <div className="flex flex-col items-start text-left py-0.5">
                        <span className="font-medium text-xs sm:text-sm">Referral</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {RELATIONSHIP_TAG_INFO.affiliate}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permission Confirmation */}
            <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Checkbox
                  id="edit-permission"
                  checked={formData.hasPermission}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hasPermission: checked as boolean })
                  }
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Label htmlFor="edit-permission" className="font-semibold text-xs sm:text-sm text-orange-950 cursor-pointer">
                      Permission Confirmation <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-orange-600 cursor-help shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} align="start" className="max-w-xs z-[10000]">
                          <p className="text-xs">You must confirm that you have explicit permission from this contact to store their information and contact them for business purposes. This is required for GDPR compliance.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                    I confirm that this business has given permission to add their details to my
                    contact list and that I may contact them for business purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedContact(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEditContact}
              disabled={updateContact.isPending || !formData.firstName || !formData.lastName || !formData.phone || !formData.hasPermission}
              className="bg-orange-600 hover:bg-orange-700 text-white h-9 sm:h-10 text-xs sm:text-sm font-medium px-4"
            >
              {updateContact.isPending ? 'Updating...' : 'Update Contact'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Form Contacts</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              Manage your network of contacts, partners, and relationships
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1.5 h-9 sm:h-10 text-xs sm:text-sm font-medium"
              onClick={() => toast.info('CSV import coming soon')}
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Import CSV</span>
            </Button>
            <Button
              size="sm"
              className="flex items-center justify-center gap-1.5 h-9 sm:h-10 text-xs sm:text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Add Contact</span>
            </Button>
          </div>
        </div>

        {/* Referral Stats Progress Bar */}
        {referralStats && (
          <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-orange-950 block">
                  Referral Capacity
                </span>
                <span className="text-[11px] sm:text-xs text-orange-700">
                  Contacts Uploaded
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md">
                {referralStats.uploaded} / {referralStats.referralCapacity}
              </span>
            </div>
            <div className="w-full bg-orange-200/80 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(referralStats.percentage, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] sm:text-xs">
              <span className="text-orange-800 font-medium">
                {referralStats.remaining} spots remaining
              </span>
              {referralStats.percentage < 100 && (
                <Button
                  variant="link"
                  className="text-orange-600 p-0 h-auto font-medium text-[11px] sm:text-xs hover:text-orange-700"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add More Contacts →
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, business, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 sm:h-10 text-xs sm:text-sm bg-gray-50/60 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 h-9 sm:h-10 text-xs sm:text-sm font-medium w-full sm:w-auto"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-orange-100 text-orange-700 border-none font-semibold">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">A-Z</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50/90 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 border border-gray-200/80">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-xs sm:text-sm text-gray-900">Filter Options</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-orange-600 hover:text-orange-700 h-7 text-xs font-medium px-2"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-gray-700">Location</Label>
                  <Select
                    value={locationFilter}
                    onValueChange={(value: LocationTag | 'all') => setLocationFilter(value)}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="nearby">Nearby</SelectItem>
                      <SelectItem value="hyperlocal">Hyperlocal</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-gray-700">Relationship</Label>
                  <Select
                    value={relationshipFilter}
                    onValueChange={(value: RelationshipTag | 'all') => setRelationshipFilter(value)}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Relationships</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="affiliate">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-gray-700">Source</Label>
                  <Select
                    value={sourceFilter}
                    onValueChange={(value: SourceTag | 'all') => setSourceFilter(value)}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="User-submitted">User-submitted</SelectItem>
                      <SelectItem value="Platform">Platform</SelectItem>
                      <SelectItem value="Plaque">Plaque</SelectItem>
                      <SelectItem value="Affiliate">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-gray-700">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: ContactStatus | 'all') => setStatusFilter(value)}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contacts Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-xs sm:text-sm text-gray-500">Loading contacts...</p>
          </div>
        ) : contactsData?.data.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">No contacts found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 max-w-sm mx-auto">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first contact to your network'}
            </p>
            <Button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Contact
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-gray-100">
              {contactsData?.data.map((contact) => (
                <div key={contact.id} className="p-3.5 space-y-2.5 hover:bg-gray-50/50 transition-colors">
                  {/* Top: Name, Business + Status Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {contact.fullName}
                      </div>
                      {contact.businessName ? (
                        <div className="text-xs text-gray-500 font-medium truncate mt-0.5">
                          {contact.businessName}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic mt-0.5">No business name</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-normal capitalize px-2 py-0.5 ${getStatusColor(contact.status)}`}
                      >
                        {contact.status}
                      </Badge>
                      {contact.hasSharingPermission ? (
                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 px-1.5 py-0">
                          ✓ Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 px-1.5 py-0">
                          ✗ Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Tags: Location, Relationship, Source */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-normal capitalize bg-gray-50 text-gray-700">
                      {contact.locationTag}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-normal capitalize bg-gray-50 text-gray-700">
                      {contact.relationshipTag}
                    </Badge>
                    {contact.sourceTag && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-normal ${getSourceColor(contact.sourceTag)}`}
                      >
                        {contact.sourceTag}
                      </Badge>
                    )}
                  </div>

                  {/* Contact info: Email & Phone */}
                  {(contact.email || contact.phone) ? (
                    <div className="text-xs text-gray-600 bg-gray-50/80 rounded-lg p-2 space-y-1">
                      {contact.email && (
                        <div className="truncate flex items-center gap-1.5">
                          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Email:</span>
                          <a href={`mailto:${contact.email}`} className="text-orange-600 hover:underline truncate text-xs">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Phone:</span>
                          <a href={`tel:${contact.phone}`} className="text-gray-800 font-medium text-xs">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info('Add to group feature coming soon')}
                      className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Group</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(contact)}
                      className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal(contact)}
                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Business</TableHead>
                    <TableHead className="font-semibold">Contact Info</TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-1">
                        Location
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1 text-xs">
                                {Object.entries(LOCATION_TAG_INFO).map(([key, value]) => (
                                  <div key={key}>
                                    <strong className="capitalize">{key}:</strong> {value}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-1">
                        Relationship
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1 text-xs">
                                {Object.entries(RELATIONSHIP_TAG_INFO).map(([key, value]) => (
                                  <div key={key}>
                                    <strong className="capitalize">{key}:</strong> {value}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-1">
                        Source
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1 text-xs">
                                {Object.entries(SOURCE_TAG_INFO).map(([key, value]) => (
                                  <div key={key}>
                                    <strong>{key}:</strong> {value}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Permission</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactsData?.data.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{contact.fullName}</TableCell>
                      <TableCell className="text-gray-600">
                        {contact.businessName || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {contact.email && (
                            <div className="text-gray-600">{contact.email}</div>
                          )}
                          {contact.phone && (
                            <div className="text-gray-500">{contact.phone}</div>
                          )}
                          {!contact.email && !contact.phone && (
                            <span className="text-gray-400">No contact info</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal capitalize">
                          {contact.locationTag}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal capitalize">
                          {contact.relationshipTag}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contact.sourceTag ? (
                          <Badge
                            variant="outline"
                            className={`font-normal ${getSourceColor(contact.sourceTag)}`}
                          >
                            {contact.sourceTag}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-normal ${getStatusColor(contact.status)}`}
                        >
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contact.hasSharingPermission ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ✓ Confirmed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            ✗ Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info('Add to group feature coming soon')}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(contact)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(contact)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {contactsData && contactsData.meta.lastPage > 1 && (
              <div className="border-t border-gray-200 px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-500">
                  Showing {(currentPage - 1) * 10 + 1} to{' '}
                  {Math.min(currentPage * 10, contactsData.meta.total)} of {contactsData.meta.total}{' '}
                  contacts
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-2.5 sm:px-3"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: contactsData.meta.lastPage }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === contactsData.meta.lastPage ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-1 text-gray-400 text-xs">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 w-8 p-0 text-xs ${
                              currentPage === page
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : ''
                            }`}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-2.5 sm:px-3"
                    onClick={() => setCurrentPage((p) => Math.min(contactsData.meta.lastPage, p + 1))}
                    disabled={currentPage === contactsData.meta.lastPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <p className="font-semibold text-gray-900">{selectedContact.fullName}</p>
              {selectedContact.businessName && (
                <p className="text-sm text-gray-600">{selectedContact.businessName}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedContact(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteContact}
              disabled={deleteContact.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteContact.isPending ? 'Deleting...' : 'Delete Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
