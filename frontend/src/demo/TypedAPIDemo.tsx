/**
 * TypedAPI Demo Component
 *
 * This component demonstrates how to use the auto-generated TypeScript types
 * with the StockWise API client for complete type safety.
 */

import React, { useState, useEffect } from "react";
import { typedApi } from "../api/typed-api";
import type {
  User,
  Holding,
  HoldingCreate,
  PortfolioSummary,
  AllocationData,
  AssetType,
} from "../types/generated";

// Example of using generated types for component props
interface TypedAPIDemoProps {
  user?: User;
  onHoldingCreate?: (holding: Holding) => void;
}

const TypedAPIDemo: React.FC<TypedAPIDemoProps> = ({
  user,
  onHoldingCreate,
}) => {
  // State with full type safety
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [allocation, setAllocation] = useState<AllocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example of creating a new holding with type safety
  const [newHolding, setNewHolding] = useState<HoldingCreate>({
    ticker: "",
    asset_type: "stock", // TypeScript knows this must be one of the AssetType enum values
    quantity: 0,
    buy_price: 0,
    buy_date: new Date().toISOString(),
  });

  // Fetch data with complete type safety
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // All API calls return properly typed responses
      const [holdingsData, portfolioData, allocationData] = await Promise.all([
        typedApi.holdings.getAll(),
        typedApi.holdings.getPortfolioSummary(),
        typedApi.holdings.getAllocationData(),
      ]);

      // TypeScript knows the exact shape of each response
      setHoldings(holdingsData);
      setPortfolio(portfolioData);
      setAllocation(allocationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Create holding with type safety
  const createHolding = async () => {
    if (!newHolding.ticker || !newHolding.quantity || !newHolding.buy_price) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      // TypeScript validates the request body structure
      const createdHolding = await typedApi.holdings.create(newHolding);

      // TypeScript knows the response type
      setHoldings((prev) => [...prev, createdHolding]);
      onHoldingCreate?.(createdHolding);

      // Reset form
      setNewHolding({
        ticker: "",
        asset_type: "stock",
        quantity: 0,
        buy_price: 0,
        buy_date: new Date().toISOString(),
      });

      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create holding");
    } finally {
      setLoading(false);
    }
  };

  // Update holding with type safety
  const updateHolding = async (id: number, updates: Partial<Holding>) => {
    try {
      // TypeScript validates the update payload
      await typedApi.holdings.update(id, updates);
      await fetchData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update holding");
    }
  };

  // Delete holding
  const deleteHolding = async (id: number) => {
    try {
      await typedApi.holdings.delete(id);
      setHoldings((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete holding");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        TypeScript API Integration Demo
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* User Info Section */}
      {user && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Full Name:</strong> {user.full_name || "Not provided"}
          </p>
          <p>
            <strong>Active:</strong> {user.is_active ? "Yes" : "No"}
          </p>
          <p>
            <strong>Verified:</strong> {user.is_verified ? "Yes" : "No"}
          </p>
        </div>
      )}

      {/* Portfolio Summary */}
      {portfolio && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Portfolio Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-medium">Total Value</p>
              <p className="text-lg">${portfolio.total_value.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Total Cost</p>
              <p className="text-lg">${portfolio.total_cost.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">P&L</p>
              <p
                className={`text-lg ${
                  portfolio.total_profit_loss >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${portfolio.total_profit_loss.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="font-medium">P&L %</p>
              <p
                className={`text-lg ${
                  portfolio.total_profit_loss_percentage >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {portfolio.total_profit_loss_percentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create New Holding Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Holding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Ticker (e.g., AAPL)"
            value={newHolding.ticker}
            onChange={(e) =>
              setNewHolding((prev) => ({ ...prev, ticker: e.target.value }))
            }
            className="px-3 py-2 border rounded"
          />

          <select
            value={newHolding.asset_type}
            onChange={(e) =>
              setNewHolding((prev) => ({
                ...prev,
                asset_type: e.target.value as AssetType, // TypeScript knows valid values
              }))
            }
            className="px-3 py-2 border rounded"
          >
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
            <option value="etf">ETF</option>
            <option value="bond">Bond</option>
            <option value="commodity">Commodity</option>
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={newHolding.quantity || ""}
            onChange={(e) =>
              setNewHolding((prev) => ({
                ...prev,
                quantity: parseFloat(e.target.value) || 0,
              }))
            }
            className="px-3 py-2 border rounded"
          />

          <input
            type="number"
            placeholder="Buy Price"
            step="0.01"
            value={newHolding.buy_price || ""}
            onChange={(e) =>
              setNewHolding((prev) => ({
                ...prev,
                buy_price: parseFloat(e.target.value) || 0,
              }))
            }
            className="px-3 py-2 border rounded"
          />

          <input
            type="datetime-local"
            value={newHolding.buy_date.slice(0, 16)} // Convert ISO string to datetime-local format
            onChange={(e) =>
              setNewHolding((prev) => ({
                ...prev,
                buy_date: new Date(e.target.value).toISOString(),
              }))
            }
            className="px-3 py-2 border rounded"
          />

          <button
            onClick={createHolding}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Holding"}
          </button>
        </div>
      </div>

      {/* Holdings List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-4 border-b">
          Holdings ({holdings.length})
        </h2>
        {loading && <p className="p-4">Loading...</p>}
        {holdings.length === 0 && !loading && (
          <p className="p-4 text-gray-500">
            No holdings found. Add your first holding above!
          </p>
        )}
        {holdings.map((holding) => (
          <div key={holding.id} className="p-4 border-b last:border-b-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{holding.ticker}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {holding.asset_type}
                </p>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Quantity:</span>{" "}
                    {holding.quantity}
                  </div>
                  <div>
                    <span className="font-medium">Buy Price:</span> $
                    {holding.buy_price.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Current:</span> $
                    {holding.current_price.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Value:</span> $
                    {holding.total_value.toFixed(2)}
                  </div>
                  <div
                    className={
                      holding.profit_loss >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    <span className="font-medium">P&L:</span> $
                    {holding.profit_loss.toFixed(2)}
                  </div>
                  <div
                    className={
                      holding.profit_loss_percentage >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    <span className="font-medium">P&L %:</span>{" "}
                    {holding.profit_loss_percentage.toFixed(2)}%
                  </div>
                  {holding.sector && (
                    <div>
                      <span className="font-medium">Sector:</span>{" "}
                      {holding.sector}
                    </div>
                  )}
                  {holding.country && (
                    <div>
                      <span className="font-medium">Country:</span>{" "}
                      {holding.country}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteHolding(holding.id)}
                className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Data */}
      {allocation && (
        <div className="mt-6 bg-purple-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Portfolio Allocation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">By Asset Type</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(allocation.by_asset_type, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">By Sector</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(allocation.by_sector, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">By Country</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(allocation.by_country, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">
          🎉 Type Safety Features Demonstrated:
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Auto-completion for all API response fields</li>
          <li>✅ Compile-time validation of request payloads</li>
          <li>✅ Enum validation for asset types</li>
          <li>✅ Proper typing for optional fields (sector, country)</li>
          <li>✅ Date string format validation</li>
          <li>✅ Numeric field type safety</li>
          <li>✅ Error-free refactoring when API changes</li>
        </ul>
      </div>
    </div>
  );
};

export default TypedAPIDemo;
