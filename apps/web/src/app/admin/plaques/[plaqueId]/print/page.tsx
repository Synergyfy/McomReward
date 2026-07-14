'use client';

import React, { useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Printer, Download } from 'lucide-react';
import { mockPlaques } from '@/lib/mock-data/plaques';
import { notFound } from 'next/navigation';
import html2canvas from 'html2canvas'; // For downloading as image

interface PlaquePrintViewPageProps {
  params: Promise<{
    plaqueId: string;
  }>;
}

export default function PlaquePrintViewPage({ params }: PlaquePrintViewPageProps) {
  const { plaqueId } = use(params);
  const plaque = mockPlaques.find(p => p.id === plaqueId);
  const printRef = useRef<HTMLDivElement>(null);

  if (!plaque) {
    notFound();
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (printRef.current) {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Increase scale for better quality
        useCORS: true, // If QR code is from external source
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `plaque-${plaque.id}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Print View: {plaque.name}</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Plaque</Button>
          <Button onClick={handleDownloadImage}><Download className="mr-2 h-4 w-4" /> Download as PNG</Button>
        </div>
      </div>

      <div ref={printRef} className="bg-white p-8 border rounded-lg shadow-lg text-center space-y-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800">{plaque.name}</h2>
        <p className="text-muted-foreground text-sm">Plaque ID: {plaque.id}</p>
        <p className="text-muted-foreground text-sm">Owner: {plaque.ownerName}</p>
        <p className="text-muted-foreground text-sm">Group: {plaque.groupName}</p>

        <div className="flex justify-center">
          <img src={plaque.qrCodeData} alt={`QR Code for ${plaque.name}`} className="w-64 h-64 border-4 border-gray-300 p-2 bg-white" />
        </div>

        <p className="text-sm text-gray-600 mt-4">Scan this QR code to interact.</p>
      </div>
    </div>
  );
}
