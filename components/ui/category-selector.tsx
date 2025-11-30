"use client";



import { useRouter } from "next/navigation";
import React, { useState } from "react";


import { Popover, PopoverContent, PopoverTrigger } from "./popover";


import { Button } from "./button";


import { Check, ChevronsUpDown } from "lucide-react";


import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";


import { cn } from "@/lib/utils";



const CategorySelector = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >

          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search category..."
            className="h-9"

          />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
             
                <CommandItem
                  onSelect={() => {
                  
                    router.push(`/categories/`);
                    setOpen(false);
                  }}
                >
                  
                  <Check
                    className={cn(
                      "ml-auto",
                        "opacity-0"
                    )}
                  />
                </CommandItem>
        
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;