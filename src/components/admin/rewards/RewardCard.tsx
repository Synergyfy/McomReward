'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardResponse } from "@/services/rewards/types";
import Image from "next/image";
import { Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from 'react';

interface RewardCardProps {
  reward: RewardResponse;
  onEditClick: (reward: RewardResponse) => void;
  onDeleteClick: () => void;
}

export default function RewardCard({ reward, onEditClick, onDeleteClick }: RewardCardProps) {
  const [confirmationText, setConfirmationText] = useState('');

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl flex flex-col">
      <CardHeader className="p-0 relative h-40">
        {reward.image ? (
          <Image
            src={reward.image}
            alt={reward.title}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl font-bold mb-2 truncate">{reward.title}</CardTitle>
        <p className="text-sm text-muted-foreground h-10">{reward.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Points</span>
                      <span className="font-bold text-lg text-orange-600">{reward.pointsRequired}</span>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-xs text-muted-foreground">Value</span>
                      <span className="font-bold text-lg">£{reward.value}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-muted-foreground">Quantity</span>
                      <span className="font-bold text-lg">{reward.quantity}</span>
                    </div>
                  </div>      </CardContent>
      <CardFooter className="p-4 bg-gray-50 border-t">
        <div className="flex w-full justify-end space-x-2">
            <Button onClick={() => onEditClick(reward)} variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the reward.
                    To confirm, please type &quot;delete&quot; below.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                  value={confirmationText} 
                  onChange={(e) => setConfirmationText(e.target.value)} 
                  placeholder='delete'
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmationText('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => { 
                      onDeleteClick(); 
                      setConfirmationText('');
                    }} 
                    disabled={confirmationText !== 'delete'}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
