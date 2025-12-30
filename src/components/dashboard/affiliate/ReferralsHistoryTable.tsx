import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ReferredBusiness } from '@/services/affiliate/types';
import {
  MoreVertical,
  MapPin,
  Users,
  Settings2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import UpdateTagsModal from './UpdateTagsModal';
import { useState } from 'react';

interface ReferralsHistoryTableProps {
  referrals: ReferredBusiness[];
}

export default function ReferralsHistoryTable({ referrals }: ReferralsHistoryTableProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<ReferredBusiness | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (business: ReferredBusiness) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Date Referred</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral, index) => (
                <TableRow key={referral.businessId || index}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{referral.name}</span>
                      <span className="text-xs text-gray-500">{referral.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(referral.referredAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {referral.locationTag ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <MapPin className="h-3 w-3" />
                        {referral.locationTag}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {referral.relationshipTag ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Users className="h-3 w-3" />
                        {referral.relationshipTag}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={referral.status.toLowerCase() === 'completed' || referral.status === 'SUCCESS' ? 'default' : 'outline'}>
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenModal(referral)}>
                          <Settings2 className="mr-2 h-4 w-4" />
                          <span>Update Tags</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedBusiness && (
        <UpdateTagsModal
          business={selectedBusiness}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
