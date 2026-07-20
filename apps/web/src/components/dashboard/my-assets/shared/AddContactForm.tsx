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
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCreateContact } from '@/services/network-contacts/hook';
import { CreateContactDto, LocationTag, RelationshipTag } from '@/services/network-contacts/types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface AddContactFormProps {
    onSuccess?: (contact: any) => void;
    onCancel?: () => void;
    initialData?: Partial<CreateContactDto>;
}

export const LOCATION_TAG_INFO = {
    hyperlocal: 'Within 3 miles of your location.',
    nearby: 'Within 8 miles of your location.',
    national: 'Greater than 8 miles away.',
};

export const RELATIONSHIP_TAG_INFO = {
    partner: 'Someone you collaborate with.',
    supplier: 'Someone who provides you items or services.',
    affiliate: 'Someone who refers customers to your business.',
};

export default function AddContactForm({ onSuccess, onCancel, initialData }: AddContactFormProps) {
    const createContact = useCreateContact();
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [contactPostalCode, setContactPostalCode] = useState<string | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

    const [formData, setFormData] = useState<CreateContactDto>({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        businessName: initialData?.businessName || '',
        relationshipTag: initialData?.relationshipTag || 'partner',
        locationTag: initialData?.locationTag || 'hyperlocal',
        hasPermission: initialData?.hasPermission || false,
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleIdentifierBlur = async () => {
        if (!isExistingUser || !formData.email || formData.email.length < 3) return;

        setIsFetching(true);
        setErrorMessage(null);

        // TODO: Fetch postal code and distance from backend API
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsFetching(false);
    };

    const handleAddContact = async () => {
        setErrorMessage(null);
        try {
            const dataToSubmit = { ...formData };

            const newContact = await createContact.mutateAsync(dataToSubmit);
            if (onSuccess) {
                onSuccess(newContact);
            }
        } catch (error: any) {
            console.error('Failed to create contact', error);
            const msg = error?.response?.data?.message || 'Failed to add contact. Please try again.';
            setErrorMessage(msg);
        }
    };

    return (
        <div className="space-y-4 py-4">
            {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Existing User Question */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="existing-user" className="text-blue-900 font-medium cursor-pointer">
                            Does this user already exist in MCOM Mall?
                        </Label>
                        <TooltipProvider>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-blue-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="z-[10000]">
                                    <p className="text-sm">If yes, you only need their email or username to connect.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="existing-user"
                            checked={isExistingUser}
                            onCheckedChange={(checked) => setIsExistingUser(checked as boolean)}
                        />
                        <span className={isExistingUser ? "text-sm font-bold text-blue-900" : "text-sm text-blue-400"}>Yes</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {isExistingUser ? (
                    /* Existing User Flow: Only Email/Username */
                    <div className="col-span-2 space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor="identifier">
                                    User Email or Username <span className="text-red-500">*</span>
                                </Label>
                                {isFetching && <span className="text-xs text-orange-600 animate-pulse flex items-center gap-1">
                                    <div className="h-2 w-2 bg-orange-600 rounded-full animate-bounce" />
                                    Fetching data from MCOM Mall...
                                </span>}
                                <TooltipProvider>
                                    <Tooltip delayDuration={200}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={5} align="center" className="max-w-xs z-[10000]">
                                            <p className="text-sm">Enter the MCOM Mall email or username. We will automatically detect their location.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                id="identifier"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                onBlur={handleIdentifierBlur}
                                placeholder="username or email@example.com"
                                className={contactPostalCode ? "border-green-200 bg-green-50/30" : ""}
                            />
                        </div>

                        {contactPostalCode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex items-center justify-between"
                            >
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">MCOM Mall Profile Found</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Postal Code</span>
                                            <span className="font-mono font-bold text-gray-900">{contactPostalCode}</span>
                                        </div>
                                        <div className="h-8 w-[1px] bg-gray-100" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Distance</span>
                                            <span className="font-bold text-gray-900">{distance?.toFixed(1)} miles</span>
                                        </div>
                                        <div className="h-8 w-[1px] bg-gray-100" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Detected Location</span>
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 capitalize w-fit">
                                                {formData.locationTag}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </motion.div>
                        )}
                    </div>
                ) : (
                    /* Normal Flow */
                    <>
                        {/* Name Fields */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor="firstName">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor="lastName">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Doe"
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
                    </>
                )}

                {/* Location Tag */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="locationTag">
                            Location Tag <span className="text-red-500">*</span>
                        </Label>
                        {isExistingUser && contactPostalCode && (
                            <Badge variant="outline" className="h-4 text-[9px] px-1.5 border-green-200 text-green-700 bg-green-50 animate-in fade-in zoom-in duration-300">
                                Auto-detected
                            </Badge>
                        )}
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
                            <SelectItem value="hyperlocal" textValue="Hyperlocal">
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">Hyperlocal</span>
                                    <span className="text-xs text-muted-foreground font-normal">
                                        {LOCATION_TAG_INFO.hyperlocal}
                                    </span>
                                </div>
                            </SelectItem>
                            <SelectItem value="nearby" textValue="Nearby">
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">Nearby</span>
                                    <span className="text-xs text-muted-foreground font-normal">
                                        {LOCATION_TAG_INFO.nearby}
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
                    disabled={
                        createContact.isPending ||
                        (!isExistingUser && (!formData.firstName || !formData.phone)) ||
                        (isExistingUser && !formData.email) ||
                        !formData.hasPermission
                    }
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    {createContact.isPending ? 'Adding...' : 'Add Contact'}
                </Button>
            </div>
        </div>
    );
}