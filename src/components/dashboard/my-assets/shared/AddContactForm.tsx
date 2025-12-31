'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useCreateContact } from '@/services/network-contacts/hook';
import { CreateContactDto, LocationTag, RelationshipTag } from '@/services/network-contacts/types';
import { toast } from 'sonner';

interface AddContactFormProps {
    onSuccess?: (contact: any) => void;
    onCancel?: () => void;
    initialData?: Partial<CreateContactDto>;
}

const LOCATION_TAG_INFO = {
    nearby: 'Very close, neighbourhood radius.',
    hyperlocal: 'Wider local area but still nearby.',
    national: 'Anywhere within the country.',
};

const RELATIONSHIP_TAG_INFO = {
    partner: 'Someone you collaborate with.',
    supplier: 'Someone who provides you items or services.',
    affiliate: 'Promotes your business.',
};

export default function AddContactForm({ onSuccess, onCancel, initialData }: AddContactFormProps) {
    const createContact = useCreateContact();
    const [formData, setFormData] = useState<CreateContactDto>({
        fullName: initialData?.fullName || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        businessName: initialData?.businessName || '',
        relationshipTag: initialData?.relationshipTag || 'partner',
        locationTag: initialData?.locationTag || 'nearby',
        hasPermission: initialData?.hasPermission || false,
    });

    const handleAddContact = async () => {
        try {
            const newContact = await createContact.mutateAsync(formData);
            if (onSuccess) {
                onSuccess(newContact);
            }
        } catch (error: any) {
            console.error('Failed to create contact', error);
            const errorMessage = error?.response?.data?.message || 'Failed to add contact. Please try again.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="fullName">
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <TooltipProvider>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={5} align="center" className="max-w-xs z-[10000]">
                                    <p className="text-sm">Enter the full name of the contact person or business owner.</p>
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

                {/* Business Name */}
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="businessName">Business Name</Label>
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
                        id="businessName"
                        value={formData.businessName || ''}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="ABC Company Ltd"
                    />
                </div>

                {/* Email */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="email">Email</Label>
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
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                </div>

                {/* Phone */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="phone">
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
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+44 20 1234 5678"
                    />
                </div>

                {/* Location Tag */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="locationTag">
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
                        <Label htmlFor="relationshipTag">
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
                                        <p><strong>Affiliate:</strong> Promotes your business</p>
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
                            <SelectItem value="affiliate" textValue="Affiliate">
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">Affiliate</span>
                                    <span className="text-xs text-muted-foreground font-normal">
                                        {RELATIONSHIP_TAG_INFO.affiliate}
                                    </span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Permission Confirmation */}
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
                            <Label htmlFor="permission" className="font-semibold text-orange-900 cursor-pointer">
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

            <div className="flex justify-end gap-2 mt-4">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} disabled={createContact.isPending}>
                        Cancel
                    </Button>
                )}
                <Button
                    onClick={handleAddContact}
                    disabled={createContact.isPending || !formData.fullName || !formData.phone || !formData.hasPermission}
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    {createContact.isPending ? 'Adding...' : 'Add Contact'}
                </Button>
            </div>
        </div>
    );
}
