export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface Holding {
  id: number;
  user_id: number;
  ticker: string;
  asset_type: "stock" | "crypto" | "etf" | "bond" | "commodity";
  quantity: number;
  buy_price: number;
  current_price: number;
  buy_date: string;
  sector?: string;
  country?: string;
  market_cap?: number;
  created_at: string;
  updated_at: string;
  total_value: number;
  total_cost: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

export interface PortfolioSummary {
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  holdings_count: number;
  holdings: Holding[];
}

export interface AllocationData {
  by_asset_type: Record<string, number>;
  by_sector: Record<string, number>;
  by_country: Record<string, number>;
  top_performers: Holding[];
  worst_performers: Holding[];
}

export interface RiskSummary {
  overall_risk_level: "low" | "medium" | "high";
  risk_score: number;
  main_concerns: string[];
  volatility_estimate: number;
}

export interface DiversificationSuggestion {
  type: "sector" | "geography" | "asset_class";
  current_exposure: number;
  recommended_exposure: number;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export interface ConcentrationAlert {
  type: "single_stock" | "sector" | "country";
  asset_name: string;
  concentration_percentage: number;
  risk_level: "low" | "medium" | "high";
  recommendation: string;
}

export interface AIInsight {
  id: string;
  user_id: number;
  generated_at: string;
  risk_summary: RiskSummary;
  diversification_suggestions: DiversificationSuggestion[];
  concentration_alerts: ConcentrationAlert[];
  key_recommendations: string[];
  confidence_score: number;
}

export interface InsightResponse {
  insight: AIInsight;
  portfolio_snapshot: {
    portfolio_summary: PortfolioSummary;
    allocation_data: AllocationData;
  };
  processing_time_ms: number;
}

export interface RiskMetrics {
  overall_risk_score: number;
  risk_level: "low" | "medium" | "high";
  concentration_risk: number;
  sector_risk: number;
  country_risk: number;
  volatility_risk: number;
  herfindahl_index: number;
  effective_number_of_holdings: number;
  max_position_weight: number;
  portfolio_volatility: number;
  value_at_risk_5pct: number;
  sharpe_estimation: number;
}

export interface RiskHeatmapData {
  sectors: Array<{
    name: string;
    percentage: number;
    risk_level: "low" | "medium" | "high";
    color_intensity: number;
  }>;
  countries: Array<{
    name: string;
    percentage: number;
    risk_level: "low" | "medium" | "high";
    color_intensity: number;
  }>;
  asset_types: Array<{
    name: string;
    percentage: number;
    risk_level: "low" | "medium" | "high";
    color_intensity: number;
  }>;
}
