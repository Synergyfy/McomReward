'use client';

import React, { useState } from 'react';
import { useGetCustomerActivities, useGetParticipantActivity } from '@/services/campaigns/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye } from 'lucide-react';
import { PointHistoryType } from '@/services/campaigns/types';

export default function CustomerActivitiesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading } = useGetCustomerActivities(page, limit);

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleViewDetails = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Activities</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{activity.participantName}</TableCell>
                        <TableCell>{activity.campaignName}</TableCell>
                        <TableCell>
                          <Badge variant={activity.activityType === PointHistoryType.EARN ? 'default' : 'secondary'}
                            className={activity.activityType === PointHistoryType.EARN ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              activity.activityType === PointHistoryType.REDEEM ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : ''}
                          >
                            {activity.activityType}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.details}</TableCell>
                        <TableCell>{new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!activity.participantId}
                            onClick={() => activity.participantId && handleViewDetails(activity.participantId)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data?.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No activities found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>

                {/* Pagination */}
                {data && data.total > 0 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
                    <Button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {data.page} of {Math.ceil(data.total / data.limit)}
                    </span>
                    <Button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= Math.ceil(data.total / data.limit)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Participant Details Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Participant Activity Timeline</SheetTitle>
              <SheetDescription>
                Detailed history for this participant across all campaigns.
              </SheetDescription>
            </SheetHeader>

            {selectedParticipantId && <ParticipantTimeline participantId={selectedParticipantId} />}

          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function ParticipantTimeline({ participantId }: { participantId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetParticipantActivity(participantId, page, 10);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-8">
        {data?.data.map((activity, index) => (
          <div key={index} className="relative flex items-start ml-6">
            <div className={`absolute -left-[31px] mt-1.5 h-4 w-4 rounded-full border-2 border-white ${activity.activityType === PointHistoryType.EARN ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>
            <div className="flex-1 bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-gray-900">{activity.campaignName}</h4>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
              <Badge variant="outline" className="text-xs">
                {activity.activityType}
              </Badge>
            </div>
          </div>
        ))}

        {data?.data.length === 0 && (
          <p className="text-center text-gray-500">No detailed activity found.</p>
        )}
      </div>

      {/* Pagination for Sheet */}
      {data && data.total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            variant="ghost"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500">
            Page {data.page}
          </span>
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / data.limit)}
            variant="ghost"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
