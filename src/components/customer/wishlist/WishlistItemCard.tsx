"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  occasion?: string;
  targetDate?: string;
  consent: boolean;
}

interface WishlistItemCardProps {
  item: WishlistItem;
}

export const WishlistItemCard = ({ item }: WishlistItemCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Category: {item.category}</p>
        <p>Priority: {item.priority}</p>
        {item.occasion && <p>Occasion: {item.occasion}</p>}
        {item.targetDate && <p>Target Date: {item.targetDate}</p>}
        <p>Offers: {item.consent ? 'Enabled' : 'Disabled'}</p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline">Edit</Button>
          <Button variant="outline">Share</Button>
          <Button variant="destructive">Remove</Button>
        </div>
      </CardContent>
    </Card>
  );
};
