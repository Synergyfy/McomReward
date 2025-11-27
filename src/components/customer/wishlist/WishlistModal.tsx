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
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import Image from 'next/image';
import { useGetCategories } from '@/services/wishlist/hook';
import { Category } from '@/services/wishlist/types';
// import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface WishlistFormValues {
  id?: string;
  name: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  occasion?: string;
  targetDate?: string;
  consent: boolean;
  imageUrl?: string;
  isForThirdParty: boolean;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  relationship?: 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'HUSBAND' | 'WIFE' | 'OTHERS';
}

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: WishlistFormValues) => void;
  itemToEdit?: WishlistItem;
  itemName?: string;
}

export const WishlistModal = ({ isOpen, onClose, onSave, itemToEdit, itemName }: WishlistModalProps) => {
  const [step, setStep] = useState(1);
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();

  // Step 1 state (Who is it for?)
  const [wishlistFor, setWishlistFor] = useState<'myself' | 'friend' | 'family' | ''>(itemToEdit ? 'myself' : '');
  const [myEmail, setMyEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');
  const [contactMethods, setContactMethods] = useState({ email: false, phone: false });
  const [friendEmail, setFriendEmail] = useState('');
  const [friendPhone, setFriendPhone] = useState('');

  // Step 2 state (Item Basic Details)
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [uploadOrLink, setUploadOrLink] = useState<'upload' | 'link' | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Step 3 state (Item Preference Details)
  const [occasion, setOccasion] = useState('None');
  const [season, setSeason] = useState('None');
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [consent, setConsent] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        if (categories) {
          const matchedCategory = categories.find(c => c.name === itemToEdit.category);
          if (matchedCategory) {
            setCategoryId(matchedCategory.id);
          }
        }

        setPriority(itemToEdit.priority);
        setConsent(itemToEdit.consent);
        setOccasion(itemToEdit.occasion || 'None');
        setTargetDate(itemToEdit.targetDate ? new Date(itemToEdit.targetDate) : undefined);
        setImagePreviewUrl(itemToEdit.imageUrl || null);
        setStep(2);
        setWishlistFor('myself');
      } else {
        setName(itemName || '');
        setCategoryId('');
        setPriority('Medium');
        setConsent(false);
        setOccasion('None');
        setTargetDate(undefined);
        setStep(1);
        setWishlistFor('');
        setMyEmail('');
        setFriendName('');
        setRelationship('');
        setCustomRelationship('');
        setContactMethods({ email: false, phone: false });
        setFriendEmail('');
        setFriendPhone('');
        setUploadOrLink('');
        setImageUrl('');
        setSelectedFile(null);
        setImagePreviewUrl(null);
      }
    }
  }, [itemToEdit, itemName, isOpen, categories]);

  const handleFileSelect = (file: File | null, previewUrl: string | null) => {
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleWishlistForChange = (value: 'myself' | 'friend' | 'family') => {
    setWishlistFor(value);
    setMyEmail('');
    setFriendName('');
    setRelationship('');
    setCustomRelationship('');
    setContactMethods({ email: false, phone: false });
    setFriendEmail('');
    setFriendPhone('');
  };

  const handleRelationshipChange = (value: string) => {
    setRelationship(value);
    if (value !== 'other') {
      setCustomRelationship('');
    }
  };

  const handleContactMethodChange = (method: 'email' | 'phone') => {
    setContactMethods(prev => ({ ...prev, [method]: !prev[method] }));
  };

  useEffect(() => {
    if (targetDate) {
      const month = targetDate.getMonth();
      // Seasons based on meteorological definition
      if (month >= 2 && month <= 4) { // Mar, Apr, May
        setSeason('Spring');
      } else if (month >= 5 && month <= 7) { // Jun, Jul, Aug
        setSeason('Summer');
      } else if (month >= 8 && month <= 10) { // Sep, Oct, Nov
        setSeason('Autumn');
      } else {
        setSeason('Winter');
      }
    } else {
      setSeason('None');
    }
  }, [targetDate]);

  const handleConfirmMyEmail = () => {
    if (!myEmail.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    setStep(2);
  };

  const handleConfirmContact = () => {
    if (contactMethods.email && !friendEmail.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    if (contactMethods.phone && friendPhone.length < 10) {
      alert('Please enter a valid phone number.');
      return;
    }
    setStep(2);
  };

  const handleConfirmStep2 = () => {
    if (!name) {
      alert("Please enter item name.");
      return;
    }
    if (!categoryId) {
      alert("Please select a category.");
      return;
    }
    setStep(3);
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Using the same server-side proxy route pattern as seen in SectorDialog
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/wishlist', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    let finalImageUrl = imageUrl;

    // Logic aligned with SectorDialog: if file is selected and is a blob (preview), upload it
    if (uploadOrLink === 'upload' && selectedFile) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadToCloudinary(selectedFile);
      } catch (error) {
        toast.error("Failed to upload image. Please try again or use a link.");
        console.error(error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (uploadOrLink === 'link') {
      finalImageUrl = imageUrl;
    } else {
      finalImageUrl = imagePreviewUrl || ''; // Fallback if editing and existing image
    }

    let finalRelationship: WishlistFormValues['relationship'] = undefined;
    if (wishlistFor === 'family') {
      if (relationship === 'other') {
        finalRelationship = 'OTHERS';
      } else {
        // Ensure the value is one of the allowed types. 
        // The select values are lowercase, so we uppercase them.
        const upper = relationship.toUpperCase();
        if (['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'HUSBAND', 'WIFE', 'OTHERS'].includes(upper)) {
          finalRelationship = upper as WishlistFormValues['relationship'];
        } else {
          finalRelationship = 'OTHERS';
        }
      }
    } else if (wishlistFor === 'friend') {
      finalRelationship = 'OTHERS';
    }

    const newItem: WishlistFormValues = {
      ...(itemToEdit || {}),
      name,
      category: categoryId,
      priority,
      consent,
      occasion,
      targetDate: targetDate?.toISOString(),
      imageUrl: finalImageUrl || undefined,

      isForThirdParty: wishlistFor !== 'myself',
      recipientName: wishlistFor === 'myself' ? undefined : (wishlistFor === 'friend' ? friendName : 'Family Member'),
      recipientEmail: wishlistFor === 'myself' ? myEmail : (contactMethods.email ? friendEmail : undefined),
      recipientPhone: wishlistFor !== 'myself' && contactMethods.phone ? friendPhone : undefined,
      relationship: finalRelationship,
    };
    onSave(newItem);
    onClose();
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
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
          {wishlistFor === 'myself' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              <div className="space-y-2">
                <Label htmlFor="myEmail">Your Email</Label>
                <Input id="myEmail" type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <Button onClick={handleConfirmMyEmail} className="w-full">Continue</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wishlistFor === 'friend' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              <div className="space-y-2">
                <Label htmlFor="friendName">Friend&apos;s Name</Label>
                <Input id="friendName" value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="Enter friend&apos;s name" />
              </div>
              <div className="space-y-2">
                <Label>Enter Their Contacts:</Label>
                <div className="flex space-x-4 py-2">
                  <div className="flex items-center space-x-2"><Checkbox id="contact-email" checked={contactMethods.email} onCheckedChange={() => handleContactMethodChange('email')} /><Label htmlFor="contact-email">Email</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="contact-phone" checked={contactMethods.phone} onCheckedChange={() => handleContactMethodChange('phone')} /><Label htmlFor="contact-phone">Phone</Label></div>
                </div>
              </div>
              <AnimatePresence>
                {contactMethods.email && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                    <Label htmlFor="friendEmail">Friend&apos;s Email</Label>
                    <Input id="friendEmail" type="email" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} placeholder="friend@example.com" />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {contactMethods.phone && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                    <Label htmlFor="friendPhone">Friend&apos;s Phone</Label>
                    <Input id="friendPhone" type="tel" value={friendPhone} onChange={(e) => setFriendPhone(e.target.value)} placeholder="+1234567890" />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {(contactMethods.email || contactMethods.phone) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <Button onClick={handleConfirmContact} className="w-full">Confirm</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wishlistFor === 'family' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              <div className="space-y-2">
                <Label htmlFor="relationship">What is your relationship?</Label>
                <Select onValueChange={handleRelationshipChange} value={relationship}>
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select a relationship" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="brother">Brother</SelectItem>
                    <SelectItem value="sister">Sister</SelectItem>
                    <SelectItem value="husband">Husband</SelectItem>
                    <SelectItem value="wife">Wife</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AnimatePresence>
                {relationship === 'other' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                    <Label htmlFor="customRelationship">Please specify</Label>
                    <Input id="customRelationship" value={customRelationship} onChange={(e) => setCustomRelationship(e.target.value)} placeholder="e.g., Cousin, Uncle" />
                  </motion.div>
                )}
              </AnimatePresence>
              {((relationship !== '' && relationship !== 'other') || (relationship === 'other' && customRelationship !== '')) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <div className="space-y-2">
                    <Label>Enter Their Contacts:</Label>
                    <div className="flex space-x-4 py-2">
                      <div className="flex items-center space-x-2"><Checkbox id="contact-email" checked={contactMethods.email} onCheckedChange={() => handleContactMethodChange('email')} /><Label htmlFor="contact-email">Email</Label></div>
                      <div className="flex items-center space-x-2"><Checkbox id="contact-phone" checked={contactMethods.phone} onCheckedChange={() => handleContactMethodChange('phone')} /><Label htmlFor="contact-phone">Phone</Label></div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {contactMethods.email && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                        <Label htmlFor="friendEmail">Family Member&apos;s Email</Label>
                        <Input id="friendEmail" type="email" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} placeholder="relative@example.com" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {contactMethods.phone && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                        <Label htmlFor="friendPhone">Family Member&apos;s Phone</Label>
                        <Input id="friendPhone" type="tel" value={friendPhone} onChange={(e) => setFriendPhone(e.target.value)} placeholder="+1234567890" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {(contactMethods.email || contactMethods.phone) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                        <Button onClick={handleConfirmContact} className="w-full">Confirm</Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <DialogFooter>
        {!itemToEdit && <Button variant="outline" onClick={handleBack} disabled={true}>Back</Button>}
        <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
      </DialogFooter>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle>{itemToEdit ? 'Edit Wishlist Item - Details' : 'Add Item - Details'}</DialogTitle>
        <DialogDescription>
          Enter the basic details of the item.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vintage Leather Jacket" />
          <p className="text-xs text-gray-500">The name of the item you&apos;re wishing for.</p>
        </div>

        <div className="space-y-2">
          <Label>Item Image (Optional)</Label>
          <RadioGroup onValueChange={(v) => setUploadOrLink(v as 'upload' | 'link')} value={uploadOrLink} className="flex space-x-4 py-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upload" id="image-upload" />
              <Label htmlFor="image-upload">Upload Image</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="link" id="image-link" />
              <Label htmlFor="image-link">Paste Link</Label>
            </div>
          </RadioGroup>
        </div>

        <AnimatePresence>
          {uploadOrLink === 'upload' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <CloudinaryUpload onFileSelect={handleFileSelect} />
              <p className="text-xs text-gray-500">Upload an image of the item.</p>
            </motion.div>
          )}
          {uploadOrLink === 'link' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <Input
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreviewUrl(e.target.value);
                }}
              />
              <p className="text-xs text-gray-500">Paste a link to an image online.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {imagePreviewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium">Image Preview:</p>
            <div className="relative h-24 w-24 rounded-lg overflow-hidden mt-2 border">
              <Image src={imagePreviewUrl} alt="Preview" layout="fill" objectFit="cover" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          {isCategoriesLoading ? (
            <div className="text-sm text-gray-500">Loading categories...</div>
          ) : (
            <Select onValueChange={setCategoryId} value={categoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {categories?.map((cat: Category) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-gray-500">Select the category this item belongs to.</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleBack} disabled={isUploading}>Back</Button>
        <Button onClick={handleConfirmStep2}>Continue</Button>
      </DialogFooter>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle>{itemToEdit ? 'Edit Wishlist Item - Preferences' : 'Add Item - Preferences'}</DialogTitle>
        <DialogDescription>
          Set your preferences and priorities.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="occasion">Occasion</Label>
          <Select onValueChange={setOccasion} value={occasion}>
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
          <Label>Target Date</Label>
          <DateTimePicker date={targetDate} setDate={setTargetDate} />
          <p className="text-xs text-gray-500">An ideal date to get this item or offers for it.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="season">Season</Label>
          <Select onValueChange={setSeason} value={season}>
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
          <Label>Priority</Label>
          <RadioGroup defaultValue={priority} onValueChange={(v) => setPriority(v as 'Low' | 'Medium' | 'High')} className="flex space-x-4 py-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="Low" id="p1" /><Label htmlFor="p1">Low</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Medium" id="p2" /><Label htmlFor="p2">Medium</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="High" id="p3" /><Label htmlFor="p3">High</Label></div>
          </RadioGroup>
          <p className="text-xs text-gray-500">How much do you want this item?</p>
        </div>
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(Boolean(checked))} />
          <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Yes — I want to receive offers related to this item
          </label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleBack} disabled={isUploading}>Back</Button>
        <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
        <Button onClick={handleSave} disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? 'Uploading...' : 'Save to Wishlist'}
        </Button>
      </DialogFooter>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
