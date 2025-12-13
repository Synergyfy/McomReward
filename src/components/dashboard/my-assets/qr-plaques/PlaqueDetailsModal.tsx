import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlaquePreview } from '@/components/plaque/PlaquePreview';
import { Printer, Download, X } from 'lucide-react';

interface PlaqueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plaque: any; // Using any to match the loose type in the page, ideally defined shared interface
  onPrint: (plaque: any) => void;
}

export default function PlaqueDetailsModal({ isOpen, onClose, plaque, onPrint }: PlaqueDetailsModalProps) {
  if (!plaque) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Plaque Details: {plaque.partner || plaque.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
           {/* The Card Display */}
           <div className="transform scale-100 origin-top">
              <PlaquePreview
                  actionText={plaque.actionText || "SCAN HERE"}
                  description={plaque.description || "FOR PAYMENT"}
                  extraInfo={plaque.extraInfo || ""}
                  qrCodeUrl={plaque.qrCodeUrl || ""}
                  className="shadow-2xl"
              />
           </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between items-center w-full mt-4 border-t pt-4">
            <div className="text-sm text-gray-500">
                Status: <span className="font-medium text-gray-900">{plaque.status}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
                <Button onClick={() => onPrint(plaque)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Plaque
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
