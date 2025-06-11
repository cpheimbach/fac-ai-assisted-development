**IMPORTANT FOR CLAUDE: Reference this file before implementing anything**

# Project: Travel Planning App

## Project Overview

A travel planning web application focused on trip management with integrated weather checking functionality. Built as a demo project for AI-assisted development workshop using TypeScript, React Router v7, and modern web technologies. Prioritizes working demonstration over perfect architecture.

## Tech Stack

- Languages: TypeScript (strict mode enabled)
- Frontend: React 18+ with React Router v7
- Backend: React Router v7 server functions (Node.js)
- Styling: CSS Modules
- Package Manager: pnpm
- Database: In-memory store with file persistence
- External APIs: Weather service integration

## Code Style & Conventions

### Import/Module Standards

- Use ES6 imports exclusively
- Group imports: React/external → internal → relative imports
- Use absolute imports from `src/` root for cross-domain references
- Keep imports organized alphabetically within groups

```typescript
// External
import React from 'react'
import { useNavigate } from '@remix-run/react'

// Internal
import { Trip } from '~/domains/trip-management/types/trip'
import { WeatherService } from '~/domains/weather/services/weatherService'

// Relative
import './TripCard.module.css'
```

### Naming Conventions

- **Components**: PascalCase (`TripCard`, `WeatherWidget`)
- **Functions/Variables**: camelCase (`createTrip`, `weatherData`)
- **Types/Interfaces**: PascalCase (`Trip`, `WeatherData`)
- **Files**: Match export names (`TripCard.tsx`, `weatherService.ts`)
- **CSS Classes**: camelCase in modules (`tripCard`, `weatherWidget`)
- **Constants**: camelCase (avoid SCREAMING_SNAKE_CASE for simplicity)

### Patterns to Follow

- **Domain-driven structure**: Flat domains with related functionality grouped
- **Functional components**: Use custom hooks for logic extraction
- **Direct CRUD operations**: No abstraction layers for demo simplicity
- **Try-catch error handling**: Standard JavaScript patterns with React error boundaries
- **CSS Modules**: Scoped styling without CSS-in-JS complexity

## Development Workflow

- Branch strategy: Feature branches off main
- Commit message format: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- PR requirements: Working demo functionality, basic tests passing

## Testing Strategy

- Test framework: Jest with React Testing Library
- Coverage requirements: Basic unit tests for core CRUD operations
- Test naming: `describe('ComponentName')` and `test('should do something')`
- Focus: Test business logic and user interactions, not implementation details

## Environment Setup

- Node.js 18+ required
- pnpm package manager
- No environment variables required for basic demo
- Local file-based data storage

## Common Commands

```bash
# Build command
pnpm build

# Test command
pnpm test

# Lint command
pnpm lint

# Type check command
pnpm tsc

# Development server
pnpm dev
```

## Project Structure

Key directories and their purpose:

- `/src/domains` - Domain-driven flat structure (trip-management, weather, shared)
- `/src/data` - In-memory store and persistence logic
- `/src/styles` - Global CSS and component-specific modules
- `/src/app` - React Router v7 application root and routing
- `/docs` - Generated documentation and specifications

## Review Process Guidelines

Before submitting any code, ensure the following steps are completed:

1. **Run all lint, check and test commands**

2. **Review outputs and iterate until all issues are resolved**

3. **Assess compliance**:
   For each standard, explicitly state ✅ or ❌ and explain why:

   - Code style and formatting (ESLint + Prettier)
   - Naming conventions (simple consistent approach)
   - Architecture patterns (refer to `ARCHITECTURE.md`)
   - Error handling (try-catch with boundaries)
   - Test coverage (basic unit tests)
   - Documentation (comprehensive docs)

4. **Self-review checklist**:
   - [ ] Code follows defined patterns
   - [ ] No debug/commented code
   - [ ] Error handling implemented
   - [ ] Tests written and passing
   - [ ] Documentation updated
   - [ ] Demo functionality works end-to-end

## Development Principles

**Demo-focused development**: Working > perfect, clear examples, easy to understand and modify quickly

- Prioritize functionality over optimization
- Clear, readable code over clever solutions
- Comprehensive documentation for learning value
- Maintain professional quality suitable for presentation

## Known Issues & Workarounds

- Weather API rate limiting: Implement client-side caching (30-minute TTL)
- File persistence: No concurrent access handling in demo version
- Type safety: Strict TypeScript may require more setup time but improves reliability

## References

- [React Router v7 Documentation](https://reactrouter.com/en/main)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Conventional Commits](https://www.conventionalcommits.org/)
- Workshop specifications: `FUNCTIONAL.md`, `ARCHITECTURE.md`
