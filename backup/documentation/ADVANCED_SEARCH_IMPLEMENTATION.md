# Advanced Search & Filtering System Implementation

## Overview

The Advanced Search & Filtering system provides comprehensive search capabilities across all entities in the MSSP Client Management platform. This system includes global search, saved searches, quick filters, and an advanced query builder that allows business users to create complex searches without technical knowledge.

## Features Implemented

### 1. Global Search
- **Cross-Entity Search**: Search across clients, contracts, services, financial transactions, users, hardware assets, SAFs, and COCs from one interface
- **Real-time Results**: Instant search results with debounced input (300ms delay)
- **Relevance Scoring**: Advanced algorithm that ranks results by relevance with exact matches getting highest scores
- **Keyboard Shortcuts**: `Cmd/Ctrl + K` to focus search, `Escape` to close
- **Mobile Responsive**: Dedicated mobile search overlay with touch-friendly interface

### 2. Advanced Query Builder
- **Visual Interface**: Drag-and-drop style condition builder with dropdown selectors
- **Entity-Specific Fields**: Dynamic field options based on selected entity type
- **Multiple Operators**: Support for contains, equals, starts_with, ends_with, greater_than, less_than, between, and date-specific operators
- **Data Type Support**: Text, number, date, boolean, and select field types
- **Complex Conditions**: Multiple conditions with AND logic
- **Real-time Validation**: Input validation based on field types and operators

### 3. Saved Searches
- **Personal & Public**: Save searches for personal use or share with team
- **Quick Filters**: Mark frequently used searches as quick filters for one-click access
- **Usage Analytics**: Track how often searches are used and when they were last executed
- **Tagging System**: Organize searches with custom tags
- **Search History**: Automatic logging of all search activities with performance metrics

### 4. Quick Filters (Presets)
- **Active Clients**: Find all clients with active status
- **Expiring Contracts**: Contracts expiring in the next 30 days
- **High Value Contracts**: Contracts over $100,000
- **Recent Activity**: Items created in the last 7 days
- **Custom Quick Filters**: Users can create and share their own quick filters

## Technical Implementation

### Database Schema

```sql
-- Saved searches table
CREATE TABLE saved_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  search_config TEXT NOT NULL, -- JSON string
  entity_types TEXT[] NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_quick_filter BOOLEAN NOT NULL DEFAULT false,
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMP,
  tags TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Search history for analytics
CREATE TABLE search_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  search_query TEXT NOT NULL,
  search_config TEXT, -- JSON string
  entity_types TEXT[] NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  execution_time INTEGER, -- milliseconds
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Global search index for performance
CREATE TABLE global_search_index (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  search_content TEXT NOT NULL,
  keywords TEXT[],
  last_indexed TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### API Endpoints

#### Search Execution
```typescript
POST /api/search/execute
{
  globalQuery?: string,
  conditions: SearchCondition[],
  entityTypes: string[],
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  limit?: number
}
```

#### Saved Searches
```typescript
GET /api/search/saved          // Get user's saved searches
POST /api/search/save          // Save a new search
PUT /api/search/saved/:id      // Update saved search
DELETE /api/search/saved/:id   // Delete saved search
```

#### Search History
```typescript
GET /api/search/history?limit=10   // Get recent searches
```

#### Index Management
```typescript
POST /api/search/index/rebuild     // Rebuild search index (admin only)
```

### Frontend Components

#### Core Components
1. **AdvancedSearch** (`/components/ui/advanced-search.tsx`)
   - Main search interface with tabbed layout
   - Global search, query builder, saved searches, and quick filters
   - Responsive design with mobile support

2. **GlobalSearchHeader** (`/components/ui/global-search-header.tsx`)
   - Header search component for navigation bar
   - Quick search with dropdown results
   - Keyboard shortcut support

3. **SearchPage** (`/pages/search-page.tsx`)
   - Dedicated search page with analytics
   - Search history and saved searches management
   - Search performance metrics

### Search Algorithm

#### Relevance Scoring
```typescript
function calculateRelevanceScore(result: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  // Title exact match gets highest score
  if (result.title?.toLowerCase().includes(queryLower)) {
    score += 1.0;
    if (result.title.toLowerCase() === queryLower) {
      score += 0.5; // Bonus for exact match
    }
  }

  // Subtitle match gets medium score
  if (result.subtitle?.toLowerCase().includes(queryLower)) {
    score += 0.7;
  }

  // Description match gets lower score
  if (result.description?.toLowerCase().includes(queryLower)) {
    score += 0.3;
  }

  // Word boundary matches get bonus
  const titleWords = result.title?.toLowerCase().split(' ') || [];
  if (titleWords.includes(queryLower)) {
    score += 0.3;
  }

  return Math.min(score, 1.0); // Cap at 1.0
}
```

#### Query Building
The system supports multiple operators for different data types:

- **Text**: contains, equals, starts_with, ends_with, not_contains
- **Number**: equals, greater_than, less_than, between
- **Date**: equals, before, after, between, last_7_days, last_30_days, this_month, this_year
- **Boolean**: equals (true/false)
- **Select**: equals, not_equals, in (multiple values)

## Performance Optimizations

### 1. Database Indexing
```sql
-- Full-text search indexes
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('english', name || ' ' || COALESCE(industry, '') || ' ' || COALESCE(notes, '')));
CREATE INDEX idx_contracts_search ON contracts USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Regular indexes for common searches
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_contracts_status_dates ON contracts(status, start_date, end_date);
CREATE INDEX idx_search_history_user_date ON search_history(user_id, created_at DESC);
```

### 2. Search Caching
- Global search results cached for 5 minutes
- Popular query results cached longer
- Search analytics computed daily and cached

### 3. Query Optimization
- Limit results per entity type to prevent overwhelming responses
- Use EXPLAIN ANALYZE to optimize complex queries
- Implement pagination for large result sets

## Security Features

### 1. Access Control
- Users can only see their own saved searches unless marked public
- Admin-only endpoints for index management
- Role-based filtering of search results

### 2. Input Validation
- SQL injection prevention through parameterized queries
- Input sanitization for all search terms
- Rate limiting on search endpoints

### 3. Data Privacy
- Search history is user-specific
- Sensitive fields can be excluded from search results
- Audit logging of all search activities

## User Experience Features

### 1. Keyboard Navigation
- `⌘K` or `Ctrl+K` to open global search
- `Escape` to close search interfaces
- Arrow keys to navigate search results
- `Enter` to select highlighted result

### 2. Mobile Experience
- Touch-friendly search interface
- Swipe gestures for quick filters
- Responsive design that works on all screen sizes
- Progressive Web App support

### 3. Search Suggestions
- Auto-complete based on search history
- Popular search suggestions
- Smart field suggestions based on entity type

## Analytics & Reporting

### 1. Search Metrics
- Total searches performed
- Most popular search queries
- Search success rate (clicks on results)
- Average search execution time

### 2. User Behavior
- Search patterns by user
- Most searched entity types
- Time-based search trends
- Saved search usage statistics

### 3. Performance Monitoring
- Query execution times
- Index effectiveness
- Cache hit rates
- Error rates and types

## Future Enhancements

### 1. AI-Powered Search
- Natural language query processing
- Smart search suggestions based on context
- Automatic query expansion
- Machine learning for relevance optimization

### 2. Advanced Filtering
- Faceted search with filter counts
- Range sliders for numeric values
- Date range picker with presets
- Geographic search for location-based data

### 3. Search Collaboration
- Shared search workspaces
- Search result annotations
- Team search templates
- Search result export/sharing

### 4. Integration Features
- External system search integration
- API for third-party search tools
- Webhook notifications for saved search results
- Scheduled search reports

## Testing Strategy

### 1. Unit Tests
- Search algorithm accuracy
- Query builder logic
- Input validation
- Security measures

### 2. Integration Tests
- End-to-end search workflows
- Database query performance
- API endpoint functionality
- Cross-browser compatibility

### 3. Performance Tests
- Large dataset search performance
- Concurrent user search load
- Memory usage optimization
- Cache effectiveness

### 4. User Acceptance Tests
- Search result relevance
- User interface usability
- Mobile experience quality
- Accessibility compliance

## Deployment Considerations

### 1. Environment Setup
- Search index initialization
- Database migration scripts
- Configuration for different environments
- Performance monitoring setup

### 2. Monitoring
- Search performance dashboards
- Error rate alerting
- Usage analytics tracking
- System health checks

### 3. Maintenance
- Regular index optimization
- Search analytics cleanup
- Performance tuning
- Security updates

This Advanced Search & Filtering system provides a powerful, user-friendly search experience that scales with your MSSP business needs while maintaining high performance and security standards. 