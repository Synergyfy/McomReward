'use client';

import { Input } from '@/components/ui/input';

interface Step1DetailsProps {
  title: string;
  description: string;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
}

export default function Step1Details({ title, description, setTitle, setDescription }: Step1DetailsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Campaign Details</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Campaign Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Sale"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Campaign Description
          </label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Get 20% off all summer items"
            required
          />
        </div>
      </div>
    </div>
  );
}
