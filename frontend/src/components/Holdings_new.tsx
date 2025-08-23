import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CalendarIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

import { useHoldings, useUpdateHolding, useDeleteHolding } from "@/hooks";
import { toast } from "sonner";

const holdingSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(10, "Ticker too long"),
  quantity: z.number().positive("Quantity must be positive"),
  buy_price: z.number().positive("Price must be positive"),
  buy_date: z.date(),
});

type HoldingFormData = z.infer<typeof holdingSchema>;

export const Holdings: React.FC = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<any>(null);

  // React Query hooks
  const { data: holdings = [], isLoading, error, refetch } = useHoldings();
  const updateHoldingMutation = useUpdateHolding();
  const deleteHoldingMutation = useDeleteHolding();

  const form = useForm<HoldingFormData>({
    resolver: zodResolver(holdingSchema),
    defaultValues: {
      ticker: "",
      quantity: 0,
      buy_price: 0,
      buy_date: new Date(),
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  const onSubmit = async (values: HoldingFormData) => {
    try {
      if (editingHolding) {
        await updateHoldingMutation.mutateAsync({
          id: editingHolding.id,
          holding: {
            ticker: values.ticker,
            quantity: values.quantity,
            buy_price: values.buy_price,
            buy_date: values.buy_date.toISOString(),
          },
        });
        toast("Success: Holding updated successfully");
      }
      handleDialogClose();
    } catch (error: any) {
      toast(
        "Error: " +
          (error?.response?.data?.detail || "Failed to update holding")
      );
    }
  };

  const handleEdit = (holding: any) => {
    setEditingHolding(holding);
    form.reset({
      ticker: holding.ticker,
      quantity: holding.quantity,
      buy_price: holding.buy_price,
      buy_date: new Date(holding.buy_date),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number, ticker: string) => {
    if (window.confirm(`Are you sure you want to delete ${ticker}?`)) {
      try {
        await deleteHoldingMutation.mutateAsync(id);
        toast(`Success: ${ticker} deleted successfully`);
      } catch (error: any) {
        toast(
          "Error: " +
            (error?.response?.data?.detail || "Failed to delete holding")
        );
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingHolding(null);
    form.reset({
      ticker: "",
      quantity: 0,
      buy_price: 0,
      buy_date: new Date(),
    });
  };

  const isSubmitting = updateHoldingMutation.isPending;

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
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
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Page Header with glass morphism */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
            <div className="relative p-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">
                  Holdings
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your portfolio holdings
                </p>
              </div>
            </div>
          </div>

          <Alert
            variant="destructive"
            className="bg-red-500/10 backdrop-blur-sm border border-red-500/20"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load holdings. Please try again.
              <Button
                variant="outline"
                size="sm"
                className="ml-2 bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-holdings"
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
            <rect width="100%" height="100%" fill="url(#grid-holdings)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Page Header with glass morphism */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="relative p-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                Holdings
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your portfolio holdings
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/holdings/add")}
              className="bg-primary/20 backdrop-blur-sm border border-white/20 hover:bg-primary/30 text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Edit Holding
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticker Symbol</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., AAPL"
                          {...field}
                          className="uppercase bg-white/5 backdrop-blur-sm border border-white/20"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="e.g., 10"
                          {...field}
                          className="bg-white/5 backdrop-blur-sm border border-white/20"
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
                      <FormLabel>Buy Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 150.00"
                          {...field}
                          className="bg-white/5 backdrop-blur-sm border border-white/20"
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
                  name="buy_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Purchase Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-white/5 backdrop-blur-sm border border-white/20",
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

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary/20 backdrop-blur-sm border border-white/20 hover:bg-primary/30"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Holding"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Holdings Table with glass morphism */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
          <div className="relative p-6">
            <div className="pb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Your Holdings
              </h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Loading holdings...
                </span>
              </div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground/50 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  No Holdings Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start building your portfolio by adding your first holding.
                </p>
                <Button
                  onClick={() => navigate("/dashboard/holdings/add")}
                  className="bg-primary/20 backdrop-blur-sm border border-white/20 hover:bg-primary/30"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Holding
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-muted-foreground">
                        Ticker
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Quantity
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Buy Price
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Current Price
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Total Value
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        P/L
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        P/L %
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding) => (
                      <TableRow
                        key={holding.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-medium text-foreground">
                          {holding.ticker}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {holding.quantity}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {formatCurrency(holding.buy_price)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {formatCurrency(holding.current_price)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {formatCurrency(holding.total_value)}
                        </TableCell>
                        <TableCell
                          className={`${
                            holding.profit_loss >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatCurrency(holding.profit_loss)}
                        </TableCell>
                        <TableCell
                          className={`${
                            holding.profit_loss_percentage >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatPercentage(holding.profit_loss_percentage)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(holding)}
                              className="bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDelete(holding.id, holding.ticker)
                              }
                              disabled={deleteHoldingMutation.isPending}
                              className="bg-transparent backdrop-blur-sm border border-red-500/20 hover:bg-red-500/10 text-red-400"
                            >
                              {deleteHoldingMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
