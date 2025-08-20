export function StockWiseDashboardPreview() {
  return (
    <div className="w-[calc(100vw-32px)] md:w-[1160px]">
      <div className="bg-primary/10 rounded-2xl p-2 shadow-2xl border border-primary/20">
        <div className="bg-background rounded-xl p-6 shadow-lg">
          {/* Mock Dashboard Content */}
          <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">
                  Total Portfolio Value
                </div>
                <div className="text-2xl font-bold text-foreground">
                  $127,543.21
                </div>
                <div className="text-sm text-primary">+$2,341.12 (+1.87%)</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Today's P&L</div>
                <div className="text-2xl font-bold text-foreground">
                  +$1,234.56
                </div>
                <div className="text-sm text-primary">+0.98%</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Risk Score</div>
                <div className="text-2xl font-bold text-foreground">7.2/10</div>
                <div className="text-sm text-yellow-500">Moderate Risk</div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-card border border-border rounded-lg p-6 h-64">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">
                    Portfolio Performance
                  </div>
                  <div className="text-sm">
                    Interactive charts and analytics
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  Top Holdings
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  {
                    symbol: "AAPL",
                    name: "Apple Inc.",
                    value: "$25,432.10",
                    change: "+2.34%",
                  },
                  {
                    symbol: "MSFT",
                    name: "Microsoft Corp.",
                    value: "$18,765.43",
                    change: "+1.87%",
                  },
                  {
                    symbol: "GOOGL",
                    name: "Alphabet Inc.",
                    value: "$15,234.67",
                    change: "-0.45%",
                  },
                  {
                    symbol: "TSLA",
                    name: "Tesla Inc.",
                    value: "$12,987.54",
                    change: "+4.23%",
                  },
                ].map((stock) => (
                  <div
                    key={stock.symbol}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {stock.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {stock.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {stock.value}
                      </div>
                      <div
                        className={`text-sm ${
                          stock.change.startsWith("+")
                            ? "text-primary"
                            : "text-red-500"
                        }`}
                      >
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
