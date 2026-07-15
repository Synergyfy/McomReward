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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Form Contacts</h1>
              <p className="text-gray-500 mt-1">
                Manage your network of contacts, partners, and relationships
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => toast.info('CSV import coming soon')}
              >
                <Upload className="h-4 w-4 shrink-0" />
                <span>Import CSV</span>
              </Button>
              <Button
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>Add Contact</span>
              </Button>
            </div>
          </div>

          {/* Referral Stats Progress Bar */}
          {referralStats && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-1">
                <div>
                  <span className="text-sm font-medium text-orange-900 block">
                    Referral Capacity
                  </span>
                  <span className="text-xs text-orange-700">
                    Contacts Uploaded
                  </span>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  {referralStats.uploaded} / {referralStats.referralCapacity}
                </span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(referralStats.percentage, 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-orange-800">
                  {referralStats.remaining} spots remaining
                </span>
                {referralStats.percentage < 100 && (
                  <Button
                    variant="link"
                    className="text-orange-600 p-0 h-auto font-medium text-xs"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Add More Contacts →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, business, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
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

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">Filter Options</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Location</Label>
                    <Select
                      value={locationFilter}
                      onValueChange={(value: LocationTag | 'all') => setLocationFilter(value)}

                    >
                      <SelectTrigger>
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
                    <Label className="text-sm font-medium mb-2 block">Relationship</Label>
                    <Select
                      value={relationshipFilter}
                      onValueChange={(value: RelationshipTag | 'all') => setRelationshipFilter(value)}
                    >
                      <SelectTrigger>
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
                    <Label className="text-sm font-medium mb-2 block">Source</Label>
                    <Select
                      value={sourceFilter}
                      onValueChange={(value: SourceTag | 'all') => setSourceFilter(value)}
                    >
                      <SelectTrigger>
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
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value: ContactStatus | 'all') => setStatusFilter(value)}
                    >
                      <SelectTrigger>
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

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-500">Loading contacts...</p>
            </div>
          ) : contactsData?.data.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || activeFiltersCount > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first contact'}
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
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
                <div className="border-t border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * 10 + 1} to{' '}
                    {Math.min(currentPage * 10, contactsData.meta.total)} of {contactsData.meta.total}{' '}
                    contacts
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
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
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={
                                currentPage === page
                                  ? 'bg-orange-600 hover:bg-orange-700'
                                  : ''
                              }
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
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
      </div>

      {/* Add Contact Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your network. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Edit Contact Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Fields */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="edit-firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="edit-lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                </div>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>

              {/* Business Name */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="edit-businessName">Business Name</Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="center" className="max-w-xs z-[10000]">
                        <p className="text-sm">The official name of the business or company this contact represents.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="edit-businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="ABC Company Ltd"
                />
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="start" className="max-w-xs z-[10000]">
                        <p className="text-sm">Primary email address for business communications and campaign invitations.</p>
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
                />
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="edit-phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="end" className="max-w-xs z-[10000]">
                        <p className="text-sm">Contact phone number for direct communication and follow-ups.</p>
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
                />
              </div>

              {/* Location Tag */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="edit-locationTag">
                    Location Tag <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} align="start" className="max-w-xs z-[10000]">
                        <div className="text-sm space-y-1">
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {/* <SelectItem value="nearby">Nearby</SelectItem>
                    <SelectItem value="hyperlocal">Hyperlocal</SelectItem>
                    <SelectItem value="national">National</SelectItem> */}
                    <SelectItem value="nearby" textValue="Nearby">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">Nearby</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {LOCATION_TAG_INFO.nearby}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hyperlocal" textValue="Hyperlocal">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">Hyperlocal</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {LOCATION_TAG_INFO.hyperlocal}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="national" textValue="National">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">National</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {LOCATION_TAG_INFO.national}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Relationship Tag */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="edit-relationshipTag">
                    Relationship Tag <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                                              <TooltipContent side="top" sideOffset={5} align="end" className="max-w-xs z-[10000]">
                                              <div className="text-sm space-y-1">
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
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                          <SelectItem value="partner" textValue="Partner">
                                            <div className="flex flex-col items-start text-left">
                                              <span className="font-medium">Partner</span>
                                              <span className="text-xs text-muted-foreground font-normal">
                                                {RELATIONSHIP_TAG_INFO.partner}
                                              </span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="supplier" textValue="Supplier">
                                            <div className="flex flex-col items-start text-left">
                                              <span className="font-medium">Supplier</span>
                                              <span className="text-xs text-muted-foreground font-normal">
                                                {RELATIONSHIP_TAG_INFO.supplier}
                                              </span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="affiliate" textValue="Referral">
                                            <div className="flex flex-col items-start text-left">
                                              <span className="font-medium">Referral</span>
                                              <span className="text-xs text-muted-foreground font-normal">
                                                {RELATIONSHIP_TAG_INFO.affiliate}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>              </div>
            </div>

            {/* Permission Confirmation */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="edit-permission"
                  checked={formData.hasPermission}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hasPermission: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="edit-permission" className="font-semibold text-orange-900 cursor-pointer">
                      Permission Confirmation <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-orange-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} align="start" className="max-w-xs z-[10000]">
                          <p className="text-sm">You must confirm that you have explicit permission from this contact to store their information and contact them for business purposes. This is required for GDPR compliance.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-orange-800 mt-1">
                    I confirm that this business has given permission to add their details to my
                    contact list and that I may contact them for business purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedContact(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditContact}
              disabled={updateContact.isPending || !formData.firstName || !formData.lastName || !formData.phone || !formData.hasPermission}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updateContact.isPending ? 'Updating...' : 'Update Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
