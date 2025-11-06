'use client';

import { useState, ReactNode } from 'react';
import { Upload, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BrandingManager() {
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#F97316');
  const [secondaryColor, setSecondaryColor] = useState('#4B5563');

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Branding Kit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Logo & Favicon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Uploader title="Company Logo" icon={<Upload />} onFileSelect={setLogo} />
          <Uploader title="Favicon" icon={<Upload />} onFileSelect={setFavicon} />
        </div>

        {/* Color Palette */}
        <div>
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <Palette className="mr-2" /> Color Palette
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker label="Primary Color" color={primaryColor} setColor={setPrimaryColor} />
            <ColorPicker label="Secondary Color" color={secondaryColor} setColor={setSecondaryColor} />
          </div>
        </div>

        {/* Fonts (Simulated) */}
        <div>
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <Type className="mr-2" /> Fonts
          </h3>
          <Uploader title="Upload Font Files (e.g., .woff, .woff2)" icon={<Upload />} onFileSelect={() => {}} />
        </div>

        {/* Promotional Assets */}
        <div>
          <h3 className="text-lg font-semibold flex items-center mb-2">
            <ImageIcon className="mr-2" /> Promotional Assets
          </h3>
          <Uploader title="Upload Banners or Images" icon={<Upload />} onFileSelect={() => {}} multiple />
        </div>
      </CardContent>
    </Card>
  );
}

interface UploaderProps {
  title: string;
  icon: ReactNode;
  onFileSelect: (file: File | null) => void;
  multiple?: boolean;
}

const Uploader = ({ title, icon, onFileSelect, multiple = false }: UploaderProps) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
    <div className="flex justify-center items-center mb-2 text-gray-400">{icon}</div>
    <p className="text-sm text-gray-600 mb-2">{title}</p>
    <Button variant="outline" size="sm" onClick={() => document.getElementById(multiple ? 'multi-file-upload' : 'file-upload')?.click()}>
      Browse Files
    </Button>
    <input type="file" id={multiple ? 'multi-file-upload' : 'file-upload'} multiple={multiple} className="hidden" />
  </div>
);

interface ColorPickerProps {
  label: string;
  color: string;
  setColor: (color: string) => void;
}

const ColorPicker = ({ label, color, setColor }: ColorPickerProps) => (
  <div className="flex items-center gap-4">
    <label className="font-medium">{label}</label>
    <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-12 p-1" />
    <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-32" />
  </div>
);
