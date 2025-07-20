import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { popularStocks, searchStocks } from "@/data/stocks";

interface StockComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function StockCombobox({
  value,
  onValueChange,
  placeholder = "Search stocks...",
  className,
}: StockComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedStock = popularStocks.find(
    (stock) => stock.symbol.toLowerCase() === value?.toLowerCase()
  );

  const filteredStocks = searchQuery
    ? searchStocks(searchQuery)
    : popularStocks.slice(0, 50); // Show top 50 by default

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedStock ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-blue-600">
                {selectedStock.symbol}
              </span>
              <span className="text-gray-600 truncate">
                {selectedStock.name}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search by symbol or company name..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <CommandEmpty>No stocks found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredStocks.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  value={stock.symbol}
                  onSelect={(currentValue: string) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-blue-600 min-w-[60px]">
                      {stock.symbol}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.name}</span>
                      {stock.sector && (
                        <span className="text-xs text-gray-500">
                          {stock.sector}
                        </span>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value?.toLowerCase() === stock.symbol.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
