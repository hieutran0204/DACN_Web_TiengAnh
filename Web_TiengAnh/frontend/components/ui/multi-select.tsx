// src/components/ui/multi-select.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxCount?: number; // THÊM
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Chọn...",
  disabled = false,
  maxCount,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string) => {
    if (disabled || (maxCount && selected.length >= maxCount && !selected.includes(value))) return;
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between" disabled={disabled}>
          {selected.length > 0
            ? `${selected.length} đã chọn${maxCount ? `/${maxCount}` : ""}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Tìm..." />
          <CommandEmpty>Không tìm thấy.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((opt) => (
              <CommandItem key={opt.value} onSelect={() => toggle(opt.value)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(opt.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}