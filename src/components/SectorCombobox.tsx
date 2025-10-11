"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGetSectors } from "@/services/business/hook"
import { Sector } from "@/services/business/types"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface SectorComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SectorCombobox({ value, onChange }: SectorComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { data: sectors, isLoading } = useGetSectors();

  const selectedSector = sectors?.find((sector) => sector.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedSector ? (
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={selectedSector.imageUrl} alt={selectedSector.name} />
                <AvatarFallback>{selectedSector.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {selectedSector.name}
            </div>
          ) : (
            "Select sector..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search sector..." />
          <CommandList>
            {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
            <CommandEmpty>No sector found.</CommandEmpty>
            <CommandGroup>
              {sectors?.map((sector) => (
                <CommandItem
                  key={sector.id}
                  value={sector.id}
                  onSelect={(currentValue) => {
                    const selected = sectors?.find(s => s.id.toLowerCase() === currentValue);
                    if (selected) {
                      onChange(selected.id === value ? "" : selected.id);
                    }
                    setOpen(false);
                  }}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={sector.imageUrl} alt={sector.name} />
                    <AvatarFallback>{sector.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {sector.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === sector.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
