'use client';

import { useState, useEffect } from 'react';
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
import { WishlistItem } from '@/components/customer/wishlist/WishlistItemCard';
import { motion, AnimatePresence } from 'framer-motion';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<WishlistItem, 'id'> | WishlistItem) => void;
  itemToEdit?: WishlistItem;
  itemName?: string;
}

export const WishlistModal = ({ isOpen, onClose, onSave, itemToEdit, itemName }: WishlistModalProps) => {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [wishlistFor, setWishlistFor] = useState<'myself' | 'friend' | 'family' | ''>(itemToEdit ? 'myself' : '');
  const [relationship, setRelationship] = useState('');
  const [notify, setNotify] = useState<'yes' | 'no' | ''>('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | ''>('');
  const [contactValue, setContactValue] = useState('');

  // Step 2 state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [occasion, setOccasion] = useState('None');
  const [season, setSeason] = useState('None');
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        setCategory(itemToEdit.category);
        setPriority(itemToEdit.priority);
        setConsent(itemToEdit.consent);
        setOccasion(itemToEdit.occasion || 'None');
        setTargetDate(itemToEdit.targetDate ? new Date(itemToEdit.targetDate) : undefined);
        setStep(2); // If editing, go straight to step 2
        setWishlistFor('myself');
      } else {
        // Reset for new item
        setName(itemName || '');
        setCategory('Food');
        setPriority('Medium');
        setConsent(false);
        setOccasion('None');
        setTargetDate(undefined);
        setStep(1);
        setWishlistFor('');
        setRelationship('');
        setNotify('');
        setContactMethod('');
        setContactValue('');
      }
    }
  }, [itemToEdit, itemName, isOpen]);

  const handleWishlistForChange = (value: 'myself' | 'friend' | 'family') => {
    setWishlistFor(value);
    if (value === 'myself') {
      setStep(2);
    } else {
      // Reset subsequent choices if user changes from friend/family
      setRelationship('');
      setNotify('');
      setContactMethod('');
      setContactValue('');
    }
  };

  const handleNotifyChange = (value: 'yes' | 'no') => {
    setNotify(value);
    if (value === 'no') {
      setStep(2);
    }
    setContactMethod('');
    setContactValue('');
  };

  const handleContactMethodChange = (value: 'email' | 'phone') => {
    setContactMethod(value);
    setContactValue('');
  };

  const handleConfirmContact = () => {
    // Basic validation
    if (contactMethod === 'email' && !contactValue.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    if (contactMethod === 'phone' && contactValue.length < 10) {
      alert('Please enter a valid phone number.');
      return;
    }
    setStep(2);
  };

  const handleSave = () => {
    const newItem: Omit<WishlistItem, 'id'> | WishlistItem = {
      ...(itemToEdit || {}),
      name,
      category,
      priority,
      consent,
      occasion,
      targetDate: targetDate?.toISOString(),
    };
    onSave(newItem);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
  };

  const renderStep1 = () => (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle>Create a new Wishlist</DialogTitle>
        <DialogDescription>
          Tell us a bit more about who this wishlist is for.
        </DialogDescription>
      </DialogHeader>
      <motion.div layout className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wishlistFor">Who is this wishlist for?</Label>
          <Select onValueChange={handleWishlistForChange} value={wishlistFor}>
            <SelectTrigger id="wishlistFor">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="myself">Myself</SelectItem>
              <SelectItem value="friend">A Friend</SelectItem>
              <SelectItem value="family">A Family Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence>
          {wishlistFor === 'family' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-2">
                <Label htmlFor="relationship">What is your relationship?</Label>
                <Select onValueChange={setRelationship} value={relationship}>
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select a relationship" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="spouse">Spouse (Wife/Husband)</SelectItem>
                    <SelectItem value="distant-relative">Distant Relative</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(wishlistFor === 'friend' || (wishlistFor === 'family' && relationship !== '')) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-2">
                <Label>Do you want to let them know?</Label>
                <RadioGroup onValueChange={handleNotifyChange} value={notify} className="flex space-x-4 py-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="notify-yes" />
                    <Label htmlFor="notify-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="notify-no" />
                    <Label htmlFor="notify-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {notify === 'yes' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-2">
                <Label>How should we notify them?</Label>
                <RadioGroup onValueChange={handleContactMethodChange} value={contactMethod} className="flex space-x-4 py-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="contact-email" />
                    <Label htmlFor="contact-email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="contact-phone" />
                    <Label htmlFor="contact-phone">Phone</Label>
                  </div>
                </RadioGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {contactMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-2">
                <Label htmlFor="contactValue">{contactMethod === 'email' ? "Friend's Email" : "Friend's Phone"}</Label>
                <Input
                  id="contactValue"
                  type={contactMethod === 'email' ? 'email' : 'tel'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={contactMethod === 'email' ? 'friend@example.com' : '+1234567890'}
                />
              </div>
              <Button onClick={handleConfirmContact} className="w-full">Confirm</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </DialogFooter>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle>{itemToEdit ? 'Edit Wishlist Item' : 'Save to Wishlist'}</DialogTitle>
        <DialogDescription>
          {itemToEdit ? 'Update the details of your wishlist item.' : 'Add this item to your wishlist to get updates and special offers.'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
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
            <SelectContent className="z-[9999]">
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
            <SelectContent className="z-[9999]">
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
          <RadioGroup defaultValue={priority} onValueChange={(v) => setPriority(v as 'Low' | 'Medium' | 'High')} className="flex space-x-4 py-2">
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
        {!itemToEdit && <Button variant="outline" onClick={handleBack}>Back</Button>}
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save to Wishlist</Button>
      </DialogFooter>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 1 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 1 ? 50 : -50 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 ? renderStep1() : renderStep2()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};