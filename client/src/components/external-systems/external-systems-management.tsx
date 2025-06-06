import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Settings, ExternalLink, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExternalSystem {
  id: number;
  systemName: string;
  displayName: string;
  baseUrl: string;
  authType: string;
  authConfig: any;
  apiEndpoints: any;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export function ExternalSystemsManagement() {
  const { toast } = useToast();
  const [systems, setSystems] = useState<ExternalSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<ExternalSystem | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    systemName: '',
    displayName: '',
    baseUrl: '',
    authType: 'bearer',
    authConfig: '{}',
    apiEndpoints: '{}',
    // User-friendly auth fields
    basicUsername: '',
    basicPassword: '',
    bearerToken: '',
    apiKeyHeader: '',
    apiKeyValue: ''
  });

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      const response = await fetch('/api/external-systems');
      if (!response.ok) throw new Error('Failed to fetch systems');
      
      const data = await response.json();
      setSystems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load external systems",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let authConfig, apiEndpoints;
      
      // Build auth config based on auth type
      if (formData.authType === 'basic' && formData.basicUsername && formData.basicPassword) {
        authConfig = {
          username: formData.basicUsername,
          password: formData.basicPassword
        };
      } else if (formData.authType === 'bearer' && formData.bearerToken) {
        authConfig = {
          token: formData.bearerToken
        };
      } else if (formData.authType === 'api_key' && formData.apiKeyHeader && formData.apiKeyValue) {
        authConfig = {
          header: formData.apiKeyHeader,
          key: formData.apiKeyValue
        };
      } else {
        // Fallback to JSON config
        try {
          authConfig = JSON.parse(formData.authConfig);
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid JSON in auth configuration or missing required fields",
            variant: "destructive"
          });
          return;
        }
      }
      
      try {
        apiEndpoints = JSON.parse(formData.apiEndpoints);
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON in API endpoints field",
          variant: "destructive"
        });
        return;
      }

      const systemData = {
        systemName: formData.systemName,
        displayName: formData.displayName,
        baseUrl: formData.baseUrl,
        authType: formData.authType,
        authConfig,
        apiEndpoints
      };

      const url = editingSystem 
        ? `/api/external-systems/${editingSystem.id}`
        : '/api/external-systems';
      
      const method = editingSystem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(systemData),
      });

      if (!response.ok) throw new Error('Failed to save system');

      toast({
        title: "Success",
        description: `External system ${editingSystem ? 'updated' : 'created'} successfully`,
      });

      setShowCreateModal(false);
      setEditingSystem(null);
      resetForm();
      fetchSystems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save external system",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (system: ExternalSystem) => {
    setEditingSystem(system);
    
    // Extract user-friendly fields from auth config
    const authConfig = system.authConfig || {};
    let basicUsername = '', basicPassword = '', bearerToken = '', apiKeyHeader = '', apiKeyValue = '';
    
    if (system.authType === 'basic') {
      basicUsername = authConfig.username || '';
      basicPassword = authConfig.password || '';
    } else if (system.authType === 'bearer') {
      bearerToken = authConfig.token || '';
    } else if (system.authType === 'api_key') {
      apiKeyHeader = authConfig.header || '';
      apiKeyValue = authConfig.key || '';
    }
    
    setFormData({
      systemName: system.systemName,
      displayName: system.displayName,
      baseUrl: system.baseUrl,
      authType: system.authType,
      authConfig: JSON.stringify(system.authConfig, null, 2),
      apiEndpoints: JSON.stringify(system.apiEndpoints, null, 2),
      basicUsername,
      basicPassword,
      bearerToken,
      apiKeyHeader,
      apiKeyValue
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (systemId: number) => {
    if (!confirm('Are you sure you want to delete this external system?')) {
      return;
    }

    try {
      const response = await fetch(`/api/external-systems/${systemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete system');

      toast({
        title: "Success",
        description: "External system deleted successfully",
      });

      fetchSystems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete external system",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      systemName: '',
      displayName: '',
      baseUrl: '',
      authType: 'bearer',
      authConfig: '{}',
      apiEndpoints: '{}',
      basicUsername: '',
      basicPassword: '',
      bearerToken: '',
      apiKeyHeader: '',
      apiKeyValue: ''
    });
    setShowPassword(false);
  };

  const testConnection = async () => {
    if (!formData.systemName || !formData.baseUrl) {
      toast({
        title: "Error",
        description: "Please fill in system name and base URL first",
        variant: "destructive"
      });
      return;
    }

    // Validate authentication configuration
    let authConfig = {};
    let validationError = '';
    
    if (formData.authType === 'basic') {
      if (!formData.basicUsername || !formData.basicPassword) {
        validationError = 'Username and password are required for Basic Authentication';
      } else {
        authConfig = {
          username: formData.basicUsername,
          password: formData.basicPassword
        };
      }
    } else if (formData.authType === 'bearer') {
      if (!formData.bearerToken) {
        validationError = 'Bearer token is required for Bearer Token Authentication';
      } else {
        authConfig = {
          token: formData.bearerToken
        };
      }
    } else if (formData.authType === 'api_key') {
      if (!formData.apiKeyHeader || !formData.apiKeyValue) {
        validationError = 'Both header name and API key value are required for API Key Authentication';
      } else {
        authConfig = {
          header: formData.apiKeyHeader,
          key: formData.apiKeyValue
        };
      }
    } else {
      // Try to parse JSON config
      try {
        authConfig = JSON.parse(formData.authConfig);
        if (Object.keys(authConfig).length === 0) {
          validationError = 'Authentication configuration cannot be empty';
        }
      } catch (error) {
        validationError = 'Invalid JSON in authentication configuration';
      }
    }

    if (validationError) {
      toast({
        title: "Authentication Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setTestingConnection(true);
    
    try {
      // Create temporary system object for testing
      const testSystem = {
        systemName: formData.systemName,
        baseUrl: formData.baseUrl,
        authType: formData.authType,
        authConfig
      };

      console.log('Testing connection with config:', {
        systemName: testSystem.systemName,
        baseUrl: testSystem.baseUrl,
        authType: testSystem.authType,
        hasAuthConfig: !!testSystem.authConfig,
        authConfigKeys: Object.keys(testSystem.authConfig)
      });

      const response = await fetch('/api/external-systems/test-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testSystem),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        toast({
          title: "Connection Test Successful! ✅",
          description: `Response time: ${result.data.response_time || 'N/A'}. System is reachable and authentication works.`,
        });
      } else {
        const errorDetails = result.data?.error_details 
          ? ` Details: ${typeof result.data.error_details === 'string' 
              ? result.data.error_details.substring(0, 100) 
              : JSON.stringify(result.data.error_details).substring(0, 100)}`
          : '';
        
        throw new Error(`${result.error_message || 'Test failed'}${errorDetails}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Test Failed ❌",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const getAuthPlaceholder = (authType: string) => {
    switch (authType) {
      case 'basic':
        return '{"username": "user@example.com", "password": "api_token"}';
      case 'bearer':
        return '{"token": "your-bearer-token"}';
      case 'api_key':
        return '{"header": "X-API-Key", "key": "your-api-key"}';
      default:
        return '{}';
    }
  };

  const getAuthDescription = (authType: string) => {
    switch (authType) {
      case 'basic':
        return 'Username and password/token for HTTP Basic Authentication';
      case 'bearer':
        return 'Bearer token for Authorization header';
      case 'api_key':
        return 'Custom header name and API key value';
      default:
        return 'Store authentication credentials as JSON';
    }
  };

  const getAuthTypeDisplay = (authType: string) => {
    switch (authType) {
      case 'basic': return 'Basic Auth';
      case 'bearer': return 'Bearer Token';
      case 'api_key': return 'API Key';
      default: return authType;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading external systems...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">External Systems</h2>
          <p className="text-gray-600">Manage external API integrations for data aggregation</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingSystem(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add System
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {editingSystem ? 'Edit External System' : 'Add External System'}
              </DialogTitle>
              <DialogDescription>
                Configure an external system for data aggregation
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={formData.systemName}
                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                    placeholder="jira, grafana, servicenow"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Jira, Grafana, ServiceNow"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="https://your-instance.atlassian.net"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="authType">Authentication Type</Label>
                <Select value={formData.authType} onValueChange={(value) => setFormData({ ...formData, authType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* User-friendly auth fields based on type */}
              {formData.authType === 'basic' && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">Basic Authentication</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="basicUsername">Username/Email</Label>
                      <Input
                        id="basicUsername"
                        type="email"
                        value={formData.basicUsername}
                        onChange={(e) => setFormData({ ...formData, basicUsername: e.target.value })}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicPassword">Password/API Token</Label>
                      <div className="relative">
                        <Input
                          id="basicPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.basicPassword}
                          onChange={(e) => setFormData({ ...formData, basicPassword: e.target.value })}
                          placeholder="password or API token"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {formData.authType === 'bearer' && (
                <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900">Bearer Token Authentication</h4>
                  <div>
                    <Label htmlFor="bearerToken">Bearer Token</Label>
                    <div className="relative">
                      <Input
                        id="bearerToken"
                        type={showPassword ? "text" : "password"}
                        value={formData.bearerToken}
                        onChange={(e) => setFormData({ ...formData, bearerToken: e.target.value })}
                        placeholder="your-bearer-token"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {formData.authType === 'api_key' && (
                <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-900">API Key Authentication</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apiKeyHeader">Header Name</Label>
                      <Input
                        id="apiKeyHeader"
                        value={formData.apiKeyHeader}
                        onChange={(e) => setFormData({ ...formData, apiKeyHeader: e.target.value })}
                        placeholder="X-API-Key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiKeyValue">API Key</Label>
                      <div className="relative">
                        <Input
                          id="apiKeyValue"
                          type={showPassword ? "text" : "password"}
                          value={formData.apiKeyValue}
                          onChange={(e) => setFormData({ ...formData, apiKeyValue: e.target.value })}
                          placeholder="your-api-key"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Advanced JSON Configuration (Collapsible) */}
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-3 cursor-pointer bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-medium">Advanced JSON Configuration (Optional)</span>
                </summary>
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="authConfig">Auth Configuration (JSON)</Label>
                    <Textarea
                      id="authConfig"
                      value={formData.authConfig}
                      onChange={(e) => setFormData({ ...formData, authConfig: e.target.value })}
                      placeholder={getAuthPlaceholder(formData.authType)}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {getAuthDescription(formData.authType)}. This will override the fields above if provided.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="apiEndpoints">API Endpoints (JSON)</Label>
                    <Textarea
                      id="apiEndpoints"
                      value={formData.apiEndpoints}
                      onChange={(e) => setFormData({ ...formData, apiEndpoints: e.target.value })}
                      placeholder='{"default": "/api/data/{identifier}", "webUrl": "/view/{identifier}"}'
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Define API endpoint templates. Use {"{identifier}"} as placeholder for external identifiers.
                    </p>
                  </div>
                </div>
              </details>
              
              {/* Test Connection Button */}
              {formData.systemName && formData.baseUrl && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={testingConnection}
                    className="w-full"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSystem ? 'Update' : 'Create'} System
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {systems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No External Systems</h3>
              <p className="text-gray-600 mb-4">
                Add external systems to enable data aggregation for clients
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First System
              </Button>
            </CardContent>
          </Card>
        ) : (
          systems.map((system) => (
            <Card key={system.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {system.displayName}
                      <span className="text-sm font-normal text-gray-500">({system.systemName})</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      {system.baseUrl}
                    </CardDescription>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(system)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(system.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Auth Type:</span> {getAuthTypeDisplay(system.authType)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      system.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {system.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 