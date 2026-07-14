"use client"

import * as React from 'react';
import Select, { components, OptionProps, SingleValueProps } from 'react-select';
import type { SingleValue } from 'react-select';
import { useGetSectors } from '@/services/business/hook';
import Image from 'next/image';

interface SectorOption {
  value: string;
  label: string;
  imageUrl: string | null;
}

interface SectorSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const { Option, SingleValue } = components;

const IconOption = (props: OptionProps<SectorOption>) => (
  <Option {...props}>
    <div className="flex items-center">
      <Image src={props.data.imageUrl || '/placeholder.png'} alt={props.data.label} className="w-6 h-6 mr-2 rounded-full" width={24} height={24} />
      {props.data.label}
    </div>
  </Option>
);

const IconSingleValue = (props: SingleValueProps<SectorOption>) => (
  <SingleValue {...props}>
    <div className="flex items-center">
      <Image src={props.data.imageUrl || '/placeholder.png'} alt={props.data.label} className="w-6 h-6 mr-2 rounded-full" width={24} height={24} />
      {props.data.label}
    </div>
  </SingleValue>
);

export function SectorSelect({ value, onChange }: SectorSelectProps) {
  const { data: sectors, isLoading } = useGetSectors();

  const options: SectorOption[] = sectors
    ? sectors.map(sector => ({
        value: sector.id,
        label: sector.name,
        imageUrl: sector.imageUrl,
      }))
    : [];

  const selectedOption = options.find(option => option.value === value);

  return (
    <Select<SectorOption>
      value={selectedOption}
      onChange={(option) => onChange(option ? option.value : '')}
      options={options}
      isLoading={isLoading}
      components={{ Option: IconOption, SingleValue: IconSingleValue }}
      placeholder="Search and select a sector..."
      isClearable
    />
  );
}
