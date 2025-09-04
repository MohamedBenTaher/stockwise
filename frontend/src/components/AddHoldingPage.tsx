import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StockTickerCombobox from "./StockTickerCombobox";
import { useCreateHolding } from "@/hooks";
import { StocksDebugger } from "./StocksDebugger";

const addHoldingSchema = z.object({
  ticker: z.string().min(1, "Please select a stock"),
  asset_type: z.enum(["stock", "etf", "crypto", "bond", "commodity"]),
  quantity: z.number().positive("Quantity must be positive"),
  buy_price: z.number().positive("Price must be positive"),
  buy_date: z.date(),
});

type AddHoldingFormData = z.infer<typeof addHoldingSchema>;

export const AddHoldingPage: React.FC = () => {
  const navigate = useNavigate();
  const createHoldingMutation = useCreateHolding();

  const form = useForm<AddHoldingFormData>({
    resolver: zodResolver(addHoldingSchema),
    defaultValues: {
      ticker: "",
      asset_type: "stock",
      quantity: 0,
      buy_price: 0,
      buy_date: new Date(),
    },
  });

  const onSubmit = async (data: AddHoldingFormData) => {
    try {
      await createHoldingMutation.mutateAsync({
        ...data,
        buy_date: data.buy_date.toISOString(),
      });

      toast("Success: Holding added successfully!");
      navigate("/dashboard/holdings");
    } catch (error: any) {
      console.error("Error adding holding:", error);
      toast(
        "Error: " + (error?.response?.data?.detail || "Failed to add holding")
      );
    }
  };

  const isSubmitting = createHoldingMutation.isPending;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-add-holding"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-add-holding)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6">
        {/* Header with glass morphism */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="relative p-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/holdings")}
                className="bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Holdings
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Add New Holding
              </h1>
              <p className="text-muted-foreground">
                Add a new asset to your portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Form with glass morphism */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
          <div className="relative p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Stock Symbol
                      </FormLabel>
                      <FormControl>
                        <StockTickerCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                          className="bg-white/5 backdrop-blur-sm border border-white/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="asset_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Asset Type
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="bg-white/5 backdrop-blur-sm border border-white/20 text-foreground">
                            <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-sm border border-white/20">
                            <SelectItem value="stock">Stock</SelectItem>
                            <SelectItem value="etf">ETF</SelectItem>
                            <SelectItem value="crypto">
                              Cryptocurrency
                            </SelectItem>
                            <SelectItem value="bond">Bond</SelectItem>
                            <SelectItem value="commodity">Commodity</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="e.g., 10"
                            {...field}
                            className="bg-white/5 backdrop-blur-sm border border-white/20 text-foreground"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buy_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Purchase Price ($)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 150.00"
                            {...field}
                            className="bg-white/5 backdrop-blur-sm border border-white/20 text-foreground"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="buy_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-foreground">
                        Purchase Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-white/5 backdrop-blur-sm border border-white/20 text-foreground",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-background/95 backdrop-blur-sm border border-white/20"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard/holdings")}
                    className="flex-1 bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5 text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary/20 backdrop-blur-sm border border-white/20 hover:bg-primary/30 text-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Holding
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Tips section with glass morphism */}
        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" />
            <div className="relative p-4 text-center">
              <h3 className="font-medium text-foreground mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-muted-foreground">
                Double-check your ticker symbol and purchase details for
                accurate portfolio tracking.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" />
            <div className="relative p-4 text-center">
              <h3 className="font-medium text-foreground mb-2">
                📊 Analytics Ready
              </h3>
              <p className="text-sm text-muted-foreground">
                Your holding will be included in portfolio analysis and AI
                insights.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" />
            <div className="relative p-4 text-center">
              <h3 className="font-medium text-foreground mb-2">
                🔄 Live Updates
              </h3>
              <p className="text-sm text-muted-foreground">
                Real-time price tracking starts immediately after adding your
                holding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
