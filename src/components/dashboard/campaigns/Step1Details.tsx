'use client';

import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Step1DetailsProps {
  title: string;
  description: string;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  error?: string;
}

export default function Step1Details({ title, description, setTitle, setDescription, error }: Step1DetailsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Campaign Details</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Campaign Title
          </label>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Sale"
                  required
                  className={error && !title.trim() ? 'border-red-500' : ''}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>The main title of your campaign.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {error && !title.trim() && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Campaign Description
          </label>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Get 20% off all summer items"
                  required
                  className={error && !description.trim() ? 'border-red-500' : ''}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>A brief description of what your campaign offers.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {error && !description.trim() && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
