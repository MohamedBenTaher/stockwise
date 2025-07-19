<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# StockWise Frontend Development Instructions

This is a React + TypeScript frontend application for StockWise, an AI-powered portfolio dashboard.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts (when needed)

## Code Style & Best Practices

- Use TypeScript with strict type checking
- Follow React functional components with hooks
- Use async/await for API calls
- Implement proper error handling and loading states
- Use TailwindCSS utility classes for styling
- Keep components modular and reusable
- Use proper TypeScript interfaces from `/src/types`

## API Integration

- All API calls should go through `/src/services/api.ts`
- Use the predefined API functions for backend communication
- Handle authentication tokens automatically via axios interceptors
- Backend API base URL: `http://localhost:8000/api/v1`

## Component Structure

- `/src/components` - Reusable UI components
- `/src/contexts` - React contexts (auth, etc.)
- `/src/services` - API services and utilities
- `/src/types` - TypeScript interfaces and types

## Authentication

- Uses JWT tokens stored in localStorage
- AuthContext provides user state and auth functions
- Protected routes redirect to `/auth` if not authenticated

## Styling Guidelines

- Use TailwindCSS utility classes
- Custom components use `.card`, `.button-primary`, `.button-secondary`, `.input-field` classes
- Follow consistent spacing and color scheme
- Responsive design with mobile-first approach

## Key Features to Implement

- Portfolio dashboard with charts and metrics
- Holdings management (CRUD operations)
- AI-powered insights display
- Risk analysis with heatmaps
- Real-time data updates
- Responsive design for all screen sizes

When suggesting code, prioritize:

1. Type safety with TypeScript
2. Modern React patterns (hooks, functional components)
3. Accessibility best practices
4. Performance optimization
5. Clean, readable code structure
