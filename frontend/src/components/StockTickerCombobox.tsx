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
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Popular US stocks for demonstration
const popularStocks = [
  { value: "AAPL", label: "AAPL - Apple Inc." },
  { value: "MSFT", label: "MSFT - Microsoft Corporation" },
  { value: "GOOGL", label: "GOOGL - Alphabet Inc." },
  { value: "AMZN", label: "AMZN - Amazon.com Inc." },
  { value: "NVDA", label: "NVDA - NVIDIA Corporation" },
  { value: "TSLA", label: "TSLA - Tesla, Inc." },
  { value: "META", label: "META - Meta Platforms, Inc." },
  { value: "BRK.B", label: "BRK.B - Berkshire Hathaway Inc." },
  { value: "V", label: "V - Visa Inc." },
  { value: "JNJ", label: "JNJ - Johnson & Johnson" },
  { value: "WMT", label: "WMT - Walmart Inc." },
  { value: "JPM", label: "JPM - JPMorgan Chase & Co." },
  { value: "PG", label: "PG - Procter & Gamble Company" },
  { value: "UNH", label: "UNH - UnitedHealth Group Incorporated" },
  { value: "HD", label: "HD - The Home Depot, Inc." },
  { value: "MA", label: "MA - Mastercard Incorporated" },
  { value: "DIS", label: "DIS - The Walt Disney Company" },
  { value: "ADBE", label: "ADBE - Adobe Inc." },
  { value: "BAC", label: "BAC - Bank of America Corporation" },
  { value: "CRM", label: "CRM - Salesforce, Inc." },
  { value: "NFLX", label: "NFLX - Netflix, Inc." },
  { value: "XOM", label: "XOM - Exxon Mobil Corporation" },
  { value: "CVX", label: "CVX - Chevron Corporation" },
  { value: "AMD", label: "AMD - Advanced Micro Devices, Inc." },
  { value: "PFE", label: "PFE - Pfizer Inc." },
  { value: "TMO", label: "TMO - Thermo Fisher Scientific Inc." },
  { value: "COST", label: "COST - Costco Wholesale Corporation" },
  { value: "ABBV", label: "ABBV - AbbVie Inc." },
  { value: "ACN", label: "ACN - Accenture plc" },
  { value: "MRK", label: "MRK - Merck & Co., Inc." },
  { value: "LLY", label: "LLY - Eli Lilly and Company" },
  { value: "PEP", label: "PEP - PepsiCo, Inc." },
  { value: "AVGO", label: "AVGO - Broadcom Inc." },
  { value: "TXN", label: "TXN - Texas Instruments Incorporated" },
  { value: "ABT", label: "ABT - Abbott Laboratories" },
  { value: "ORCL", label: "ORCL - Oracle Corporation" },
  { value: "NKE", label: "NKE - NIKE, Inc." },
  { value: "DHR", label: "DHR - Danaher Corporation" },
  { value: "VZ", label: "VZ - Verizon Communications Inc." },
  { value: "COP", label: "COP - ConocoPhillips" },
  // ETFs
  { value: "SPY", label: "SPY - SPDR S&P 500 ETF Trust" },
  { value: "QQQ", label: "QQQ - Invesco QQQ Trust" },
  { value: "VTI", label: "VTI - Vanguard Total Stock Market ETF" },
  { value: "IWM", label: "IWM - iShares Russell 2000 ETF" },
  { value: "EEM", label: "EEM - iShares MSCI Emerging Markets ETF" },
  { value: "GLD", label: "GLD - SPDR Gold Shares" },
  { value: "SLV", label: "SLV - iShares Silver Trust" },
  { value: "TLT", label: "TLT - iShares 20+ Year Treasury Bond ETF" },
  // Crypto ETFs
  { value: "BITO", label: "BITO - ProShares Bitcoin Strategy ETF" },
];

interface StockTickerComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function StockTickerCombobox({
  value,
  onValueChange,
  placeholder = "Search stocks...",
  className,
}: StockTickerComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter stocks based on search
  const filteredStocks = React.useMemo(() => {
    if (!searchValue) return popularStocks.slice(0, 20); // Show top 20 by default

    return popularStocks.filter(
      (stock) =>
        stock.value.toLowerCase().includes(searchValue.toLowerCase()) ||
        stock.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const selectedStock = popularStocks.find((stock) => stock.value === value);

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
            <span className="truncate">{selectedStock.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search stocks..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No stocks found.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching by ticker symbol or company name
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredStocks.map((stock) => (
                <CommandItem
                  key={stock.value}
                  value={stock.value}
                  onSelect={(currentValue: string) => {
                    onValueChange?.(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === stock.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{stock.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {stock.label.split(" - ")[1]}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
