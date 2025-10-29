"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

export const WishlistButton = ({ onClick }: WishlistButtonProps) => {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <Heart className="h-6 w-6 text-white" />
    </Button>
  );
};
