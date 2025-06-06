import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Plus, Settings, Database, Zap, Eye, Trash2, Edit, Play, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/app-layout';
import { VirtualTable } from '@/components/ui/virtual-table';
import { usePaginatedData } from '@/hooks/use-paginated-data';

interface DataSource {
  id: number;
  name: string;
  description?: string;
  apiEndpoint: string;
  authType: string;
  authConfig: any;
  isActive: boolean;
  lastSyncAt?: string;
  syncFrequency: string;
  defaultPageSize?: number;
  maxPageSize?: number;
  supportsPagination?: boolean;
  paginationType?: string;
  createdAt: string;
}

interface DataSourceMapping {
  id: number;
  dataSourceId: number;
  sourceField: string;
  targetField: string;
  fieldType: string;
  isRequired: boolean;
  defaultValue?: string;
  transformation?: string;
}

interface IntegratedData {
  id: number;
  dataSourceId: number;
  rawData: any;
  mappedData: any;
  syncedAt: string;
  recordIdentifier?: string;
}

interface DashboardWidget {
  id: number;
  name: string;
  type: string;
  dataSourceId?: number;
  config: any;
  isActive: boolean;
  createdAt: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export default function IntegrationEnginePage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [mappings, setMappings] = useState<DataSourceMapping[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(false);
  const [sampleData, setSampleData] = useState<any>(null);
  const [showAddDataSource, setShowAddDataSource] = useState(false);
  const [showAddMapping, setShowAddMapping] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeTab, setActiveTab] = useState('sources');
  const [showRawJson, setShowRawJson] = useState(false);
  const { toast } = useToast();

  // Pagination configuration for data source setup
  const [paginationConfig, setPaginationConfig] = useState({
    defaultPageSize: 100,
    maxPageSize: 1000,
    supportsPagination: true,
    paginationType: 'offset'
  });

  // Form states
  const [newDataSource, setNewDataSource] = useState({
    name: '',
    description: '',
    type: 'api',
    apiEndpoint: '',
    authType: 'api_key',
    authConfig: {},
    syncFrequency: 'manual',
    ...paginationConfig
  });

  const [newMapping, setNewMapping] = useState({
    sourceField: '',
    targetField: '',
    fieldType: 'string',
    isRequired: false,
    defaultValue: ''
  });

  const [newWidget, setNewWidget] = useState({
    name: '',
    description: '',
    type: 'chart',
    dataSourceId: '',
    config: {}
  });

  // Edit widget state
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [showEditWidget, setShowEditWidget] = useState(false);

  // Paginated data for integrated data
  const fetchIntegratedData = useCallback(async (params: PaginationParams) => {
    if (!selectedDataSource) {
      throw new Error('No data source selected');
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // Add filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }

    const response = await fetch(`/api/data-sources/${selectedDataSource.id}/data?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch integrated data');
    }
    
    return response.json();
  }, [selectedDataSource]);

  const {
    data: integratedData,
    loading: dataLoading,
    currentPage,
    pageSize,
    totalRecords,
    sortBy,
    sortOrder,
    filters,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    refresh: refreshIntegratedData
  } = usePaginatedData(fetchIntegratedData, {
    initialPageSize: selectedDataSource?.defaultPageSize || 100,
    autoFetch: false // We'll manually trigger when data source is selected
  });

  // Columns for the integrated data table
  const integratedDataColumns = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80
    },
    {
      key: 'recordIdentifier',
      label: 'Record ID',
      sortable: true,
      filterable: true,
      width: 150
    },
    {
      key: 'syncedAt',
      label: 'Synced At',
      sortable: true,
      filterable: true,
      render: (value: string) => new Date(value).toLocaleString(),
      width: 180
    },
    {
      key: 'mappedData',
      label: 'Mapped Data',
      render: (value: any) => (
        <div className="max-w-xs truncate">
          {JSON.stringify(value)}
        </div>
      ),
      width: 300
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: IntegratedData) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSampleData(row.rawData);
              setShowRawJson(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteIntegratedRecord(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: 120
    }
  ], []);

  // Track previous data source ID to prevent unnecessary refreshes
  const prevDataSourceId = useRef<number | null>(null);

  useEffect(() => {
    fetchDataSources();
    fetchWidgets();
  }, []);

  useEffect(() => {
    if (selectedDataSource) {
      fetchMappings(selectedDataSource.id);
      // Only refresh if this is a new data source selection
      if (selectedDataSource.id !== prevDataSourceId.current) {
        prevDataSourceId.current = selectedDataSource.id;
        // Manually trigger refresh after a short delay to ensure data source is set
        const timer = setTimeout(() => {
          refreshIntegratedData();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedDataSource]);

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources');
      if (response.ok) {
        const data = await response.json();
        setDataSources(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data sources",
        variant: "destructive"
      });
    }
  };

  const fetchMappings = async (dataSourceId: number) => {
    try {
      const response = await fetch(`/api/data-sources/${dataSourceId}/mappings`);
      if (response.ok) {
        const data = await response.json();
        setMappings(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch mappings",
        variant: "destructive"
      });
    }
  };

  const fetchWidgets = async () => {
    try {
      const response = await fetch('/api/dashboard-widgets');
      if (response.ok) {
        const data = await response.json();
        setWidgets(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch widgets",
        variant: "destructive"
      });
    }
  };

  const testConnection = async (dataSource: DataSource) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data-sources/${dataSource.id}/test`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        setSampleData(result.sampleData);
        toast({
          title: "Success",
          description: "Connection test successful"
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (dataSource: DataSource, paginationParams?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data-sources/${dataSource.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 1,
          limit: dataSource.defaultPageSize || 100,
          ...paginationParams
        })
      });
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Synced ${result.recordsProcessed} records${result.totalRecords ? ` of ${result.totalRecords} total` : ''}`
        });
        if (selectedDataSource?.id === dataSource.id) {
          refreshIntegratedData();
        }
      } else {
        toast({
          title: "Sync Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteIntegratedRecord = async (recordId: number) => {
    try {
      const response = await fetch(`/api/integrated-data/${recordId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Record deleted successfully"
        });
        refreshIntegratedData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const createDataSource = async () => {
    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDataSource)
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Data source created successfully"
        });
        setShowAddDataSource(false);
        setNewDataSource({
          name: '',
          description: '',
          type: 'api',
          apiEndpoint: '',
          authType: 'api_key',
          authConfig: {},
          syncFrequency: 'manual',
          ...paginationConfig
        });
        fetchDataSources();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create data source",
        variant: "destructive"
      });
    }
  };

  const createMapping = async () => {
    if (!selectedDataSource) return;
    
    try {
      const response = await fetch(`/api/data-sources/${selectedDataSource.id}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMapping)
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Field mapping created successfully"
        });
        setShowAddMapping(false);
        setNewMapping({
          sourceField: '',
          targetField: '',
          fieldType: 'string',
          isRequired: false,
          defaultValue: ''
        });
        fetchMappings(selectedDataSource.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create mapping",
        variant: "destructive"
      });
    }
  };

  const deleteMapping = async (mappingId: number) => {
    if (!selectedDataSource) return;
    
    if (!confirm('Are you sure you want to delete this field mapping?')) return;
    
    try {
      const response = await fetch(`/api/data-source-mappings/${mappingId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Field mapping deleted successfully"
        });
        fetchMappings(selectedDataSource.id);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete mapping",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mapping",
        variant: "destructive"
      });
    }
  };

  const createWidget = async () => {
    try {
      const response = await fetch('/api/dashboard-widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWidget,
          dataSourceId: parseInt(newWidget.dataSourceId)
        })
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Widget created successfully"
        });
        setShowAddWidget(false);
        setNewWidget({
          name: '',
          description: '',
          type: 'chart',
          dataSourceId: '',
          config: {}
        });
        fetchWidgets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create widget",
        variant: "destructive"
      });
    }
  };

  const editWidget = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setNewWidget({
      name: widget.name,
      description: widget.config.description || '',
      type: widget.type,
      dataSourceId: widget.dataSourceId?.toString() || '',
      config: widget.config
    });
    setShowEditWidget(true);
  };

  const updateWidget = async () => {
    if (!editingWidget) return;
    
    try {
      const response = await fetch(`/api/dashboard-widgets/${editingWidget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWidget,
          dataSourceId: parseInt(newWidget.dataSourceId)
        })
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Widget updated successfully"
        });
        setShowEditWidget(false);
        setEditingWidget(null);
        setNewWidget({
          name: '',
          description: '',
          type: 'chart',
          dataSourceId: '',
          config: {}
        });
        fetchWidgets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update widget",
        variant: "destructive"
      });
    }
  };

  const deleteWidget = async (widgetId: number) => {
    if (!confirm('Are you sure you want to delete this widget?')) return;
    
    try {
      const response = await fetch(`/api/dashboard-widgets/${widgetId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Widget deleted successfully"
        });
        fetchWidgets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete widget",
        variant: "destructive"
      });
    }
  };

  const renderJsonTree = (data: any, path = '') => {
    if (typeof data !== 'object' || data === null) {
      return (
        <div className="ml-4 text-sm text-gray-600">
          {path}: {String(data)}
        </div>
      );
    }

    return Object.entries(data).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const isClickable = typeof value !== 'object' || value === null;
      
      return (
        <div key={currentPath} className="ml-4">
          <div 
            className={`text-sm font-medium p-2 rounded border-l-2 transition-all ${
              isClickable 
                ? 'cursor-pointer hover:bg-blue-50 hover:border-l-blue-400 border-l-gray-200' 
                : 'border-l-gray-100'
            }`}
            onClick={() => {
              if (isClickable) {
                setNewMapping(prev => ({ ...prev, sourceField: currentPath }));
                // Show visual feedback
                const element = document.querySelector(`[data-field="${currentPath}"]`);
                if (element) {
                  element.classList.add('bg-green-100');
                  setTimeout(() => element.classList.remove('bg-green-100'), 1000);
                }
                // Show toast notification
                toast({
                  title: "Field Selected",
                  description: `"${currentPath}" is ready to map. Click "Add Mapping" to continue.`,
                  duration: 3000
                });
              }
            }}
            data-field={currentPath}
            title={isClickable ? `Click to map "${currentPath}" field` : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-semibold">{key}</span>
                <span className="text-gray-500 text-xs">({typeof value})</span>
                {isClickable && (
                  <span className="text-xs text-blue-500 opacity-70">← click to map</span>
                )}
              </div>
              {isClickable && (
                <div className="text-xs text-gray-400">
                  📋
                </div>
              )}
            </div>
            {typeof value !== 'object' && value !== null && (
              <div className="text-gray-700 text-sm mt-1 ml-2 italic bg-gray-50 p-1 rounded">
                "{String(value)}"
              </div>
            )}
          </div>
          {typeof value === 'object' && value !== null && renderJsonTree(value, currentPath)}
        </div>
      );
    });
  };

  return (
    <AppLayout 
      title="Integration Engine" 
      subtitle="Connect external APIs, map data fields, and create reusable dashboard widgets"
    >
      <main className="flex-1 overflow-auto p-6 pt-16 md:pt-6">
        <div className="container mx-auto space-y-6">
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 border rounded p-3 text-xs">
              <strong>Debug Info:</strong> 
              Selected Data Source: {selectedDataSource ? `${selectedDataSource.name} (ID: ${selectedDataSource.id})` : 'None'} | 
              Active Tab: {activeTab} | 
              Data Sources Count: {dataSources.length} |
              Mappings Count: {mappings.length}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Integration Engine</h1>
              <p className="text-gray-600 mt-2">
                Connect external APIs, map data fields, and create reusable dashboard widgets
              </p>
            </div>
            <Button onClick={() => setShowAddDataSource(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Data Source
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
              <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
              <TabsTrigger value="data">Integrated Data</TabsTrigger>
              <TabsTrigger value="widgets">Dashboard Widgets</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid gap-4">
                {dataSources.map((source) => (
                  <Card 
                    key={source.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedDataSource?.id === source.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            {source.name}
                            <Badge variant={source.isActive ? "default" : "secondary"}>
                              {source.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {selectedDataSource?.id === source.id && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                Configuring
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{source.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(source)}
                            disabled={loading}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncData(source)}
                            disabled={loading}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncData(source, { 
                              page: 1, 
                              limit: source.defaultPageSize || 100 
                            })}
                            disabled={loading}
                          >
                            <Database className="w-4 h-4 mr-2" />
                            Sync Page 1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDataSource(source);
                              setActiveTab('mapping');
                            }}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Endpoint:</span> {source.apiEndpoint}
                        </div>
                        <div>
                          <span className="font-medium">Auth Type:</span> {source.authType}
                        </div>
                        <div>
                          <span className="font-medium">Sync Frequency:</span> {source.syncFrequency}
                        </div>
                        <div>
                          <span className="font-medium">Last Sync:</span> {
                            source.lastSyncAt 
                              ? new Date(source.lastSyncAt).toLocaleString()
                              : 'Never'
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              {selectedDataSource ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Configuring: {selectedDataSource.name}</h3>
                        <p className="text-sm text-blue-700">{selectedDataSource.apiEndpoint}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Sample Data Structure</CardTitle>
                            <CardDescription>
                              Click on field names below to auto-fill the mapping form, then click "Add Mapping"
                            </CardDescription>
                          </div>
                          {sampleData && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowRawJson(!showRawJson)}
                            >
                              {showRawJson ? "Tree View" : "Raw JSON"}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {sampleData ? (
                          <div className="max-h-96 overflow-auto border rounded p-4">
                            {showRawJson ? (
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                {JSON.stringify(sampleData, null, 2)}
                              </pre>
                            ) : (
                              renderJsonTree(sampleData)
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                            <p>Test the connection first to see sample data</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Field Mappings</CardTitle>
                            <CardDescription>
                              Map source fields to target columns
                            </CardDescription>
                          </div>
                          <Button onClick={() => setShowAddMapping(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Mapping
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {mappings.length > 0 ? (
                            mappings.map((mapping) => (
                              <div key={mapping.id} className="flex items-center justify-between p-3 border rounded">
                                <div>
                                  <div className="font-medium">{mapping.sourceField} → {mapping.targetField}</div>
                                  <div className="text-sm text-gray-500">
                                    Type: {mapping.fieldType} {mapping.isRequired && '(Required)'}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => deleteMapping(mapping.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                              <p className="mb-2">No field mappings configured</p>
                              <p className="text-sm mb-4">
                                Create mappings to transform API data into your target schema
                              </p>
                              <Button onClick={() => setShowAddMapping(true)} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Mapping
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p>Please select a data source to configure field mappings.</p>
                      {dataSources.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Quick select:</span>
                          <Select onValueChange={(value) => {
                            const source = dataSources.find(ds => ds.id === parseInt(value));
                            if (source) setSelectedDataSource(source);
                          }}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Choose data source" />
                            </SelectTrigger>
                            <SelectContent>
                              {dataSources.map((source) => (
                                <SelectItem key={source.id} value={source.id.toString()}>
                                  {source.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              {selectedDataSource ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Integrated Data - {selectedDataSource.name}</CardTitle>
                    <CardDescription>
                      View and manage synced data from your external source (showing only mapped records)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Check if integratedData is defined before filtering
                      if (!integratedData || !Array.isArray(integratedData)) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                            <p className="mb-2">Loading data...</p>
                            <p className="text-sm mb-4">
                              Please wait while we fetch the integrated data.
                            </p>
                          </div>
                        );
                      }

                      // Filter to only show records with mapped data
                      const mappedRecords = integratedData.filter(record => 
                        record.mappedData && Object.keys(record.mappedData).length > 0
                      );
                      
                      return mappedRecords.length > 0 ? (
                        <VirtualTable
                          columns={integratedDataColumns}
                          data={integratedData}
                          currentPage={currentPage}
                          pageSize={pageSize}
                          totalRecords={totalRecords}
                          loading={dataLoading}
                          onPageChange={handlePageChange}
                          onPageSizeChange={handlePageSizeChange}
                          onSort={handleSort}
                          onFilter={handleFilter}
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                          filters={filters}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                          <p className="mb-2">No mapped data available</p>
                          <p className="text-sm mb-4">
                            {(integratedData?.length ?? 0) > 0 
                              ? `${integratedData.length} records found, but none have field mappings applied. Create field mappings to see processed data here.`
                              : "No data has been synced yet. Sync your data source first, then create field mappings."
                            }
                          </p>
                          <div className="flex gap-2 justify-center">
                            {mappings.length === 0 && (
                              <Button 
                                onClick={() => setActiveTab('mapping')} 
                                variant="outline"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Create Field Mappings
                              </Button>
                            )}
                            {(integratedData?.length ?? 0) === 0 && (
                              <Button 
                                onClick={() => selectedDataSource && syncData(selectedDataSource)} 
                                variant="outline"
                                disabled={loading}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync Data
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a data source to view integrated data.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="widgets" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Dashboard Widgets</CardTitle>
                      <CardDescription>
                        Create reusable widgets for your dashboards
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowAddWidget(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Widget
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {widgets.map((widget) => (
                      <div key={widget.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <div className="font-medium">{widget.name}</div>
                          <div className="text-sm text-gray-500">Type: {widget.type}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editWidget(widget)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteWidget(widget.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Data Source Dialog */}
          <Dialog open={showAddDataSource} onOpenChange={setShowAddDataSource}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add New Data Source</DialogTitle>
                <DialogDescription>
                  Connect to an external API to start integrating data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newDataSource.name}
                      onChange={(e) => setNewDataSource(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., GitHub Audit Logs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <Select
                      value={newDataSource.syncFrequency}
                      onValueChange={(value) => setNewDataSource(prev => ({ ...prev, syncFrequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDataSource.description}
                    onChange={(e) => setNewDataSource(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this data source"
                  />
                </div>
                <div>
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input
                    id="apiEndpoint"
                    value={newDataSource.apiEndpoint}
                    onChange={(e) => setNewDataSource(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                    placeholder="https://api.example.com/data"
                  />
                </div>
                <div>
                  <Label htmlFor="authType">Authentication Type</Label>
                  <Select
                    value={newDataSource.authType}
                    onValueChange={(value) => setNewDataSource(prev => ({ ...prev, authType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer_token">Bearer Token</SelectItem>
                      <SelectItem value="basic_auth">Basic Auth</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newDataSource.authType === 'api_key' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="headerName">Header Name</Label>
                      <Input
                        id="headerName"
                        placeholder="X-API-Key"
                        onChange={(e) => setNewDataSource(prev => ({
                          ...prev,
                          authConfig: { ...prev.authConfig, headerName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Your API key"
                        onChange={(e) => setNewDataSource(prev => ({
                          ...prev,
                          authConfig: { ...prev.authConfig, apiKey: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                )}
                {/* Pagination Configuration */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Pagination Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supportsPagination">Supports Pagination</Label>
                      <Select
                        value={newDataSource.supportsPagination ? 'true' : 'false'}
                        onValueChange={(value) => setNewDataSource(prev => ({ 
                          ...prev, 
                          supportsPagination: value === 'true' 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paginationType">Pagination Type</Label>
                      <Select
                        value={newDataSource.paginationType}
                        onValueChange={(value) => setNewDataSource(prev => ({ 
                          ...prev, 
                          paginationType: value 
                        }))}
                        disabled={!newDataSource.supportsPagination}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offset">Offset/Limit</SelectItem>
                          <SelectItem value="page">Page/Per Page</SelectItem>
                          <SelectItem value="cursor">Cursor-based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="defaultPageSize">Default Page Size</Label>
                      <Input
                        id="defaultPageSize"
                        type="number"
                        min="1"
                        max="1000"
                        value={newDataSource.defaultPageSize}
                        onChange={(e) => setNewDataSource(prev => ({ 
                          ...prev, 
                          defaultPageSize: parseInt(e.target.value) || 100 
                        }))}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPageSize">Maximum Page Size</Label>
                      <Input
                        id="maxPageSize"
                        type="number"
                        min="1"
                        max="10000"
                        value={newDataSource.maxPageSize}
                        onChange={(e) => setNewDataSource(prev => ({ 
                          ...prev, 
                          maxPageSize: parseInt(e.target.value) || 1000 
                        }))}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Pagination Strategy:</strong> Configure how this API handles large datasets.
                      <br />
                      • <strong>Offset/Limit:</strong> Uses ?limit=100&offset=0 parameters
                      <br />
                      • <strong>Page/Per Page:</strong> Uses ?page=1&per_page=100 parameters  
                      <br />
                      • <strong>Cursor-based:</strong> Uses ?cursor=xyz&limit=100 parameters
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDataSource(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createDataSource}>
                    Create Data Source
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Mapping Dialog */}
          <Dialog open={showAddMapping} onOpenChange={setShowAddMapping}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add Field Mapping</DialogTitle>
                <DialogDescription>
                  Map a source field to a target column
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sourceField">Source Field</Label>
                  <Input
                    id="sourceField"
                    value={newMapping.sourceField}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, sourceField: e.target.value }))}
                    placeholder="e.g., user.email"
                  />
                </div>
                <div>
                  <Label htmlFor="targetField">Target Field</Label>
                  <Input
                    id="targetField"
                    value={newMapping.targetField}
                    onChange={(e) => setNewMapping(prev => ({ ...prev, targetField: e.target.value }))}
                    placeholder="e.g., email_address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fieldType">Field Type</Label>
                    <Select
                      value={newMapping.fieldType}
                      onValueChange={(value) => setNewMapping(prev => ({ ...prev, fieldType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultValue">Default Value</Label>
                    <Input
                      id="defaultValue"
                      value={newMapping.defaultValue}
                      onChange={(e) => setNewMapping(prev => ({ ...prev, defaultValue: e.target.value }))}
                      placeholder="Optional default value"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddMapping(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createMapping}>
                    Create Mapping
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Widget Dialog */}
          <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create Dashboard Widget</DialogTitle>
                <DialogDescription>
                  Create a reusable widget for your dashboards using integrated data
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="widgetName">Widget Name</Label>
                  <Input
                    id="widgetName"
                    value={newWidget.name}
                    onChange={(e) => setNewWidget(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Cat Facts Chart"
                  />
                </div>
                <div>
                  <Label htmlFor="widgetDescription">Description</Label>
                  <Textarea
                    id="widgetDescription"
                    value={newWidget.description}
                    onChange={(e) => setNewWidget(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this widget"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="widgetType">Widget Type</Label>
                    <Select
                      value={newWidget.type}
                      onValueChange={(value) => setNewWidget(prev => ({ ...prev, type: value, config: {} }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chart">Chart</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="metric">Metric</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="widgetDataSource">Data Source</Label>
                    <Select
                      value={newWidget.dataSourceId}
                      onValueChange={(value) => setNewWidget(prev => ({ ...prev, dataSourceId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((source) => (
                          <SelectItem key={source.id} value={source.id.toString()}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Widget Type Specific Configuration */}
                {newWidget.type === 'metric' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Metric Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valueField">Value Field</Label>
                        <Input
                          id="valueField"
                          placeholder="e.g., length"
                          value={newWidget.config.valueField || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, valueField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="metricLabel">Label</Label>
                        <Input
                          id="metricLabel"
                          placeholder="e.g., Total Facts"
                          value={newWidget.config.label || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, label: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {newWidget.type === 'chart' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Chart Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="xField">X-Axis Field</Label>
                        <Input
                          id="xField"
                          placeholder="e.g., fact"
                          value={newWidget.config.xField || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, xField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="yField">Y-Axis Field</Label>
                        <Input
                          id="yField"
                          placeholder="e.g., length"
                          value={newWidget.config.yField || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, yField: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {newWidget.type === 'table' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Table Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Quick Setup (for Cat Facts API)</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewWidget(prev => ({
                              ...prev,
                              config: {
                                ...prev.config,
                                columns: [
                                  {"field": "fact", "label": "Cat Fact", "type": "string"},
                                  {"field": "length", "label": "Length", "type": "number"}
                                ]
                              }
                            }))}
                          >
                            Use Cat Facts Columns
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewWidget(prev => ({
                              ...prev,
                              config: {
                                ...prev.config,
                                columns: [
                                  {"field": "id", "label": "ID", "type": "number"},
                                  {"field": "name", "label": "Name", "type": "string"},
                                  {"field": "value", "label": "Value", "type": "string"}
                                ]
                              }
                            }))}
                          >
                            Use Generic Columns
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Table Columns (JSON format)</Label>
                        <Textarea
                          placeholder='[{"field": "fact", "label": "Cat Fact", "type": "string"}, {"field": "length", "label": "Length", "type": "number"}]'
                          value={JSON.stringify(newWidget.config.columns || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const columns = JSON.parse(e.target.value);
                              setNewWidget(prev => ({
                                ...prev,
                                config: { ...prev.config, columns }
                              }));
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={6}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Define columns as JSON array with field, label, and type properties.
                          <br />
                          Current columns: {newWidget.config.columns ? newWidget.config.columns.length : 0}
                        </p>
                      </div>
                      
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                          <strong>Debug:</strong> Config = {JSON.stringify(newWidget.config, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {newWidget.type === 'list' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">List Configuration</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="titleField">Title Field</Label>
                        <Input
                          id="titleField"
                          placeholder="e.g., fact"
                          value={newWidget.config.titleField || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, titleField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subtitleField">Subtitle Field</Label>
                        <Input
                          id="subtitleField"
                          placeholder="e.g., length"
                          value={newWidget.config.subtitleField || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, subtitleField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="badgeField">Badge Field</Label>
                        <Input
                          id="badgeField"
                          placeholder="e.g., category"
                          value={newWidget.config.badgeField || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, badgeField: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddWidget(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createWidget}>
                    Create Widget
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Widget Dialog */}
          <Dialog open={showEditWidget} onOpenChange={setShowEditWidget}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Edit Dashboard Widget</DialogTitle>
                <DialogDescription>
                  Update your widget configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editWidgetName">Widget Name</Label>
                  <Input
                    id="editWidgetName"
                    value={newWidget.name}
                    onChange={(e) => setNewWidget(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Cat Facts Chart"
                  />
                </div>
                <div>
                  <Label htmlFor="editWidgetDescription">Description</Label>
                  <Textarea
                    id="editWidgetDescription"
                    value={newWidget.description}
                    onChange={(e) => setNewWidget(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this widget"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editWidgetType">Widget Type</Label>
                    <Select
                      value={newWidget.type}
                      onValueChange={(value) => setNewWidget(prev => ({ ...prev, type: value, config: {} }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chart">Chart</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="metric">Metric</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editWidgetDataSource">Data Source</Label>
                    <Select
                      value={newWidget.dataSourceId}
                      onValueChange={(value) => setNewWidget(prev => ({ ...prev, dataSourceId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((source) => (
                          <SelectItem key={source.id} value={source.id.toString()}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Widget Type Specific Configuration - Same as Add Dialog */}
                {newWidget.type === 'metric' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Metric Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editValueField">Value Field</Label>
                        <Input
                          id="editValueField"
                          placeholder="e.g., length"
                          value={newWidget.config.valueField || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, valueField: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editMetricLabel">Label</Label>
                        <Input
                          id="editMetricLabel"
                          placeholder="e.g., Total Facts"
                          value={newWidget.config.label || ''}
                          onChange={(e) => setNewWidget(prev => ({
                            ...prev,
                            config: { ...prev.config, label: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {newWidget.type === 'table' && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Table Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Quick Setup (for Cat Facts API)</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewWidget(prev => ({
                              ...prev,
                              config: {
                                ...prev.config,
                                columns: [
                                  {"field": "fact", "label": "Cat Fact", "type": "string"},
                                  {"field": "length", "label": "Length", "type": "number"}
                                ]
                              }
                            }))}
                          >
                            Use Cat Facts Columns
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewWidget(prev => ({
                              ...prev,
                              config: {
                                ...prev.config,
                                columns: [
                                  {"field": "id", "label": "ID", "type": "number"},
                                  {"field": "name", "label": "Name", "type": "string"},
                                  {"field": "value", "label": "Value", "type": "string"}
                                ]
                              }
                            }))}
                          >
                            Use Generic Columns
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Table Columns (JSON format)</Label>
                        <Textarea
                          placeholder='[{"field": "fact", "label": "Cat Fact", "type": "string"}, {"field": "length", "label": "Length", "type": "number"}]'
                          value={JSON.stringify(newWidget.config.columns || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const columns = JSON.parse(e.target.value);
                              setNewWidget(prev => ({
                                ...prev,
                                config: { ...prev.config, columns }
                              }));
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={6}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Define columns as JSON array with field, label, and type properties.
                          <br />
                          Current columns: {newWidget.config.columns ? newWidget.config.columns.length : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowEditWidget(false);
                    setEditingWidget(null);
                    setNewWidget({
                      name: '',
                      description: '',
                      type: 'chart',
                      dataSourceId: '',
                      config: {}
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={updateWidget}>
                    Update Widget
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </AppLayout>
  );
}