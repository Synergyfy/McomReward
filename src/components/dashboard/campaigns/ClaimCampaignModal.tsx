
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { templateCampaigns, CampaignTemplate } from '@/lib/mock-data/template-campaigns';

interface ClaimCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CampaignTemplate) => void;
  onCreateFromScratch: () => void;
}

export default function ClaimCampaignModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateFromScratch,
}: ClaimCampaignModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create a New Campaign</DialogTitle>
          <DialogDescription>
            Select a ready-to-use template or build one from scratch to engage your customers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateCampaigns.map((template) => (
                <Card key={template.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative w-full h-32">
                      <Image
                        src={template.imageUrl}
                        alt={template.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <h4 className="font-bold">{template.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 h-12 overflow-hidden">{template.description}</p>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onSelectTemplate(template)}
                    >
                      Select & Customize
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">Or Start Fresh</h3>
            <p className="text-sm text-gray-500 my-2">
              Have a specific idea? Upgrade to our White-Label plan for full creative control.
            </p>
            <Button onClick={onCreateFromScratch}>
              Create a Campaign from Scratch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
