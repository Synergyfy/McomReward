'use client';

import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const inputBase =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:shadow-none';
export const inputNormal = 'border-gray-300 focus:border-blue-500';
export const inputError =
  'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/30';

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={text}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[280px] text-xs font-normal leading-relaxed"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export function FieldLabel({
  htmlFor,
  label,
  required,
  tooltip,
  hint,
  trailing,
}: {
  htmlFor?: string;
  label: string;
  required: boolean;
  tooltip?: string;
  hint?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <label htmlFor={htmlFor} className="text-sm font-medium text-gray-900">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
          {tooltip && <InfoTip text={tooltip} />}
        </div>
        {trailing}
      </div>
      {hint && (
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{hint}</p>
      )}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-1.5 flex items-start gap-1 text-xs font-medium text-red-600"
      role="alert"
    >
      <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0" />
      {message}
    </p>
  );
}
