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
                                    <SelectItem value={NetworkLocationTag.NEARBY}>Nearby</SelectItem>
                                    <SelectItem value={NetworkLocationTag.HYPERLOCAL}>Hyperlocal</SelectItem>
                                    <SelectItem value={NetworkLocationTag.NATIONAL}>National</SelectItem>
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
                                    <SelectItem value={NetworkRelationshipTag.PARTNER}>Partner</SelectItem>
                                    <SelectItem value={NetworkRelationshipTag.CUSTOMER}>Customer</SelectItem>
                                    <SelectItem value={NetworkRelationshipTag.SUPPLIER}>Supplier</SelectItem>
                                    <SelectItem value={NetworkRelationshipTag.AFFILIATE}>Affiliate</SelectItem>
                                </SelectContent>
                            </Select>
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
