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
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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

const addHoldingSchema = z.object({
  ticker: z.string().min(1, "Please select a stock"),
  asset_type: z.enum(["stock", "etf", "crypto", "bond", "commodity"]),
  quantity: z.number().positive("Quantity must be positive"),
  buy_price: z.number().positive("Price must be positive"),
  buy_date: z.date().default(() => new Date()),
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
      toast("Holding added successfully!");
      navigate("/holdings");
    } catch (error: any) {
      toast(
        `Error: ${error?.response?.data?.detail || "Failed to add holding"}`
      );
    }
  };

  const isSubmitting = createHoldingMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/holdings")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Holdings
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Add New Holding
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Add a new stock, ETF, or other asset to your portfolio. We'll
              automatically fetch current prices and track performance.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Investment Details
              </CardTitle>
              <p className="text-gray-600">
                Enter the details of your investment below
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Stock Ticker */}
                  <FormField
                    control={form.control}
                    name="ticker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Stock Symbol
                        </FormLabel>
                        <FormControl>
                          <StockTickerCombobox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Search for a stock..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Asset Type */}
                  <FormField
                    control={form.control}
                    name="asset_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Asset Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select asset type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stock">Stock</SelectItem>
                            <SelectItem value="etf">ETF</SelectItem>
                            <SelectItem value="crypto">
                              Cryptocurrency
                            </SelectItem>
                            <SelectItem value="bond">Bond</SelectItem>
                            <SelectItem value="commodity">Commodity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity and Price Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 10"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
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
                          <FormLabel className="text-gray-700 font-medium">
                            Purchase Price ($)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 150.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Purchase Date */}
                  <FormField
                    control={form.control}
                    name="buy_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-gray-700 font-medium">
                          Purchase Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-lg transition-all duration-200"
                    >
                      {isSubmitting ? "Adding..." : "Add to Portfolio"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Auto Pricing</h3>
            <p className="text-sm text-gray-600">
              We automatically fetch current market prices for your holdings
            </p>
          </Card>
          <Card className="text-center p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Performance Tracking
            </h3>
            <p className="text-sm text-gray-600">
              Track profit/loss and percentage returns automatically
            </p>
          </Card>
          <Card className="text-center p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Portfolio Insights
            </h3>
            <p className="text-sm text-gray-600">
              Get AI-powered insights and risk analysis for your portfolio
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
