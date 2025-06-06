# External Data Integration API Documentation

This document describes the external data integration API endpoints that bridge the integration engine with the main dashboard system.

## Base URL
```
/api/integration-engine/external-data
```

## Authentication
All endpoints require authentication. Include the session token in your requests.

## Overview
The External Data Integration API provides comprehensive endpoints for:
- Data source management (CRUD operations)
- External data retrieval and aggregation
- Dashboard integration and widget data
- Real-time streaming and polling
- System health monitoring
- Data transformation and synchronization

## Data Source Management Endpoints

### List Data Sources
**GET** `/api/integration-engine/external-data?action=list-sources`

Lists all configured data sources with optional filtering and statistics.

**Query Parameters:**
- `type` (optional): Filter by data source type
- `status` (optional): Filter by status (`active`, `inactive`, `error`, `all`)
- `includeStats` (optional): Include statistics (`true`/`false`, default: `true`)

**Response:**
```json
{
  "sources": [
    {
      "id": 1,
      "name": "SIEM Data Source",
      "description": "Security Information and Event Management data",
      "type": "api",
      "apiEndpoint": "https://siem.example.com/api/events",
      "authType": "bearer",
      "syncFrequency": "hourly",
      "status": "active",
      "isActive": true,
      "lastSyncAt": "2024-01-15T10:30:00Z",
      "lastConnected": "2024-01-15T10:30:00Z",
      "stats": {
        "recordCount": 1250,
        "lastSync": "2024-01-15T10:30:00Z",
        "avgSyncTime": 45.2
      }
    }
  ],
  "summary": {
    "total": 5,
    "active": 4,
    "byType": {
      "api": 3,
      "database": 2
    },
    "byStatus": {
      "active": 4,
      "inactive": 1
    }
  }
}
```

### Get Data Source Details
**GET** `/api/integration-engine/external-data?action=source-details&dataSourceId={id}`

Retrieves detailed information about a specific data source including mappings, recent data, and metrics.

**Query Parameters:**
- `dataSourceId` (required): ID of the data source

**Response:**
```json
{
  "source": {
    "id": 1,
    "name": "SIEM Data Source",
    "type": "api",
    "apiEndpoint": "https://siem.example.com/api/events",
    "status": "active"
  },
  "mappings": [
    {
      "id": 1,
      "sourceField": "event_id",
      "targetField": "eventId",
      "dataType": "integer"
    }
  ],
  "recentData": [
    {
      "id": 1,
      "mappedData": {"eventId": 12345, "severity": "high"},
      "syncedAt": "2024-01-15T10:30:00Z",
      "originalDataPreview": "{\"event_id\": 12345, \"severity\": \"high\"...}"
    }
  ],
  "widgets": [],
  "metrics": {
    "totalRecords": 1250,
    "lastSync": "2024-01-15T10:30:00Z",
    "firstSync": "2024-01-01T00:00:00Z",
    "avgRecordsPerSync": 25.5
  },
  "connectionStatus": {
    "lastConnected": "2024-01-15T10:30:00Z",
    "isHealthy": true,
    "nextSync": "2024-01-15T11:30:00Z"
  }
}
```

### Create Data Source
**POST** `/api/integration-engine/external-data?action=create-source`

Creates a new data source configuration.

**Request Body:**
```json
{
  "name": "New API Data Source",
  "description": "Description of the data source",
  "type": "api",
  "apiEndpoint": "https://api.example.com/data",
  "authType": "bearer",
  "authConfig": {
    "token": "your-bearer-token"
  },
  "syncFrequency": "hourly",
  "config": {
    "timeout": 30000,
    "retries": 3
  }
}
```

**Response:**
```json
{
  "source": {
    "id": 6,
    "name": "New API Data Source",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Data source created successfully"
}
```

### Test Data Source Connection
**POST** `/api/integration-engine/external-data?action=test-source`

Tests the connection to a data source.

**Request Body:**
```json
{
  "dataSourceId": 1
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Connection successful",
  "responseTime": 1234,
  "sampleData": "{\"status\": \"ok\", \"data\": [...]}",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## External Data Management Endpoints

### Get External Data
**GET** `/api/integration-engine/external-data?action=external-data`

Retrieves external data records with pagination and filtering.

**Query Parameters:**
- `dataSourceId` (optional): Filter by data source ID
- `limit` (optional): Number of records to return (default: 100)
- `offset` (optional): Number of records to skip (default: 0)
- `sortBy` (optional): Field to sort by (`syncedAt`, `createdAt`)
- `sortOrder` (optional): Sort order (`asc`, `desc`)
- `dateRange` (optional): JSON string with `start` and `end` dates

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "dataSourceId": 1,
      "mappedData": {"eventId": 12345, "severity": "high"},
      "syncedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "originalDataPreview": "{\"event_id\": 12345...}"
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get External Data Aggregation
**GET** `/api/integration-engine/external-data?action=external-aggregation`

Performs aggregations on external data.

**Query Parameters:**
- `dataSourceId` (required): Data source ID
- `aggregationType` (optional): `count`, `sum`, `average`, `distinct`
- `field` (optional): Field to aggregate (required for sum/average)
- `groupBy` (optional): Field to group by or time period (`hour`, `day`, `week`)
- `timeRange` (optional): Time range (`1h`, `24h`, `7d`, `30d`)

**Response:**
```json
{
  "value": 1250,
  "groupedData": [
    {
      "group": "2024-01-15",
      "count": 125,
      "value": 125
    }
  ],
  "metadata": {
    "dataSourceId": 1,
    "aggregationType": "count",
    "timeRange": "24h",
    "totalRecords": 1250,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get External Time Series
**GET** `/api/integration-engine/external-data?action=external-time-series`

Retrieves time series data for charts and trends.

**Query Parameters:**
- `dataSourceId` (required): Data source ID
- `field` (optional): Field to aggregate
- `interval` (optional): Time interval (`minute`, `hour`, `day`)
- `timeRange` (optional): Time range (`1h`, `24h`, `7d`, `30d`)
- `aggregation` (optional): Aggregation type (`count`, `sum`, `average`)

**Response:**
```json
{
  "timeSeries": [
    {
      "timestamp": "2024-01-15T00:00:00Z",
      "value": 125,
      "recordCount": 125
    },
    {
      "timestamp": "2024-01-15T01:00:00Z",
      "value": 98,
      "recordCount": 98
    }
  ],
  "metadata": {
    "dataSourceId": 1,
    "interval": "hour",
    "timeRange": "24h",
    "aggregation": "count",
    "totalPoints": 24,
    "startTime": "2024-01-14T10:30:00Z",
    "endTime": "2024-01-15T10:30:00Z"
  }
}
```

## Dashboard Integration Endpoints

### Get Dashboard Data
**GET** `/api/integration-engine/external-data?action=dashboard-data`

Retrieves comprehensive dashboard data including data sources, external systems, and widgets.

**Query Parameters:**
- `cardType` (optional): Filter by card type
- `includeExternal` (optional): Include external systems (`true`/`false`)
- `refreshInterval` (optional): Preferred refresh interval in milliseconds

**Response:**
```json
{
  "dataSources": [
    {
      "id": 1,
      "name": "SIEM Data Source",
      "type": "api",
      "syncFrequency": "hourly",
      "lastSyncAt": "2024-01-15T10:30:00Z",
      "recordCount": 1250
    }
  ],
  "externalSystems": [
    {
      "id": 1,
      "name": "External SIEM",
      "type": "siem",
      "status": "healthy",
      "lastHealthCheck": "2024-01-15T10:25:00Z"
    }
  ],
  "widgets": [],
  "summary": {
    "totalDataSources": 5,
    "totalRecords": 5430,
    "externalSystemsTotal": 3,
    "healthySystemsCount": 3,
    "systemHealthPercentage": 100,
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "refreshMetadata": {
    "recommendedInterval": 300000,
    "lastDataSync": "2024-01-15T10:30:00Z"
  }
}
```

### Get Widget Data
**GET** `/api/integration-engine/external-data?action=widget-data`

Retrieves processed data for dashboard widgets.

**Query Parameters:**
- `widgetId` (optional): Widget ID (either widgetId or dataSourceId required)
- `dataSourceId` (optional): Data source ID
- `aggregation` (optional): Aggregation type (`count`, `sum`, `average`)
- `timeRange` (optional): Time range (`1h`, `24h`, `7d`, `30d`)
- `format` (optional): Format type (`number`, `currency`, `percentage`, `compact`)
- `includeTrend` (optional): Include trend data (`true`/`false`)

**Response:**
```json
{
  "value": 1250,
  "formatted": "1,250",
  "trend": {
    "direction": "up",
    "percentage": 15.2,
    "value": 165,
    "currentValue": 1250,
    "previousValue": 1085
  },
  "metadata": {
    "dataSourceId": 1,
    "aggregation": "count",
    "timeRange": "24h",
    "recordCount": 1250,
    "lastUpdate": 1705310400000,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Usage Examples

### React Hook Usage
```typescript
import { useExternalDataIntegration } from '@/hooks/use-external-data-integration';

function MyComponent() {
  const {
    dataSources,
    isLoading,
    fetchDataSources,
    getExternalAggregation,
    getWidgetData
  } = useExternalDataIntegration();

  useEffect(() => {
    fetchDataSources({ includeStats: true });
  }, [fetchDataSources]);

  const handleGetAggregation = async () => {
    try {
      const data = await getExternalAggregation({
        dataSourceId: 1,
        aggregationType: 'count',
        timeRange: '24h'
      });
      console.log('Aggregation result:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {dataSources.map(source => (
        <div key={source.id}>{source.name}</div>
      ))}
    </div>
  );
}
```

### Direct API Usage
```typescript
// Fetch data sources
const response = await fetch('/api/integration-engine/external-data?action=list-sources&includeStats=true');
const data = await response.json();

// Get aggregation data
const aggResponse = await fetch('/api/integration-engine/external-data?action=external-aggregation&dataSourceId=1&aggregationType=count&timeRange=24h');
const aggData = await aggResponse.json();

// Create new data source
const createResponse = await fetch('/api/integration-engine/external-data?action=create-source', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Data Source',
    type: 'api',
    apiEndpoint: 'https://api.example.com/data',
    authType: 'bearer',
    authConfig: { token: 'your-token' }
  })
});
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Real-time Features

### Polling
Use the `useExternalDataIntegration` hook's polling features:

```typescript
const { startPolling, stopPolling } = useExternalDataIntegration();

// Start polling every 30 seconds
const cleanup = startPolling(async () => {
  await fetchDataSources();
}, 30000);

// Stop polling
cleanup();
```

### Auto-refresh
Enable automatic dashboard refresh:

```typescript
const { autoRefresh, setAutoRefresh } = useExternalDataIntegration();

// Enable auto-refresh (polls every minute)
setAutoRefresh(true);

// Disable auto-refresh
setAutoRefresh(false);
```

## Best Practices

1. **Rate Limiting**: Be mindful of API rate limits, especially for real-time polling
2. **Error Handling**: Always implement proper error handling for API calls
3. **Pagination**: Use pagination parameters for large datasets
4. **Caching**: Consider caching frequently accessed data
5. **Authentication**: Ensure proper authentication for all requests
6. **Monitoring**: Monitor API performance and external system health

## Security Considerations

1. All API endpoints require authentication
2. Sensitive authentication data is encrypted in storage
3. External API credentials are stored securely
4. Rate limiting prevents abuse
5. Input validation prevents injection attacks
6. Audit logging tracks all data access

## Integration with Main Dashboard

The external data integration seamlessly integrates with the main dashboard system:

1. **Data Sources** are automatically available for dashboard cards
2. **Widget Data** can be displayed in real-time dashboard widgets
3. **Aggregations** power dashboard metrics and KPIs
4. **Time Series** data feeds dashboard charts
5. **Health Monitoring** provides system status indicators

This API provides the foundation for creating powerful, data-driven dashboards that combine internal and external data sources in a unified interface. 