import React, { useState, useEffect, useCallback } from "react";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Search,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import api from "../api/api";

interface Stock {
  value: string;
  label: string;
  sector?: string;
  industry?: string;
  market_cap?: string;
  exchange?: string;
  isCustom?: boolean;
}

interface StockTickerComboboxProps {
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowCustomAssets?: boolean; // New prop to allow custom assets like crypto, commodities
  className?: string;
}

const StockTickerCombobox: React.FC<StockTickerComboboxProps> = ({
  value,
  onChange,
  onValueChange,
  placeholder = "Select stock ticker...",
  disabled = false,
  allowCustomAssets = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [customTicker, setCustomTicker] = useState("");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<
    "stock" | "crypto" | "commodity" | "other"
  >("stock");
  const [lastCacheUpdate, setLastCacheUpdate] = useState<number>(0);

  // Use onValueChange if provided, otherwise use onChange
  const handleValueChange = onValueChange || onChange;

  // Enhanced fallback stock list with more variety
  const fallbackStocks: Stock[] = [
    { value: "AAPL", label: "AAPL - Apple Inc.", sector: "Technology" },
    {
      value: "MSFT",
      label: "MSFT - Microsoft Corporation",
      sector: "Technology",
    },
    { value: "GOOGL", label: "GOOGL - Alphabet Inc.", sector: "Technology" },
    {
      value: "AMZN",
      label: "AMZN - Amazon.com Inc.",
      sector: "Consumer Cyclical",
    },
    { value: "NVDA", label: "NVDA - NVIDIA Corporation", sector: "Technology" },
    { value: "TSLA", label: "TSLA - Tesla, Inc.", sector: "Consumer Cyclical" },
    {
      value: "META",
      label: "META - Meta Platforms, Inc.",
      sector: "Technology",
    },
    {
      value: "BRK.B",
      label: "BRK.B - Berkshire Hathaway Inc.",
      sector: "Financial Services",
    },
    { value: "V", label: "V - Visa Inc.", sector: "Financial Services" },
    { value: "JNJ", label: "JNJ - Johnson & Johnson", sector: "Healthcare" },
    { value: "WMT", label: "WMT - Walmart Inc.", sector: "Consumer Defensive" },
    {
      value: "JPM",
      label: "JPM - JPMorgan Chase & Co.",
      sector: "Financial Services",
    },
    {
      value: "PG",
      label: "PG - Procter & Gamble Company",
      sector: "Consumer Defensive",
    },
    { value: "UNH", label: "UNH - UnitedHealth Group", sector: "Healthcare" },
    {
      value: "HD",
      label: "HD - The Home Depot, Inc.",
      sector: "Consumer Cyclical",
    },
    {
      value: "MA",
      label: "MA - Mastercard Incorporated",
      sector: "Financial Services",
    },
    {
      value: "DIS",
      label: "DIS - The Walt Disney Company",
      sector: "Communication Services",
    },
    { value: "ADBE", label: "ADBE - Adobe Inc.", sector: "Technology" },
    {
      value: "NFLX",
      label: "NFLX - Netflix, Inc.",
      sector: "Communication Services",
    },
    { value: "XOM", label: "XOM - Exxon Mobil Corporation", sector: "Energy" },
    { value: "SPY", label: "SPY - SPDR S&P 500 ETF Trust", sector: "ETF" },
    { value: "QQQ", label: "QQQ - Invesco QQQ Trust", sector: "ETF" },
    {
      value: "VTI",
      label: "VTI - Vanguard Total Stock Market ETF",
      sector: "ETF",
    },
    { value: "IWM", label: "IWM - iShares Russell 2000 ETF", sector: "ETF" },
    {
      value: "EEM",
      label: "EEM - iShares MSCI Emerging Markets ETF",
      sector: "ETF",
    },
    { value: "GLD", label: "GLD - SPDR Gold Shares", sector: "Commodities" },
    {
      value: "SLV",
      label: "SLV - iShares Silver Trust",
      sector: "Commodities",
    },
    {
      value: "BTC-USD",
      label: "BTC-USD - Bitcoin USD",
      sector: "Cryptocurrency",
    },
    {
      value: "ETH-USD",
      label: "ETH-USD - Ethereum USD",
      sector: "Cryptocurrency",
    },
    {
      value: "OTHER",
      label: "OTHER - Enter Custom Asset",
      sector: "Custom",
      isCustom: true,
    },
  ];

  // Cache management for popular stocks
  const getCachedStocks = useCallback(() => {
    try {
      const cached = localStorage.getItem("stockwise_popular_stocks");
      const cacheTime = localStorage.getItem("stockwise_popular_stocks_time");

      if (cached && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        // Cache for 24 hours (86400000 ms)
        if (cacheAge < 86400000) {
          setLastCacheUpdate(parseInt(cacheTime));
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.error("Error reading cached stocks:", error);
    }
    return null;
  }, []);

  const setCachedStocks = useCallback((stockData: Stock[]) => {
    try {
      const timestamp = Date.now();
      localStorage.setItem(
        "stockwise_popular_stocks",
        JSON.stringify(stockData)
      );
      localStorage.setItem(
        "stockwise_popular_stocks_time",
        timestamp.toString()
      );
      setLastCacheUpdate(timestamp);
    } catch (error) {
      console.error("Error caching stocks:", error);
    }
  }, []);

  // Load popular stocks with caching
  useEffect(() => {
    const loadPopularStocks = async () => {
      try {
        setIsLoading(true);

        // Try to get from cache first
        const cachedStocks = getCachedStocks();
        if (cachedStocks) {
          setStocks(cachedStocks);
          setIsLoading(false);
          return;
        }

        // Fetch from API with enhanced caching
        const response = await api.get("/api/v1/stocks/popular");
        const apiStocks = response.data;

        // Add the "OTHER" option at the end
        const enhancedStocks = [
          ...apiStocks,
          {
            value: "OTHER",
            label: "OTHER - Enter Custom Asset",
            sector: "Custom",
            isCustom: true,
          },
        ];

        setStocks(enhancedStocks);
        setCachedStocks(enhancedStocks);
      } catch (error) {
        console.error("Failed to load popular stocks:", error);
        // Fallback to enhanced static list with OTHER option
        setStocks(fallbackStocks);
        setCachedStocks(fallbackStocks);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularStocks();
  }, [getCachedStocks, setCachedStocks]);

  // Search stocks when query changes
  useEffect(() => {
    const searchStocks = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await api.get(`/api/v1/stocks/search`, {
          params: { q: searchQuery, limit: 10 },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Failed to search stocks:", error);
        // Fallback to local filtering
        const filtered = stocks.filter(
          (stock) =>
            stock.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchStocks, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, stocks]);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "OTHER") {
      setCustomDialogOpen(true);
      setOpen(false);
      return;
    }
    handleValueChange?.(selectedValue);
    setOpen(false);
  };

  const handleCustomStock = async () => {
    if (!customTicker.trim()) return;

    const ticker = customTicker.toUpperCase().trim();

    try {
      // Validate the ticker
      const response = await api.get(`/api/v1/stocks/validate/${ticker}`);
      if (response.data.valid) {
        // Add to stocks list and select it
        const newStock = {
          value: ticker,
          label: customName.trim()
            ? `${ticker} - ${customName.trim()}`
            : ticker,
        };
        setStocks((prev) => [newStock, ...prev]);
        handleValueChange?.(ticker);
        setCustomDialogOpen(false);
        setCustomTicker("");
        setCustomName("");
      } else {
        alert("Ticker not found. Please check the symbol and try again.");
      }
    } catch (error) {
      console.error("Failed to validate ticker:", error);
      // Allow custom entry anyway for flexibility
      const newStock = {
        value: ticker,
        label: customName.trim() ? `${ticker} - ${customName.trim()}` : ticker,
      };
      setStocks((prev) => [newStock, ...prev]);
      handleValueChange?.(ticker);
      setCustomDialogOpen(false);
      setCustomTicker("");
      setCustomName("");
    }
  };

  const selectedStock = stocks.find((stock) => stock.value === value);
  const displayedStocks = searchQuery ? searchResults : stocks;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            {selectedStock ? (
              <span className="flex flex-col items-start">
                <span className="font-medium">{selectedStock.value}</span>
                {selectedStock.sector && (
                  <span className="text-xs text-muted-foreground">
                    {selectedStock.sector}
                  </span>
                )}
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <div className="flex items-center justify-between p-2 border-b">
              <CommandInput
                placeholder="Search stocks..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1 border-0 focus:ring-0"
              />
              {lastCacheUpdate > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Cached
                </Badge>
              )}
            </div>
            <CommandList>
              <CommandEmpty>
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Search className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      No stocks found.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomDialogOpen(true);
                        setOpen(false);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Stock
                    </Button>
                  </div>
                )}
              </CommandEmpty>

              {displayedStocks.length > 0 && (
                <CommandGroup>
                  {displayedStocks.map((stock) => (
                    <CommandItem
                      key={stock.value}
                      value={stock.value}
                      onSelect={() => handleSelect(stock.value)}
                      className="flex flex-col items-start py-3"
                    >
                      <div className="flex items-center w-full">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === stock.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{stock.value}</div>
                          <div className="text-sm text-muted-foreground">
                            {stock.label.replace(`${stock.value} - `, "")}
                          </div>
                          {(stock.sector || stock.exchange) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {[stock.sector, stock.exchange]
                                .filter(Boolean)
                                .join(" • ")}
                            </div>
                          )}
                        </div>
                        {stock.isCustom && (
                          <Badge variant="outline" className="ml-2">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setCustomDialogOpen(true);
                    setOpen(false);
                  }}
                  className="flex items-center py-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Stock
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Enhanced Custom Stock Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Asset</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Asset Type</Label>
              <select
                id="type"
                value={customType}
                onChange={(e) =>
                  setCustomType(e.target.value as typeof customType)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="stock">Stock</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="commodity">Commodity</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticker">Symbol/Ticker *</Label>
              <Input
                id="ticker"
                placeholder={
                  customType === "crypto"
                    ? "e.g., BTC-USD"
                    : customType === "commodity"
                    ? "e.g., GLD"
                    : "e.g., AAPL"
                }
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                {customType === "crypto" &&
                  "Use format: SYMBOL-USD (e.g., BTC-USD, ETH-USD)"}
                {customType === "commodity" &&
                  "Use commodity ETF symbols (e.g., GLD for gold, SLV for silver)"}
                {customType === "stock" && "Enter stock ticker symbol"}
                {customType === "other" && "Enter any symbol or identifier"}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                placeholder={`e.g., ${
                  customType === "crypto"
                    ? "Bitcoin"
                    : customType === "commodity"
                    ? "Gold ETF"
                    : "Company Name"
                }`}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCustomDialogOpen(false);
                setCustomTicker("");
                setCustomName("");
                setCustomType("stock");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCustomStock} disabled={!customTicker.trim()}>
              Add{" "}
              {customType === "stock"
                ? "Stock"
                : customType === "crypto"
                ? "Crypto"
                : customType === "commodity"
                ? "Commodity"
                : "Asset"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StockTickerCombobox;
