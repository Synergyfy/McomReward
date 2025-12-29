'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Users, UserPlus, Award, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { useAffiliateStats } from '@/services/affiliate/hook';
import { useGetNetworkContacts } from '@/services/network-contacts/hook';
import { useUpdateQrPlaque } from '@/services/qr-plaques/hook';
import { NetworkContact, RelationshipTag, LocationTag, CreateContactDto } from '@/services/network-contacts/types';
import { ReferredBusiness } from '@/services/affiliate/types';
import AddContactForm from '@/components/dashboard/my-assets/shared/AddContactForm';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AssignPlaqueWizardProps {
    isOpen: boolean;
    onClose: () => void;
    plaqueId: string | null;
}

type WizardStep = 'menu' | 'affiliate_list' | 'contact_list' | 'add_contact';

export default function AssignPlaqueWizard({ isOpen, onClose, plaqueId }: AssignPlaqueWizardProps) {
    const [step, setStep] = useState<WizardStep>('menu');
    const [searchQuery, setSearchQuery] = useState('');
    const [prefillContact, setPrefillContact] = useState<Partial<CreateContactDto>>({});
    const { mutate: updatePlaque } = useUpdateQrPlaque();

    // Data Hooks
    const { data: affiliateStats, isLoading: isAffiliateLoading } = useAffiliateStats();
    const { data: contactsData, isLoading: isContactsLoading } = useGetNetworkContacts({
        limit: 50,
        search: searchQuery || undefined
    });

    const handleAssign = (contactId: string) => {
        if (!plaqueId || !contactId) return;

        const promise = new Promise((resolve, reject) => {
            updatePlaque({
                id: plaqueId,
                data: {
                    status: 'PENDING',
                    networkContactId: contactId
                }
            }, {
                onSuccess: () => {
                    resolve(true);
                    onClose();
                    setStep('menu');
                    setPrefillContact({});
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });

        toast.promise(promise, {
            loading: 'Assigning plaque...',
            success: 'Plaque assigned successfully!',
            error: 'Failed to assign plaque'
        });
    };

    const handleBack = () => {
        setStep('menu');
        setSearchQuery('');
        setPrefillContact({});
    };

    const renderMenu = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <div
                className="flex flex-col items-center justify-center p-6 border rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all gap-4 text-center h-[200px]"
                onClick={() => setStep('affiliate_list')}
            >
                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                    <Award className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Affiliate Service</h3>
                    <p className="text-sm text-gray-500 mt-1">Assign to businesses you've invited</p>
                </div>
            </div>

            <div
                className="flex flex-col items-center justify-center p-6 border rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all gap-4 text-center h-[200px]"
                onClick={() => setStep('contact_list')}
            >
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                    <Users className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Network Contacts</h3>
                    <p className="text-sm text-gray-500 mt-1">Assign to existing contacts</p>
                </div>
            </div>

            <div
                className="flex flex-col items-center justify-center p-6 border rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all gap-4 text-center h-[200px]"
                onClick={() => setStep('add_contact')}
            >
                <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                    <UserPlus className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Add New Contact</h3>
                    <p className="text-sm text-gray-500 mt-1">Create contact and assign automatically</p>
                </div>
            </div>
        </div>
    );

    const renderAffiliateList = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="text-sm text-muted-foreground">
                    Select an affiliate to assign
                </div>
            </div>

            {isAffiliateLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : !affiliateStats?.referredBusinesses?.length ? (
                <div className="text-center p-8 text-gray-500">
                    No affiliates found. Try inviting businesses first.
                </div>
            ) : (
                <div className="max-h-[400px] overflow-y-auto border rounded-md divide-y">
                    {affiliateStats.referredBusinesses.map((affiliate: ReferredBusiness, index: number) => (
                        <div
                            key={index}
                            className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                            onClick={() => {
                                setPrefillContact({
                                    fullName: affiliate.name,
                                    businessName: affiliate.name,
                                    relationshipTag: 'affiliate',
                                    locationTag: 'national'
                                });
                                setStep('add_contact');
                                toast.info('Please verify contact details to assign', { duration: 3000 });
                            }}
                        >
                            <div>
                                <p className="font-medium">{affiliate.name}</p>
                                <p className="text-xs text-gray-500">Joined: {new Date(affiliate.referredAt).toLocaleDateString()}</p>
                            </div>
                            <Button size="sm" variant="secondary">Select</Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderContactList = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {isContactsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : !contactsData?.data?.length ? (
                <div className="text-center p-8 text-gray-500">
                    No contacts found.
                </div>
            ) : (
                <div className="max-h-[400px] overflow-y-auto border rounded-md divide-y">
                    {contactsData.data.map((contact: NetworkContact) => (
                        <div
                            key={contact.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                            onClick={() => handleAssign(contact.id)}
                        >
                            <div>
                                <p className="font-medium">{contact.fullName}</p>
                                {contact.businessName && <p className="text-sm text-gray-600">{contact.businessName}</p>}
                                <p className="text-xs text-gray-400 capitalize">{contact.relationshipTag} • {contact.locationTag}</p>
                            </div>
                            <Button size="sm" variant="secondary">Select</Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderAddContact = () => (
        <div className="space-y-4">
            <div className="flex items-center mb-2">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
            </div>
            <AddContactForm
                initialData={prefillContact}
                onSuccess={(newContact) => {
                    handleAssign(newContact.id);
                }}
                onCancel={handleBack}
            />
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assign Plaque {plaqueId}</DialogTitle>
                    <DialogDescription>
                        {step === 'menu' && "Choose how you would like to assign this plaque."}
                        {step === 'affiliate_list' && "Select a business from your affiliate network."}
                        {step === 'contact_list' && "Select a contact from your network."}
                        {step === 'add_contact' && "Create a new contact to assign this plaque to."}
                    </DialogDescription>
                </DialogHeader>

                {step === 'menu' && renderMenu()}
                {step === 'affiliate_list' && renderAffiliateList()}
                {step === 'contact_list' && renderContactList()}
                {step === 'add_contact' && renderAddContact()}

            </DialogContent>
        </Dialog>
    );
}
