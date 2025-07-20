// Popular stock symbols for the combobox
export interface StockSymbol {
  symbol: string;
  name: string;
  sector?: string;
}

export const popularStocks: StockSymbol[] = [
  // Technology
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A", sector: "Technology" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corporation", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", sector: "Technology" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", sector: "Technology" },

  // Finance
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Finance" },
  { symbol: "BAC", name: "Bank of America Corp.", sector: "Finance" },
  { symbol: "WFC", name: "Wells Fargo & Company", sector: "Finance" },
  { symbol: "GS", name: "Goldman Sachs Group Inc.", sector: "Finance" },
  { symbol: "MS", name: "Morgan Stanley", sector: "Finance" },
  { symbol: "C", name: "Citigroup Inc.", sector: "Finance" },
  { symbol: "V", name: "Visa Inc.", sector: "Finance" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Finance" },
  { symbol: "AXP", name: "American Express Company", sector: "Finance" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Finance" },

  // Healthcare
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher Scientific", sector: "Healthcare" },
  { symbol: "ABT", name: "Abbott Laboratories", sector: "Healthcare" },
  { symbol: "BMY", name: "Bristol Myers Squibb", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly and Company", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co. Inc.", sector: "Healthcare" },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Healthcare" },

  // Consumer Goods
  { symbol: "KO", name: "Coca-Cola Company", sector: "Consumer Goods" },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Goods" },
  { symbol: "PG", name: "Procter & Gamble Co.", sector: "Consumer Goods" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Goods" },
  { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer Goods" },
  { symbol: "MCD", name: "McDonald's Corporation", sector: "Consumer Goods" },
  { symbol: "NKE", name: "NIKE Inc.", sector: "Consumer Goods" },
  { symbol: "SBUX", name: "Starbucks Corporation", sector: "Consumer Goods" },
  { symbol: "DIS", name: "Walt Disney Company", sector: "Consumer Goods" },
  { symbol: "LOW", name: "Lowe's Companies Inc.", sector: "Consumer Goods" },

  // Energy
  { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy" },
  { symbol: "EOG", name: "EOG Resources Inc.", sector: "Energy" },
  { symbol: "SLB", name: "Schlumberger Limited", sector: "Energy" },

  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", sector: "ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market", sector: "ETF" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", sector: "ETF" },
  { symbol: "VEA", name: "Vanguard FTSE Developed Markets", sector: "ETF" },
  { symbol: "VWO", name: "Vanguard FTSE Emerging Markets", sector: "ETF" },
  { symbol: "BND", name: "Vanguard Total Bond Market", sector: "ETF" },
];

// Function to search stocks by symbol or name
export const searchStocks = (query: string): StockSymbol[] => {
  const lowercaseQuery = query.toLowerCase();
  return popularStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowercaseQuery) ||
      stock.name.toLowerCase().includes(lowercaseQuery)
  );
};

// Function to get stock by symbol
export const getStockBySymbol = (symbol: string): StockSymbol | undefined => {
  return popularStocks.find(
    (stock) => stock.symbol.toLowerCase() === symbol.toLowerCase()
  );
};
