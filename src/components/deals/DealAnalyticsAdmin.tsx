import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  RefreshCw, TrendingUp, Eye, ExternalLink, Calendar,
  BarChart3, Filter
} from "lucide-react";
import { AuthService } from "../../utils/auth";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

interface AnalyticsData {
  retailerId: string;
  companyName: string;
  views: number;
  redirects: number;
}

type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export function DealAnalyticsAdmin() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TimeFilter>('all');

  useEffect(() => {
    loadAnalytics();
  }, [filter]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = await AuthService.getFreshToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`${API_URL}/deals/admin/analytics?filter=${filter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAnalytics(result.analytics);
      } else {
        toast.error(result.error || "Failed to load analytics");
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
  const totalRedirects = analytics.reduce((sum, a) => sum + a.redirects, 0);
  const avgConversionRate = totalViews > 0 ? ((totalRedirects / totalViews) * 100).toFixed(1) : '0.0';

  const getFilterLabel = () => {
    switch (filter) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'all': return 'All Time';
      default: return 'All Time';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deal Analytics</h2>
          <p className="text-sm text-gray-600">
            Track views and click-through rates for each retailer
          </p>
        </div>
        <Button
          onClick={loadAnalytics}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Time Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year', 'all'] as TimeFilter[]).map((f) => (
                <Button
                  key={f}
                  onClick={() => setFilter(f)}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                >
                  {f === 'day' && 'Today'}
                  {f === 'week' && 'Week'}
                  {f === 'month' && 'Month'}
                  {f === 'year' && 'Year'}
                  {f === 'all' && 'All Time'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold mt-1">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Redirects</p>
                <p className="text-3xl font-bold mt-1">{totalRedirects.toLocaleString()}</p>
              </div>
              <ExternalLink className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Conversion Rate</p>
                <p className="text-3xl font-bold mt-1">{avgConversionRate}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Retailer Performance</CardTitle>
              <CardDescription>
                {getFilterLabel()} - Showing {analytics.length} retailer{analytics.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <BarChart3 className="h-3 w-3 mr-1" />
              Click-through Analytics
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : analytics.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No analytics data available for this time period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Retailer</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        Views
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center justify-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Redirects
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Conversion
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((retailer, index) => {
                    const conversionRate = retailer.views > 0 
                      ? ((retailer.redirects / retailer.views) * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <tr 
                        key={retailer.retailerId} 
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 text-gray-600">
                          {index + 1}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium">{retailer.companyName}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="font-mono">
                            {retailer.views.toLocaleString()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="font-mono">
                            {retailer.redirects.toLocaleString()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge 
                            variant={parseFloat(conversionRate) > 10 ? "default" : "secondary"}
                            className="font-mono"
                          >
                            {conversionRate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {!isLoading && analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.slice(0, 3).map((retailer, index) => (
                <div key={retailer.retailerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{retailer.companyName}</p>
                    <p className="text-sm text-gray-600">
                      {retailer.views} views → {retailer.redirects} clicks
                    </p>
                  </div>
                  <Badge variant="default">
                    Top Performer
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
