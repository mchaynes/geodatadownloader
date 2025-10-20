# GitHub Copilot Instructions for geodatadownloader

## Project Overview

geodatadownloader.com (GDD) is a client-side browser application that downloads data from ArcGIS feature layers. It runs entirely in the browser with no backend, using CDN for serving static assets.

### Key Features
- Downloads data from ArcGIS feature layers without max query size limitations
- Supports custom extents and column selection
- Exports to multiple formats: GeoJSON, CSV, SHP, GPKG, KML, GPX, PGDUMP, DXF, SQLite
- Client-side conversion using GDAL WebAssembly
- Uses ESRI JavaScript library for map rendering

## Tech Stack

### Core Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Material-UI (MUI), Flowbite
- **Maps**: ArcGIS API for JavaScript (@arcgis/core)
- **Data Processing**: GDAL3.js (WebAssembly), Terraformer
- **Backend**: Supabase (auth and database)
- **Monitoring**: Sentry for error tracking, Hotjar for analytics

### Testing & Quality
- **Unit Testing**: Jest with ts-jest
- **E2E Testing**: Cypress
- **Linting**: ESLint with TypeScript plugin
- **Type Checking**: TypeScript with strict null checks

## Code Style & Standards

### TypeScript Configuration
- Target: ESNext
- Module: ES2020
- JSX: react-jsx
- Strict null checks enabled
- No implicit any allowed (but currently disabled in eslint - see .eslintrc.cjs)
- No implicit returns/this required

### ESLint Rules
- Use `_` prefix for intentionally unused variables/arguments
- Warnings (not errors) for unused vars to allow work-in-progress code
- Empty functions allowed in test harnesses
- `require()` allowed in config files

### Code Conventions
- Use functional React components with hooks
- Prefer TypeScript types over interfaces where appropriate
- Use async/await over Promise chains
- Follow existing file organization patterns (app/ for main code, routes/ for routing)

## Architecture Patterns

### Data Flow
1. User provides ArcGIS feature service URL
2. App queries for all ObjectIDs using `where: 1=1` with `returnOnlyObjectIds=true`
3. ObjectIDs paginated into chunks of 500
4. Features fetched using `where: OBJECTID IN (...)` queries
5. Data converted client-side using GDAL3.js or custom writers
6. Output downloaded as selected format

### Key Files & Directories
- `app/` - Main application code
  - `arcgis.ts` - ArcGIS API integration
  - `downloader.ts` - Core download logic
  - `gdal.ts` - GDAL WebAssembly wrapper
  - `writer.ts` - File format writers
  - `database.ts` - Supabase integration
  - `routes/` - React Router routes
- `src/` - Legacy source files (being migrated from)
- `supabase/` - Database migrations and config
- `cypress/` - E2E tests

### State Management
- React hooks for local state
- React Router for navigation
- Supabase client for backend state

## Development Workflow

### Commands
```bash
npm install                 # Install dependencies
npm start                  # Dev server on port 3000
npm run build              # Production build
npm run lint               # Run ESLint
npm test                   # Run Jest tests
npm run cy:open            # Open Cypress UI
npm run cy:run             # Run Cypress tests
```

### Environment Setup
- Node version specified in `.nvmrc`
- Requires PUPPETEER_SKIP_DOWNLOAD=true and CYPRESS_INSTALL_BINARY=0 in CI/restricted environments

### Testing Guidelines
- Write tests in `app/__tests__/` directory
- Use React Testing Library for component tests
- Mock external dependencies (ArcGIS, GDAL)
- Test files should match pattern: `*.test.ts` or `*.test.tsx`
- Cypress E2E tests in `cypress/e2e/`

## Important Considerations

### Browser Compatibility
- Code runs entirely in browser (no Node.js runtime)
- Must support modern browsers (see browserslist in package.json)
- WebAssembly support required for GDAL

### Performance
- Handle large datasets (millions of features)
- Paginate requests to avoid memory issues
- Use web workers for heavy processing where possible
- Monitor memory usage with large downloads

### Security
- No sensitive data should be committed
- All processing happens client-side
- Supabase handles authentication
- Sentry configured for error reporting (credentials in environment)

### Dependencies
- Keep @arcgis/core version compatible with TypeScript types
- GDAL3.js files must be copied to build output (see vite.config.ts)
- WebAssembly files (.wasm, .data) need special handling in build

## Common Tasks

### Adding a New Export Format
1. Add format to `Formats` enum in `app/types.ts`
2. Implement writer in `app/writer.ts`
3. Update UI in relevant components
4. Add tests for new format
5. Update database schema if needed

### Working with ArcGIS API
- Use `@arcgis/core` imports, not legacy `esri-loader`
- Handle geometry types: Extent, Polygon, Point, Polyline
- Always specify spatial reference when creating geometries
- Real URL pattern: `${url}/${layerId}`

### Database Changes
- Update types in `app/database.types.ts` after schema changes
- Run migrations in `supabase/migrations/`
- Update seed data in `supabase/seed.sql` for testing
- Regenerate types: `npx supabase gen types typescript`

## Debugging Tips

### Common Issues
- **Build failures**: Check that GDAL files are being copied correctly
- **Type errors**: Ensure database types are up to date
- **ArcGIS errors**: Verify URL format and layer permissions
- **Memory issues**: Check pagination and chunk sizes

### Helpful Tools
- Browser DevTools for client-side debugging
- React DevTools for component inspection
- Vite dev server provides HMR for fast iteration
- ESLint warnings indicate potential issues

## External Resources

- [ArcGIS API for JavaScript Documentation](https://developers.arcgis.com/javascript/)
- [GDAL Documentation](https://gdal.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
