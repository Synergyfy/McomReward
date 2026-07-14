'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import DateTimePicker from "@/components/dashboard/campaigns/datePicker";

interface WelcomeWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeWishlistModal = ({ isOpen, onClose }: WelcomeWishlistModalProps) => {
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('None');
  const [season, setSeason] = useState('None');
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState('Medium');
  const [consent, setConsent] = useState(false);

  const handleSave = () => {
    // Mock save logic
    console.log({ name, occasion, season, targetDate, priority, consent });
    // In a real app, you'd save this to a database
    onClose(); // Close the modal after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tell Us Your Wishlists</DialogTitle>
          <DialogDescription>
            Fill the short form below to add your wishlists.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <p className="text-xs text-gray-500">The name of the item you&apos;re wishing for.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Select onValueChange={setOccasion} defaultValue={occasion}>
              <SelectTrigger>
                <SelectValue placeholder="Select an occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Birthday">Birthday</SelectItem>
                <SelectItem value="Anniversary">Anniversary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Is this for a special occasion?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="season">Season</Label>
            <Select onValueChange={setSeason} defaultValue={season}>
              <SelectTrigger>
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Autumn">Autumn</SelectItem>
                <SelectItem value="Winter">Winter</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Optionally, select a season.</p>
          </div>
          <div className="space-y-2">
            <Label>Target Date</Label>
            <DateTimePicker date={targetDate} setDate={setTargetDate} />
            <p className="text-xs text-gray-500">An ideal date to get this item or offers for it.</p>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup defaultValue={priority} onValueChange={setPriority} className="flex space-x-4 py-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Low" id="p1" />
                <Label htmlFor="p1">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Medium" id="p2" />
                <Label htmlFor="p2">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="High" id="p3" />
                <Label htmlFor="p3">High</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-500">How much do you want this item?</p>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(Boolean(checked))} />
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Yes — I want to receive offers related to this item
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save to Wishlist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
