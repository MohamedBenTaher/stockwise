import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { useCreateHolding } from "../hooks/useHoldings";

interface AddHoldingProps {
  onSuccess?: () => void;
}

const assetTypes = [
  { value: "stock", label: "Stock" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "bond", label: "Bond" },
  { value: "commodity", label: "Commodity" },
];

export const AddHolding: React.FC<AddHoldingProps> = ({ onSuccess }) => {
  const [ticker, setTicker] = useState("");
  const [assetType, setAssetType] = useState<
    "stock" | "etf" | "crypto" | "bond" | "commodity"
  >("stock");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyDate, setBuyDate] = useState("");

  const createHoldingMutation = useCreateHolding();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticker || !quantity || !buyPrice || !buyDate) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await createHoldingMutation.mutateAsync({
        ticker: ticker.toUpperCase(),
        asset_type: assetType,
        quantity: parseFloat(quantity),
        buy_price: parseFloat(buyPrice),
        buy_date: buyDate,
      });

      // Reset form
      setTicker("");
      setAssetType("stock");
      setQuantity("");
      setBuyPrice("");
      setBuyDate("");

      // Call success callback
      onSuccess?.();
      toast.success("Holding added successfully!");
    } catch (error) {
      console.error("Failed to add holding:", error);
      toast.error("Failed to add holding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-6 space-y-4"
    >
      <h2 className="text-xl font-bold mb-2">Add Holding</h2>
      <Input
        placeholder="Ticker (e.g., AAPL)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        className="bg-white/10 backdrop-blur-sm border-white/20 text-foreground placeholder:text-muted-foreground focus:bg-white/15 focus:border-white/30"
        required
      />
      <Select
        value={assetType}
        onValueChange={(value) => setAssetType(value as typeof assetType)}
      >
        <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-foreground hover:bg-white/15 focus:bg-white/15 focus:border-white/30">
          <SelectValue placeholder="Select asset type" />
        </SelectTrigger>
        <SelectContent className="bg-white/10 backdrop-blur-md border-white/20 text-foreground">
          {assetTypes.map((type) => (
            <SelectItem
              key={type.value}
              value={type.value}
              className="text-foreground hover:bg-white/20 focus:bg-white/20 focus:text-foreground"
            >
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="bg-white/10 backdrop-blur-sm border-white/20 text-foreground placeholder:text-muted-foreground focus:bg-white/15 focus:border-white/30"
        min={0.01}
        step={0.01}
        required
      />
      <Input
        type="number"
        placeholder="Buy Price"
        value={buyPrice}
        onChange={(e) => setBuyPrice(e.target.value)}
        className="bg-white/10 backdrop-blur-sm border-white/20 text-foreground placeholder:text-muted-foreground focus:bg-white/15 focus:border-white/30"
        min={0.01}
        step={0.01}
        required
      />
      <Input
        type="date"
        value={buyDate}
        onChange={(e) => setBuyDate(e.target.value)}
        className="bg-white/10 backdrop-blur-sm border-white/20 text-foreground placeholder:text-muted-foreground focus:bg-white/15 focus:border-white/30"
        required
      />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Adding..." : "Add Holding"}
      </Button>
    </form>
  );
};
