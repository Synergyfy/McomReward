'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    NetworkLocationTag,
    NetworkRelationshipTag,
    ReferredBusiness,
} from '@/services/affiliate/types';
import { useUpdateReferralTags } from '@/services/affiliate/hook';
import { toast } from 'sonner';
import { LOCATION_TAG_INFO, RELATIONSHIP_TAG_INFO } from '@/components/dashboard/my-assets/shared/AddContactForm';

interface UpdateTagsModalProps {
    business: ReferredBusiness;
    isOpen: boolean;
    onClose: () => void;
}

export default function UpdateTagsModal({ business, isOpen, onClose }: UpdateTagsModalProps) {
    const [locationTag, setLocationTag] = useState<NetworkLocationTag | 'null'>(business.locationTag || 'null');
    const [relationshipTag, setRelationshipTag] = useState<NetworkRelationshipTag | 'null'>(business.relationshipTag || 'null');

    const updateTagsMutation = useUpdateReferralTags();

    const handleSave = async () => {
        try {
            await updateTagsMutation.mutateAsync({
                businessId: business.businessId,
                tags: {
                    locationTag: locationTag === 'null' ? undefined : locationTag,
                    relationshipTag: relationshipTag === 'null' ? undefined : relationshipTag,
                },
            });
            toast.success('Tags updated successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to update tags');
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Tags for {business.name}</DialogTitle>
                    <DialogDescription>
                        Assign location and relationship tags to this referred business.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                            Location
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={locationTag}
                                onValueChange={(value) => setLocationTag(value as NetworkLocationTag | 'null')}
                            >
                                <SelectTrigger id="location">
                                    <SelectValue placeholder="Select location tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">None</SelectItem>
                                    <SelectItem value={NetworkLocationTag.NEARBY} textValue="Nearby">
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium">Nearby</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {LOCATION_TAG_INFO.nearby}
                                            </span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={NetworkLocationTag.HYPERLOCAL} textValue="Hyperlocal">
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium">Hyperlocal</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {LOCATION_TAG_INFO.hyperlocal}
                                            </span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={NetworkLocationTag.NATIONAL} textValue="National">
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
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="relationship" className="text-right">
                            Relationship
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={relationshipTag}
                                onValueChange={(value) => setRelationshipTag(value as NetworkRelationshipTag | 'null')}
                            >
                                <SelectTrigger id="relationship">
                                    <SelectValue placeholder="Select relationship tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">None</SelectItem>
                                    <SelectItem value={NetworkRelationshipTag.PARTNER} textValue="Partner">
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium">Partner</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {RELATIONSHIP_TAG_INFO.partner}
                                            </span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={NetworkRelationshipTag.SUPPLIER} textValue="Supplier">
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium">Supplier</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {RELATIONSHIP_TAG_INFO.supplier}
                                            </span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={NetworkRelationshipTag.AFFILIATE} textValue="Affiliate">
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium">Affiliate</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {RELATIONSHIP_TAG_INFO.affiliate}
                                            </span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-2">
                                Select a relationship tag.
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={updateTagsMutation.isPending}>
                        {updateTagsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}