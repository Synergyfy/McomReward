'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTier, useUpdateTier } from '@/services/financials';
import { Tier } from '@/services/financials/types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface AddEditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Tier;
  onSave: (plan: Tier) => void;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditPlanModal({ isOpen, onClose, initialData, onSave, onShowFeedback }: AddEditPlanModalProps) {
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [annualPrice, setAnnualPrice] = useState('');
  const [quaterlyPrice, setQuaterlyPrice] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);

  const createTierMutation = useCreateTier();
  const updateTierMutation = useUpdateTier();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setMonthlyPrice(initialData.monthlyPrice);
      setQuaterlyPrice(initialData.quaterlyPrice ?? '');
      setAnnualPrice(initialData.annualPrice);
      setFeatures(initialData.features.length > 0 ? initialData.features : ['']);
    } else {
      setName('');
      setMonthlyPrice('');
      setQuaterlyPrice('');
      setAnnualPrice('');
      setFeatures(['']);
    }
  }, [initialData, isOpen]);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const planData = {
      name,
      monthly_price: parseFloat(monthlyPrice),
      quaterly_price: parseFloat(quaterlyPrice),
      annual_price: parseFloat(annualPrice),
      features: features.filter(f => f.trim() !== ''),
    };

    try {
      let savedPlan;
      if (initialData) {
        savedPlan = await updateTierMutation.mutateAsync({ ...planData, id: initialData.id });
      } else {
        savedPlan = await createTierMutation.mutateAsync(planData);
      }
      onSave(savedPlan);
      onClose();
    } catch (error) {
      onShowFeedback('Error', 'There was an error saving the plan.', 'OK');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Subscription Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthlyPrice">Monthly Price</Label>
              <Input id="monthlyPrice" type="number" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="quaterlyPrice">Quarterly Price</Label>
              <Input id="quaterlyPrice" type="number" value={quaterlyPrice} onChange={(e) => setQuaterlyPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="annualPrice">Annual Price</Label>
              <Input id="annualPrice" type="number" value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Features</Label>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} />
                <Button variant="destructive" size="icon" onClick={() => removeFeature(index)} disabled={features.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addFeature}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Feature
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createTierMutation.isPending || updateTierMutation.isPending}>
            {createTierMutation.isPending || updateTierMutation.isPending ? 'Saving...' : 'Save Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}