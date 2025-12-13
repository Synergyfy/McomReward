import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PlaquePreviewProps {
  actionText: string;
  description: string;
  extraInfo?: string;
  qrCodeUrl: string;
  className?: string;
}

export const PlaquePreview = React.forwardRef<HTMLDivElement, PlaquePreviewProps>(
  ({ actionText, description, extraInfo, qrCodeUrl, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-sm mx-auto aspect-[3/4] bg-pink-200 rounded-lg shadow-xl border-t-4 border-pink-300 flex flex-col items-center justify-between p-8 text-center",
          className
        )}
        style={{
          backgroundColor: '#FADADD', // Light pink color similar to the sample
        }}
      >
        <div className="flex-1 flex flex-col justify-center w-full space-y-6">
          {/* Action Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-widest text-gray-800 uppercase">
              {actionText || "SCAN HERE"}
            </h2>
            <h3 className="text-lg font-semibold tracking-wider text-gray-800 uppercase">
              {description || "FOR PAYMENT"}
            </h3>
          </div>

          <div className="w-16 h-0.5 bg-gray-800 mx-auto opacity-50" />

          {/* QR Code Area */}
          <div className="relative w-48 h-48 bg-white rounded-lg shadow-inner mx-auto p-4 flex items-center justify-center border-2 border-white">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400 text-sm font-medium">
                QR CODE
              </div>
            )}
          </div>
        </div>

        {/* Footer / Extra Info */}
        <div className="mt-6 text-xs text-gray-600 font-medium max-w-[80%]">
          {extraInfo || "Please check the amount before finalizing."}
        </div>
      </div>
    );
  }
);

PlaquePreview.displayName = "PlaquePreview";
