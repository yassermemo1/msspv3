import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Settings, Trash2, Edit, BarChart3, Table, TrendingUp, List, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/app-layout';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { WidgetConfigModal } from '@/components/dashboard/widget-config-modal';
import EnhancedDashboard from '@/components/dashboard/enhanced-dashboard';

interface Dashboard {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  widgets?: Widget[];
}

interface Widget {
  id: number;
  dashboardId: number;
  title: string;
  widgetType: string;
  dataSource: string;
  config: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DataSource {
  name: string;
  columns: string[];
}

export default function DashboardPage() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  // If no dashboardId provided, show the main enhanced dashboard
  if (!dashboardId) {
    return (
      <AppLayout title="Executive Dashboard" subtitle="Real-time insights and analytics">
        <div className="p-6">
          <EnhancedDashboard />
        </div>
      </AppLayout>
    );
  }

  // Fetch dashboard data
  const fetchDashboard = async () => {
    if (!dashboardId) return;
    
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Dashboard not found",
            description: "The requested dashboard could not be found.",
            variant: "destructive"
          });
          setLocation('/dashboards');
          return;
        }
        throw new Error('Failed to fetch dashboard');
      }
      
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available data sources
  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/system/datasources');
      if (!response.ok) throw new Error('Failed to fetch data sources');
      
      const data = await response.json();
      setDataSources(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data sources",
        variant: "destructive"
      });
    }
  };

  // Create new widget
  const createWidget = async (widgetData: any) => {
    if (!dashboardId) return;
    
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/widgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(widgetData),
      });

      if (!response.ok) throw new Error('Failed to create widget');

      const newWidget = await response.json();
      
      setDashboard(prev => prev ? {
        ...prev,
        widgets: [...(prev.widgets || []), newWidget]
      } : null);

      toast({
        title: "Success",
        description: "Widget created successfully",
      });
      
      setShowWidgetModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create widget",
        variant: "destructive"
      });
    }
  };

  // Update widget
  const updateWidget = async (widgetId: number, widgetData: any) => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(widgetData),
      });

      if (!response.ok) throw new Error('Failed to update widget');

      const updatedWidget = await response.json();
      
      setDashboard(prev => prev ? {
        ...prev,
        widgets: (prev.widgets || []).map(w => w.id === widgetId ? updatedWidget : w)
      } : null);

      toast({
        title: "Success",
        description: "Widget updated successfully",
      });
      
      setShowWidgetModal(false);
      setEditingWidget(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update widget",
        variant: "destructive"
      });
    }
  };

  // Delete widget
  const deleteWidget = async (widgetId: number) => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete widget');

      setDashboard(prev => prev ? {
        ...prev,
        widgets: (prev.widgets || []).filter(w => w.id !== widgetId)
      } : null);

      toast({
        title: "Success",
        description: "Widget deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete widget",
        variant: "destructive"
      });
    }
  };

  // Update widget positions
  const updateWidgetPositions = async (widgets: Widget[]) => {
    try {
      // Here you would typically send the new positions to the server
      setDashboard(prev => prev ? { ...prev, widgets } : null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update widget positions",
        variant: "destructive"
      });
    }
  };

  // Handle widget save
  const handleWidgetSave = (widgetData: any) => {
    if (editingWidget) {
      updateWidget(editingWidget.id, widgetData);
    } else {
      createWidget(widgetData);
    }
  };

  // Handle edit widget
  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
    setShowWidgetModal(true);
  };

  // Handle delete widget
  const handleDeleteWidget = (widgetId: number) => {
    if (confirm('Are you sure you want to delete this widget?')) {
      deleteWidget(widgetId);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchDashboard();
    fetchDataSources();
  }, [dashboardId]);

  if (loading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading dashboard...">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!dashboard) {
    return (
      <AppLayout title="Dashboard" subtitle="Dashboard not found">
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Dashboard not found</h3>
                <p className="text-gray-600 mb-4">The requested dashboard could not be found.</p>
                <Button onClick={() => setLocation('/dashboards')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={dashboard.name} subtitle="Custom dashboard with interactive widgets">
      <div className="p-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/dashboards')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboards
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{dashboard.name}</h1>
              <p className="text-gray-600">
                {dashboard.widgets?.length || 0} widgets
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                setEditingWidget(null);
                setShowWidgetModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <DashboardGrid
          widgets={dashboard.widgets || []}
          onUpdatePositions={updateWidgetPositions}
          onEditWidget={handleEditWidget}
          onDeleteWidget={handleDeleteWidget}
        />

        {/* Widget Configuration Modal */}
        <WidgetConfigModal
          open={showWidgetModal}
          onOpenChange={setShowWidgetModal}
          dataSources={dataSources}
          widget={editingWidget}
          onSave={handleWidgetSave}
          onCancel={() => {
            setShowWidgetModal(false);
            setEditingWidget(null);
          }}
        />
      </div>
    </AppLayout>
  );
} 