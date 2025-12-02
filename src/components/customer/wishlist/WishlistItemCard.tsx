"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Gift, Share2, Trash2, Edit2, Megaphone, BellRing } from 'lucide-react';
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  occasion?: string;
  targetDate?: string;
  consent: boolean;
  imageUrl?: string;
  // Extended properties
  isForThirdParty?: boolean;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  relationship?: 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'HUSBAND' | 'WIFE' | 'OTHERS';
}

interface WishlistItemCardProps {
  item: WishlistItem;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export const WishlistItemCard = ({ item, onEdit, onDelete, onShare }: WishlistItemCardProps) => {
  const priorityColors = {
    Low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
    Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
    High: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="group relative overflow-hidden flex flex-col h-full border-0 shadow-md hover:shadow-2xl transition-all duration-300 bg-white dark:bg-zinc-950 ring-1 ring-gray-200 dark:ring-zinc-800 rounded-xl p-0 gap-0">

      {/* Image / Header Section */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-zinc-900 w-full">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 flex items-center justify-center">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            <Gift className="h-16 w-16 text-white drop-shadow-lg relative z-10" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
           <Badge variant="secondary" className="backdrop-blur-md bg-white/90 dark:bg-black/60 shadow-sm font-medium hover:bg-white/100">
             {item.category}
           </Badge>
           <Badge variant="outline" className={cn("backdrop-blur-md shadow-sm border font-semibold", priorityColors[item.priority])}>
             {item.priority}
           </Badge>
        </div>
      </div>

      <CardContent className="flex-1 p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          {item.occasion && (
             <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
               <Gift className="h-3.5 w-3.5" />
               For <span className="font-medium text-foreground">{item.occasion}</span>
             </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
            {item.targetDate && (
              <div className="flex flex-col gap-1 rounded-lg bg-gray-50 dark:bg-zinc-900 p-2.5 text-xs border border-gray-100 dark:border-zinc-800">
                 <span className="text-muted-foreground flex items-center gap-1.5 font-medium"><CalendarIcon className="h-3.5 w-3.5" /> Target Date</span>
                 <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{formatDate(item.targetDate)}</span>
              </div>
            )}
            <div className={cn("flex flex-col gap-1 rounded-lg bg-gray-50 dark:bg-zinc-900 p-2.5 text-xs border border-gray-100 dark:border-zinc-800", !item.targetDate && "col-span-2")}>
                 <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    {item.consent ? <Megaphone className="h-3.5 w-3.5 text-primary" /> : <BellRing className="h-3.5 w-3.5 text-gray-400" />}
                    Marketing Offers
                 </span>
                 <span className={cn("text-sm font-semibold", item.consent ? "text-primary" : "text-gray-500")}>
                    {item.consent ? "Enabled" : "Disabled"}
                 </span>
            </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center gap-2 mt-auto">
         <div className="flex gap-1">
             <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-9 w-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-full transition-colors">
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit</span>
             </Button>
             <Button variant="ghost" size="icon" onClick={() => onShare(item.id)} className="h-9 w-9 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-full transition-colors">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
             </Button>
         </div>
         <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 px-3 rounded-full transition-colors">
            <Trash2 className="h-4 w-4" />
            <span className="text-xs font-medium">Remove</span>
         </Button>
      </CardFooter>
    </Card>
  );
};
