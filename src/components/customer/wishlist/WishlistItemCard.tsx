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
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export const WishlistItemCard = ({ item, onEdit, onDelete, onShare }: WishlistItemCardProps) => {
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
          <Button variant="outline" onClick={() => onEdit(item)}>Edit</Button>
          <Button variant="outline" onClick={() => onShare(item.id)}>Share</Button>
          <Button variant="destructive" onClick={() => onDelete(item.id)}>Remove</Button>
        </div>
      </CardContent>
    </Card>
  );
};
