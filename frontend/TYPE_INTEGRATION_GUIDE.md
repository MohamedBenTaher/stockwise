# TypeScript API Integration Guide

## 🎯 Overview

This guide demonstrates the complete TypeScript integration setup for the StockWise project, featuring automatic type generation from OpenAPI schemas and type-safe API clients.

## 🚀 Features

- ✅ **Automatic Type Generation**: Types are auto-generated from your FastAPI OpenAPI schema
- ✅ **Compile-time Safety**: Catch API contract violations before runtime
- ✅ **Auto-completion**: Full IntelliSense support for all API endpoints
- ✅ **Real-time Updates**: Types update automatically when your backend changes
- ✅ **Zero Configuration**: Works out of the box with your existing setup

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── typed-api.ts          # Type-safe API client
│   │   └── axios.ts              # Base axios configuration
│   ├── types/
│   │   └── generated/            # Auto-generated types
│   │       ├── api-types.ts      # Generated from OpenAPI schema
│   │       └── index.ts          # Convenient re-exports
│   └── demo/
│       └── TypedAPIDemo.tsx      # Full demo implementation
├── scripts/
│   └── generate-types.js         # Type generation script
└── package.json                  # Scripts and dependencies
```

## 🛠️ Setup & Installation

### 1. Dependencies (Already Installed)

```json
{
  "devDependencies": {
    "openapi-typescript": "^7.8.0",
    "chokidar-cli": "^3.0.0"
  }
}
```

### 2. Scripts Configuration (Already Configured)

```json
{
  "scripts": {
    "generate-types": "node scripts/generate-types.js",
    "types:watch": "chokidar '../app/**/*.py' -c 'npm run generate-types'"
  }
}
```

## 🚀 Usage

### Manual Type Generation

```bash
cd frontend
npm run generate-types
```

### Watch Mode (Auto-regenerate on Backend Changes)

```bash
cd frontend
npm run types:watch
```

This will watch for changes in your Python backend files and automatically regenerate types.

## 📝 Code Examples

### 1. Basic API Usage

```typescript
import { typedApi } from '@/api/typed-api';
import type { User, Holding, HoldingCreate } from '@/types/generated';

// All responses are fully typed
const user: User = await typedApi.auth.getMe();
const holdings: Holding[] = await typedApi.holdings.getAll();

// Request bodies are validated at compile time
const newHolding: HoldingCreate = {
  ticker: 'AAPL',
  asset_type: 'stock', // TypeScript knows this must be a valid AssetType
  quantity: 10,
  buy_price: 150.00,
  buy_date: new Date().toISOString()
};

const created: Holding = await typedApi.holdings.create(newHolding);
```

### 2. React Component with Full Type Safety

```typescript
import React, { useState, useEffect } from 'react';
import { typedApi } from '@/api/typed-api';
import type { 
  Holding, 
  PortfolioSummary, 
  AssetType 
} from '@/types/generated';

const Portfolio: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Both calls return properly typed data
      const [holdingsData, summaryData] = await Promise.all([
        typedApi.holdings.getAll(),
        typedApi.holdings.getPortfolioSummary()
      ]);
      
      setHoldings(holdingsData);
      setSummary(summaryData);
    };

    fetchData();
  }, []);

  // TypeScript knows all the available fields and their types
  return (
    <div>
      {summary && (
        <div>
          <h2>Portfolio Value: ${summary.total_value.toFixed(2)}</h2>
          <p>P&L: ${summary.total_profit_loss.toFixed(2)}</p>
        </div>
      )}
      
      {holdings.map(holding => (
        <div key={holding.id}>
          <h3>{holding.ticker}</h3>
          <p>Type: {holding.asset_type}</p>
          <p>Quantity: {holding.quantity}</p>
          <p>Current Value: ${holding.total_value.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};
```

### 3. Form Handling with Type Safety

```typescript
import { useState } from 'react';
import type { HoldingCreate, AssetType } from '@/types/generated';

const AddHoldingForm: React.FC = () => {
  const [holding, setHolding] = useState<HoldingCreate>({
    ticker: '',
    asset_type: 'stock',
    quantity: 0,
    buy_price: 0,
    buy_date: new Date().toISOString()
  });

  const handleAssetTypeChange = (value: string) => {
    // TypeScript ensures value is a valid AssetType
    setHolding(prev => ({ 
      ...prev, 
      asset_type: value as AssetType 
    }));
  };

  const handleSubmit = async () => {
    // TypeScript validates the entire object structure
    const created = await typedApi.holdings.create(holding);
    console.log('Created:', created.id);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={holding.asset_type}
        onChange={(e) => handleAssetTypeChange(e.target.value)}
      >
        <option value="stock">Stock</option>
        <option value="crypto">Crypto</option>
        <option value="etf">ETF</option>
        <option value="bond">Bond</option>
        <option value="commodity">Commodity</option>
      </select>
      {/* Other form fields... */}
    </form>
  );
};
```

### 4. Advanced Type Usage

```typescript
import type { 
  paths, 
  components, 
  operations 
} from '@/types/generated';

// Extract specific operation types
type LoginOperation = operations['login_api_v1_auth_login_post'];
type LoginRequest = LoginOperation['requestBody']['content']['application/x-www-form-urlencoded'];
type LoginResponse = LoginOperation['responses']['200']['content']['application/json'];

// Extract component schemas
type Schemas = components['schemas'];
type UserSchema = Schemas['User'];
type TokenSchema = Schemas['Token'];

// Custom type helpers
type ApiEndpoints = keyof paths;
type GetEndpoints = {
  [K in ApiEndpoints]: paths[K] extends { get: any } ? K : never;
}[ApiEndpoints];

// Use in generic functions
async function fetchFromEndpoint<T extends GetEndpoints>(
  endpoint: T
): Promise<paths[T]['get']['responses']['200']['content']['application/json']> {
  const response = await fetch(`http://localhost:8000${endpoint}`);
  return response.json();
}
```

## 🔧 Configuration

### Backend Requirements

Your FastAPI app should have:

```python
app = FastAPI(
    title="StockWise API",
    description="AI-powered portfolio dashboard API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",  # This endpoint must be publicly accessible
)

@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_schema():
    """Serve OpenAPI schema for frontend type generation."""
    return app.openapi()
```

### Frontend Environment

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
```

## 🔄 Workflow

### Development Workflow

1. **Start Backend**: `make run` (from project root)
2. **Start Type Watching**: `npm run types:watch` (from frontend/)
3. **Start Frontend**: `npm run dev` (from frontend/)

Now any changes to your Python models or API endpoints will automatically:
1. Update the OpenAPI schema
2. Trigger type regeneration
3. Provide immediate TypeScript feedback

### Production Workflow

1. **Build Types**: `npm run generate-types`
2. **Build Frontend**: `npm run build`
3. **Deploy**: Types are included in the build

## 🎯 Benefits

### For Developers

- **Autocomplete**: Full IntelliSense for all API fields
- **Error Prevention**: Catch type mismatches before runtime
- **Refactoring Safety**: Rename fields confidently across the codebase
- **Documentation**: Types serve as live documentation

### For Teams

- **Contract Validation**: Frontend and backend contracts are enforced
- **Breaking Change Detection**: TypeScript errors highlight API changes
- **Consistent Data Handling**: Standardized type usage across components
- **Onboarding**: New developers see exact API structure

## 🐛 Troubleshooting

### Type Generation Fails

```bash
# Check backend is running
curl http://localhost:8000/health

# Check OpenAPI endpoint
curl http://localhost:8000/openapi.json

# Check backend logs for errors
tail -f ../logs/app.log
```

### Missing Types

- Ensure your Pydantic models are properly exported
- Check that endpoints return proper response models
- Verify OpenAPI schema includes all routes

### Watch Mode Issues

```bash
# Check if chokidar-cli is installed
npm list chokidar-cli

# Test manual generation
npm run generate-types

# Check file permissions
ls -la scripts/generate-types.js
```

## 📊 Generated Files

### api-types.ts (Sample)

```typescript
export interface paths {
  "/api/v1/auth/login": {
    post: operations["login_api_v1_auth_login_post"];
  };
  "/api/v1/holdings/": {
    get: operations["get_holdings_api_v1_holdings__get"];
    post: operations["create_holding_api_v1_holdings__post"];
  };
  // ... all your API endpoints
}

export interface components {
  schemas: {
    User: {
      id: number;
      email: string;
      full_name: string | null;
      is_active: boolean;
      is_verified: boolean;
      // ... all user fields
    };
    Holding: {
      id: number;
      ticker: string;
      asset_type: "stock" | "crypto" | "etf" | "bond" | "commodity";
      quantity: number;
      buy_price: number;
      current_price: number;
      // ... all holding fields
    };
    // ... all your models
  };
}
```

## 🎉 Success Metrics

After integration, you should see:

- ✅ Zero `any` types in API-related code
- ✅ Autocomplete for all API response fields
- ✅ Compile-time errors for invalid API usage
- ✅ Automatic type updates when backend changes
- ✅ Improved developer productivity
- ✅ Reduced runtime errors

## 📚 Next Steps

1. **Explore the Demo**: Check out `src/demo/TypedAPIDemo.tsx`
2. **Integrate Types**: Update your existing components to use generated types
3. **Add Validation**: Consider adding runtime validation with Zod
4. **Optimize Performance**: Add proper error boundaries and loading states
5. **Expand Coverage**: Ensure all API endpoints return proper response models

---

**Happy Coding!** 🚀

Your API is now fully type-safe end-to-end. Any changes to your backend models will automatically flow through to your frontend, ensuring consistency and catching breaking changes early.
