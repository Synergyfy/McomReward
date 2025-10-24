'use client';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Step2DatesProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  error?: string;
}

export default function Step2Dates({ startDate, endDate, setStartDate, setEndDate, error }: Step2DatesProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Campaign Dates</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Start Date
          </label>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                        error && !startDate ? 'border-red-500' : ''
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>The date when your campaign will begin.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {error && !startDate && <p className="text-red-500 text-sm mt-1">Start Date is required.</p>}
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            End Date
          </label>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                        error && !endDate ? 'border-red-500' : ''
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>The date when your campaign will end.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {error && !endDate && <p className="text-red-500 text-sm mt-1">End Date is required.</p>}
          {error && (startDate && endDate && startDate > endDate) && <p className="text-red-500 text-sm mt-1">End Date cannot be before Start Date.</p>}
        </div>
      </div>
    </div>
  );
}
