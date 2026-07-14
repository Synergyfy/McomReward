'use client';

import { useState, ReactNode } from 'react';
import { Upload, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { CloudinaryMultiUpload } from '@/components/ui/CloudinaryMultiUpload';

export default function BrandingManager() {
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#F97316');
  const [secondaryColor, setSecondaryColor] = useState('#4B5563');

  return (
    <Card className="mt-8 border-none shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Branding Kit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-10">
        {/* Logo & Favicon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Company Logo
            </h3>
            <CloudinaryUpload
              onChange={setLogo}
              className="aspect-video w-full"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Favicon
            </h3>
            <CloudinaryUpload
              onChange={setFavicon}
              className="aspect-square w-32"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <Palette className="w-5 h-5 text-primary" /> Color Palette
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ColorPicker label="Primary Color" color={primaryColor} setColor={setPrimaryColor} />
            <ColorPicker label="Secondary Color" color={secondaryColor} setColor={setSecondaryColor} />
          </div>
        </div>

        {/* Promotional Assets */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <ImageIcon className="w-5 h-5 text-primary" /> Promotional Assets
          </h3>
          <CloudinaryMultiUpload
            onChange={() => { }}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface ColorPickerProps {
  label: string;
  color: string;
  setColor: (color: string) => void;
}

const ColorPicker = ({ label, color, setColor }: ColorPickerProps) => (
  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
    <label className="text-xs font-black uppercase tracking-wider text-gray-500 group-hover:text-primary transition-colors">
      {label}
    </label>
    <div className="flex items-center gap-4">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
        />
      </div>
      <Input
        type="text"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="flex-1 h-12 bg-white border-gray-200 rounded-xl font-mono font-bold text-gray-600 focus:ring-primary/20"
      />
    </div>
  </div>
);

