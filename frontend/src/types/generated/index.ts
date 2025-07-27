export * from "./api-types";

export type { paths, components, operations } from "./api-types";

import type { components } from "./api-types";

type Schemas = components["schemas"];

// Core types
export type User = Schemas["User"];
export type Holding = Schemas["Holding"];
export type HoldingCreate = Schemas["HoldingCreate"];
export type HoldingUpdate = Schemas["HoldingUpdate"];
export type PortfolioSummary = Schemas["PortfolioSummary"];
export type AllocationData = Schemas["AllocationData"];
export type InsightResponse = Schemas["InsightResponse"];
export type Token = Schemas["Token"];
export type AssetType = Schemas["AssetType"];
export type AIInsight = Schemas["AIInsight"];
export type RiskSummary = Schemas["RiskSummary"];
export type ConcentrationAlert = Schemas["ConcentrationAlert"];
export type DiversificationSuggestion = Schemas["DiversificationSuggestion"];

export type PortfolioHistoryPoint = Schemas["PortfolioHistoryPoint"];
export type PerformanceComparisonPoint = Schemas["PerformanceComparisonPoint"];
export type AllocationChartData = Schemas["AllocationChartData"];
export type PortfolioMetrics = Schemas["PortfolioMetrics"];
export type AllocationDataPoint = Schemas["AllocationDataPoint"];
export type HoldingAllocationPoint = Schemas["HoldingAllocationPoint"];
export type PerformerData = Schemas["PerformerData"];
export type TotalReturnData = Schemas["TotalReturnData"];

export type StockSearchResponse = Schemas["StockSearchResponse"];
export type StockQuoteResponse = Schemas["StockQuoteResponse"];
export type DailyPerformanceResponse = Schemas["DailyPerformanceResponse"];
