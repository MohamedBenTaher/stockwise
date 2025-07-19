// Auto-generated API types index
export * from './api-types';

// Re-export common types for convenience
export type {
  paths,
  components,
  operations,
} from './api-types';

// Extract and re-export individual schema types for easier importing
import type { components } from './api-types';

type Schemas = components['schemas'];

export type User = Schemas['User'];
export type Holding = Schemas['Holding'];
export type HoldingCreate = Schemas['HoldingCreate'];
export type HoldingUpdate = Schemas['HoldingUpdate'];
export type PortfolioSummary = Schemas['PortfolioSummary'];
export type AllocationData = Schemas['AllocationData'];
export type InsightResponse = Schemas['InsightResponse'];
export type Token = Schemas['Token'];
export type AssetType = Schemas['AssetType'];
export type AIInsight = Schemas['AIInsight'];
export type RiskSummary = Schemas['RiskSummary'];
export type ConcentrationAlert = Schemas['ConcentrationAlert'];
export type DiversificationSuggestion = Schemas['DiversificationSuggestion'];
